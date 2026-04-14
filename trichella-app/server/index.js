/**
 * Trichella backend — scalp analysis via OpenAI (GPT-4o). Set OPENAI_API_KEY in .env.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAnalysis } from "../lib/analyse.js";
import { uploadScalpImageToDrive } from "../lib/googleDrive.js";

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

  let { b64, mime, lang } = req.body || {};
  if (!b64) {
    return res.status(400).json({ error: "Missing b64 (base64 image data)" });
  }
  if (!mime) mime = "image/jpeg";
  if (mime === "image/x-ms-bmp") mime = "image/bmp";

  try {
    const report = await runAnalysis(b64, mime, lang);
    return res.json({ report });
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

app.listen(PORT, () => {
  console.log(`Trichella API (OpenAI) running at http://localhost:${PORT}`);
});
