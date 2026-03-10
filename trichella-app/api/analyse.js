/**
 * Vercel serverless function — POST /api/analyse (same as local server).
 * Set OPENAI_API_KEY in Vercel project Environment Variables.
 */
import { runAnalysis } from "../lib/analyse.js";

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

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not set. Add it in Vercel Project Settings → Environment Variables.",
    });
  }

  let { b64, mime } = req.body || {};
  if (!b64) {
    return res.status(400).json({ error: "Missing b64 (base64 image data)" });
  }
  if (!mime) mime = "image/jpeg";
  if (mime === "image/x-ms-bmp") mime = "image/bmp";

  try {
    const report = await runAnalysis(b64, mime);
    return res.status(200).json({ report });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Analysis failed" });
  }
}
