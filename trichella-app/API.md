# Scalp analysis API

The AI that analyses the hair scalp is exposed as a **single HTTP endpoint** on your backend. The backend uses the **Google Gemini Vision API** (e.g. `gemini-2.0-flash`) to produce the report.

## Endpoint

| Method | URL (when using dev server) | Description |
|--------|-----------------------------|-------------|
| **POST** | `http://localhost:3001/api/analyse` | Run scalp analysis on one image |

When you run `npm run dev`, the frontend is at `http://localhost:5173` and calls `/api/analyse`; Vite proxies that to `http://localhost:3001/api/analyse`.

## Request

- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  - `b64` (string, required) — base64-encoded image (no `data:image/...;base64,` prefix).
  - `mime` (string, optional) — MIME type of the image, e.g. `image/jpeg`, `image/png`, `image/bmp`. Defaults to `image/jpeg` if omitted.

Example:

```json
{
  "b64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "mime": "image/jpeg"
}
```

## Response

- **200 OK** — body is JSON: `{ "report": { ... } }` with the full diagnostic report (see below).
- **400** — missing `b64` or invalid body; body: `{ "error": "..." }`.
- **500** — backend error or Anthropic API error (e.g. `ANTHROPIC_API_KEY is not set`); body: `{ "error": "..." }`.

Report shape (summary):

- `overallScore` (0–100)
- `summary`, `primaryCondition`, `conditions[]`
- `metrics`: `density`, `inflammation`, `sebumLevel`, `hydration`, `follicleHealth`, `scalpType`
- `findings[]`, `recommendations[]`, `urgency`, `nextScanDays`

## How to run the API

1. Set your Gemini API key in `.env`:  
   `GEMINI_API_KEY=...`  
   Get a key at [Google AI Studio](https://aistudio.google.com/apikey).
2. (Optional) Set `GEMINI_MODEL` to use a different model (default: `gemini-2.0-flash`).
3. Start the backend:  
   `npm run server`  
   (or run both frontend and backend: `npm run dev:all`)

The backend uses the **Google Gemini generateContent API** (vision-capable model, e.g. `gemini-2.0-flash`) with a fixed trichology prompt and `responseMimeType: application/json` to produce the structured report.

## cURL example

```bash
# Replace BASE64_STRING and optionally MIME
curl -X POST http://localhost:3001/api/analyse \
  -H "Content-Type: application/json" \
  -d '{"b64":"BASE64_STRING","mime":"image/jpeg"}'
```
