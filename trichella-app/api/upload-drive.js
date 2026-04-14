/**
 * POST /api/upload-drive — save scalp image to XDi Google Drive (Trichella folder).
 * Configure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID.
 */
import { uploadScalpImageToDrive } from "../lib/googleDrive.js";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      return res.status(200).json({ skipped: true, message: result.reason });
    }

    return res.status(200).json({ ok: true, fileId: result.fileId, name: result.name });
  } catch (e) {
    console.error("Drive upload error:", e);
    return res.status(500).json({ error: e.message || "Drive upload failed" });
  }
}
