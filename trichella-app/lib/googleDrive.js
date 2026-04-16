/**
 * Google Drive uploads for Trichella — configurable folder(s): one default or separate image / report folders.
 */

import { google } from "googleapis";

/** Accepts a raw folder ID or a full `drive.google.com/.../folders/ID` URL (common misconfiguration). */
export function parseDriveFolderId(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const fromUrl = s.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fromUrl) return fromUrl[1];
  return s.replace(/^\/+|\/+$/g, "");
}

function extFromMime(mime) {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("bmp")) return "bmp";
  return "bin";
}

function normalizePrivateKey(raw) {
  let k = (raw || "").trim();
  if (k.startsWith('"') && k.endsWith('"')) k = k.slice(1, -1);
  return k.replace(/\\n/g, "\n");
}

/**
 * Resolve image vs report folder IDs. Falls back to GOOGLE_DRIVE_FOLDER_ID for any unset role.
 * Optional: GOOGLE_DRIVE_IMAGE_FOLDER_ID, GOOGLE_DRIVE_REPORT_FOLDER_ID for separate destinations.
 */
export function resolveDriveFolderIds() {
  const base = parseDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
  const imageFolderId = parseDriveFolderId(process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID) || base;
  const reportFolderId = parseDriveFolderId(process.env.GOOGLE_DRIVE_REPORT_FOLDER_ID) || base;

  if (!imageFolderId || !reportFolderId) {
    return { ok: false, reason: "Set GOOGLE_DRIVE_FOLDER_ID, or set both GOOGLE_DRIVE_IMAGE_FOLDER_ID and GOOGLE_DRIVE_REPORT_FOLDER_ID." };
  }
  return {
    ok: true,
    imageFolderId,
    reportFolderId,
    sameFolder: imageFolderId === reportFolderId,
  };
}

async function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  const resolved = resolveDriveFolderIds();
  if (!resolved.ok) {
    return { skipped: true, reason: resolved.reason };
  }

  if (!clientEmail || !privateKey) {
    return { skipped: true, reason: "Google Drive env vars not set" };
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  await auth.authorize();
  const drive = google.drive({ version: "v3", auth });
  const { imageFolderId, reportFolderId, sameFolder } = resolved;
  /** @deprecated use imageFolderId / reportFolderId — kept for callers expecting single folder */
  const folderId = imageFolderId;
  return { drive, folderId, imageFolderId, reportFolderId, sameFolder };
}

async function verifyIsFolder(drive, folderId, label) {
  try {
    const { data } = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });
    if (data.mimeType !== "application/vnd.google-apps.folder") {
      throw new Error(
        `${label}: ID is not a folder (got ${data.mimeType}). Paste the folder URL from Drive (…/folders/FOLDER_ID), not a file link.`
      );
    }
    return data;
  } catch (e) {
    const code = e?.code || e?.response?.status;
    const msg = e?.message || String(e);
    if (code === 404 || /not found/i.test(msg)) {
      throw new Error(
        `${label}: folder not found or service account cannot access it. Share the folder with the service account (Editor).`
      );
    }
    throw e;
  }
}

async function createFile(drive, folderId, name, buffer, mimeType) {
  const { data } = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: buffer,
    },
    supportsAllDrives: true,
    fields: "id, name",
  });
  return data;
}

const RETRIES = 2;

async function withRetry(fn) {
  let lastErr;
  for (let i = 0; i <= RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < RETRIES) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

/**
 * Save scalp image + AI report JSON into configured Drive folder(s) (paired filenames).
 * @returns {{ ok: boolean, skipped?: boolean, reason?: string, imageName?: string, reportName?: string, sameFolder?: boolean, error?: string }}
 */
export async function saveTrichellaScanToDrive({ base64, mimeType, report, scanId }) {
  let ctx;
  try {
    ctx = await getDriveClient();
  } catch (e) {
    return { ok: false, error: e.message || "Drive auth failed" };
  }

  if (ctx.skipped) {
    return { ok: false, skipped: true, reason: ctx.reason };
  }

  const { drive, imageFolderId, reportFolderId, sameFolder } = ctx;
  try {
    await verifyIsFolder(drive, imageFolderId, "Image folder");
    if (reportFolderId !== imageFolderId) {
      await verifyIsFolder(drive, reportFolderId, "Report folder");
    }
  } catch (e) {
    console.error("[Trichella Drive] folder check:", e);
    return { ok: false, error: e.message || "Drive folder validation failed" };
  }

  const buffer = Buffer.from(base64, "base64");
  const ext = extFromMime(mimeType);
  const iso = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const safeId = String(scanId || Date.now()).replace(/[^\w-]/g, "").slice(0, 24) || String(Date.now());
  const base = `Trichella_Scan_${iso}_${safeId}`;

  const imageName = `${base}_image.${ext}`;
  const reportName = `${base}_report.json`;

  const payload = {
    scanId: safeId,
    savedAt: new Date().toISOString(),
    trichellaVersion: "1",
    mimeType: mimeType || "image/jpeg",
    report,
  };

  const jsonBuf = Buffer.from(JSON.stringify(payload, null, 2), "utf8");

  try {
    await withRetry(() => createFile(drive, imageFolderId, imageName, buffer, mimeType || "image/jpeg"));
    await withRetry(() => createFile(drive, reportFolderId, reportName, jsonBuf, "application/json"));
    return { ok: true, imageName, reportName, sameFolder };
  } catch (e) {
    console.error("[Trichella Drive] saveTrichellaScanToDrive:", e);
    return { ok: false, error: e.message || "Drive upload failed" };
  }
}

/**
 * Image-only upload (optional /api/upload-drive — prefer server save in /api/analyse).
 */
export async function uploadScalpImageToDrive({ base64, mimeType, scanId }) {
  let ctx;
  try {
    ctx = await getDriveClient();
  } catch (e) {
    return { ok: false, error: e.message || "Drive auth failed" };
  }
  if (ctx.skipped) return { ok: false, skipped: true, reason: ctx.reason };

  const { drive, imageFolderId } = ctx;
  try {
    await verifyIsFolder(drive, imageFolderId, "Image folder");
  } catch (e) {
    console.error("[Trichella Drive] folder check:", e);
    return { ok: false, error: e.message || "Drive folder validation failed" };
  }

  const buffer = Buffer.from(base64, "base64");
  const ext = extFromMime(mimeType);
  const iso = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const safeId = String(scanId || Date.now()).slice(-12);
  const fileName = `Trichella_Scalp_${iso}_${safeId}.${ext}`;

  try {
    const data = await withRetry(() =>
      createFile(drive, imageFolderId, fileName, buffer, mimeType || "image/jpeg")
    );
    return { ok: true, fileId: data.id, name: data.name };
  } catch (e) {
    console.error("[Trichella Drive] uploadScalpImageToDrive:", e);
    return { ok: false, error: e.message || "Drive upload failed" };
  }
}
