/**
 * Upload scalp scan images to a Google Drive folder (XDi / Trichella).
 * Uses a service account; the target folder must be shared with that account (Editor).
 */

import { google } from "googleapis";

function extFromMime(mime) {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("bmp")) return "bmp";
  return "bin";
}

/**
 * @returns {{ ok: boolean, skipped?: boolean, reason?: string, fileId?: string }}
 */
export async function uploadScalpImageToDrive({ base64, mimeType, scanId }) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

  if (!clientEmail || !privateKey || !folderId) {
    return { ok: false, skipped: true, reason: "Google Drive env vars not set" };
  }

  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    /* Full Drive scope so uploads to a folder shared with the SA work reliably (Workspace / Shared drives). */
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  await auth.authorize();
  const drive = google.drive({ version: "v3", auth });

  const buffer = Buffer.from(base64, "base64");
  const ext = extFromMime(mimeType);
  const iso = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const safeId = String(scanId || Date.now()).slice(-12);
  const fileName = `Trichella_Scalp_${iso}_${safeId}.${ext}`;

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType || "image/jpeg",
      body: buffer,
    },
    supportsAllDrives: true,
    fields: "id, name",
  });

  return { ok: true, fileId: data.id, name: data.name };
}
