/**
 * Trichella backend — scalp analysis via OpenAI (GPT-4o). Set OPENAI_API_KEY in .env.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAnalysis } from "../lib/analyse.js";
import { saveTrichellaScanToDrive, uploadScalpImageToDrive } from "../lib/googleDrive.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "20mb" }));

app.post("/api/analyse", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not set. Add it to trichella-app/.env and restart the server (npm run server).",
    });
  }

  let { b64, mime, lang, scanId } = req.body || {};
  if (!b64) {
    return res.status(400).json({ error: "Missing b64 (base64 image data)" });
  }
  if (!mime) mime = "image/jpeg";
  if (mime === "image/x-ms-bmp") mime = "image/bmp";

  try {
    const report = await runAnalysis(b64, mime, lang);
    let drive = { skipped: true, reason: "not attempted" };
    if (process.env.TRICHELLA_DISABLE_DRIVE_SAVE !== "1") {
      drive = await saveTrichellaScanToDrive({
        base64: b64,
        mimeType: mime,
        report,
        scanId: scanId || `srv-${Date.now()}`,
      });
    }
    return res.json({ report, drive });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Analysis failed" });
  }
});

app.post("/api/upload-drive", async (req, res) => {
  const { b64, mime, scanId } = req.body || {};
  if (!b64) {
    return res.status(400).json({ error: "Missing b64" });
  }
  try {
    const result = await uploadScalpImageToDrive({
      base64: b64,
      mimeType: mime || "image/jpeg",
      scanId,
    });
    if (result.skipped) {
      return res.json({ skipped: true, message: result.reason });
    }
    return res.json({ ok: true, fileId: result.fileId, name: result.name });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Drive upload failed" });
  }
});

/** GET /api/drive-status — diagnose Drive connection without uploading */
app.get("/api/drive-status", async (req, res) => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const hasKey = !!process.env.GOOGLE_PRIVATE_KEY?.trim();
  const imageFolder = process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID?.trim() || process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const reportFolder = process.env.GOOGLE_DRIVE_REPORT_FOLDER_ID?.trim() || imageFolder;

  if (!email || !hasKey || !imageFolder) {
    return res.json({ ok: false, reason: "Missing env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_DRIVE_FOLDER_ID" });
  }

  try {
    const { google } = await import("googleapis");
    const rawKey = process.env.GOOGLE_PRIVATE_KEY.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({ email, key: rawKey, scopes: ["https://www.googleapis.com/auth/drive"] });
    await auth.authorize();
    const drive = google.drive({ version: "v3", auth });

    const checkFolder = async (folderId, label) => {
      try {
        const { data } = await drive.files.get({ fileId: folderId, fields: "id,name,mimeType", supportsAllDrives: true });
        if (data.mimeType !== "application/vnd.google-apps.folder") return { ok: false, error: `ID is not a folder (${data.mimeType})` };
        return { ok: true, name: data.name };
      } catch (e) {
        const code = e?.code || e?.response?.status;
        if (code === 404) return { ok: false, error: "Folder not found — share it with the service account as Editor" };
        return { ok: false, error: e.message };
      }
    };

    const imgCheck = await checkFolder(imageFolder, "imageFolder");
    const rptCheck = reportFolder !== imageFolder ? await checkFolder(reportFolder, "reportFolder") : imgCheck;

    return res.json({
      ok: imgCheck.ok && rptCheck.ok,
      serviceAccount: email,
      imageFolder: { id: imageFolder, ...imgCheck },
      reportFolder: { id: reportFolder, ...rptCheck },
    });
  } catch (e) {
    console.error("[Drive status]", e);
    return res.json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Trichella API (OpenAI) running at http://localhost:${PORT}`);
  console.log(`Drive status check: http://localhost:${PORT}/api/drive-status`);
});
