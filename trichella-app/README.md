# Trichella — AI Scalp Diagnostics

Full-stack MVP for the Trichella trichological diagnostic platform. React frontend + OpenAI (GPT-4o) for scalp image analysis. Runs locally or on Vercel.

## Quick start

1. **Copy env and set your API key**
   ```bash
   cp .env.example .env
   # Edit .env and set OPENAI_API_KEY=... (get one at https://platform.openai.com/api-keys)
   ```

2. **Run backend and frontend together**
   ```bash
   npm run dev:all
   ```
   - API: http://localhost:3001  
   - App: http://localhost:5173  

   Or run separately: `npm run server` in one terminal, `npm run dev` in another.

3. **Use the app**
   - Open http://localhost:5173  
   - Sign in (or “Continue as Demo”)  
   - New Scan → upload a scalp image → get AI report (6 conditions, metrics, recommendations)

## Dataset (Images)

Scalp images for testing or Ground Truth training live in the project folder **`Images (data)`** (sibling to `trichella-app`), organized by subject with `.jpg` / `.bmp` files. Use “New Scan” to upload any of these, or “Training Hub” to submit image + professional metrics pairs.

## Scripts

| Command       | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Frontend only (Vite, port 5173)      |
| `npm run server` | Backend only (Express, port 3001) |
| `npm run dev:all` | Both (concurrently)              |
| `npm run build`   | Production build                    |
| `npm run preview` | Preview production build            |

## Env

- **OPENAI_API_KEY** (required for analysis) — from [OpenAI API keys](https://platform.openai.com/api-keys).  
- **OPENAI_MODEL** (optional) — default `gpt-4o`.  
- **PORT** — backend port (local), default `3001`.

## Deploy to Vercel

1. Push this repo to GitHub (or connect another Git provider in Vercel).
2. In [Vercel](https://vercel.com): **Add New Project** → import this repo.
3. Set **Root Directory** to `trichella-app` (so Vercel builds the app and finds `api/`).
4. Add **Environment Variable**: `OPENAI_API_KEY` = your OpenAI key (Production / Preview / Development as needed).
5. Deploy. The app will be at `https://your-project.vercel.app`; `/api/analyse` runs as a serverless function.

**Note:** Vercel has a 4.5 MB request body limit. For large scalp images, compress or resize before upload, or host the API elsewhere (e.g. Railway) and set `VITE_API_URL` to that URL.

## Architecture

- **Frontend:** React 19, Recharts, Lucide; single-page flow: Landing → Auth → Dashboard → Scan → Results → History / Training Hub / Pro / Settings.  
- **Storage:** `localStorage`.  
- **AI:** POST image (base64) to `/api/analyse` → OpenAI GPT-4o returns structured report (6 conditions, metrics, recommendations). Locally: Express server; on Vercel: serverless function in `api/analyse.js`.

See **`Trichella.md`** in the project root for full product and developer documentation.

---

## Troubleshooting

**I can’t upload a picture / “Analysis failed”**

1. **Backend must be running** — The app sends the image to `POST /api/analyse` (proxied to `http://localhost:3001`). Start it with:
   ```bash
   npm run server
   ```
   Or run both app and API: `npm run dev:all`.

2. **Set the API key** — In `trichella-app` create `.env` with:
   ```bash
   OPENAI_API_KEY=your_key_here
   ```
   Get a key at [OpenAI API keys](https://platform.openai.com/api-keys).

3. **Supported files** — Use JPG, PNG, BMP, or HEIC. If the file picker doesn’t open, click the drop zone (“Drop your scalp photo here” or “or click to browse”).

**What is the API for the AI to analyse the hair scalp?**

- **Endpoint:** `POST /api/analyse` (full URL when backend runs: `http://localhost:3001/api/analyse`).
- **Request body:** JSON with `b64` (base64 image string) and `mime` (e.g. `image/jpeg`).
- **Response:** JSON `{ "report": { ... } }` with score, conditions, metrics, recommendations.

Details and a cURL example: see **`API.md`** in this folder.
