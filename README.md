# Trichella

**AI Scalp Diagnostics** — Full-stack trichological platform. Upload a scalp image, get an AI-powered report: overall score, 6 diagnostic conditions, metrics (density, inflammation, sebum, hydration, follicle health, scalp type), clinical findings, and personalised recommendations. Export reports as PDF.

**Public repo:** [github.com/darderrdur17/Trichella](https://github.com/darderrdur17/Trichella)

---

## Quick start

1. **Open the app folder and set your API key**
   ```bash
   cd trichella-app
   cp .env.example .env
   # Edit .env: set OPENAI_API_KEY=... (get one at https://platform.openai.com/api-keys)
   ```

2. **Run backend and frontend**
   ```bash
   # From repo root
   npm run dev:all
   ```
   - **API:** http://localhost:3001  
   - **App:** http://localhost:5173  

   Or from `trichella-app`: run `npm run server` in one terminal and `npm run dev` in another.

3. **Use the app**
   - Open http://localhost:5173  
   - Sign in or continue as Demo  
   - **New Scan** → upload a scalp image → get AI report (score, 6 conditions, metrics, findings, recommendations).  
   - **Save as PDF** from the Results page to download a formatted report.

---

## Project structure

| Path | Description |
|------|-------------|
| `trichella-app/` | Vite + React app and Express (or Vercel serverless) API |
| `trichella-app/api/analyse.js` | Serverless handler for `/api/analyse` (OpenAI GPT-4o) |
| `trichella-app/src/lib/pdfReport.js` | PDF export (jsPDF) — matches Results page layout |
| `Images (data)/` | Local dataset for testing (not in git; see `.gitignore`) |

---

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend only (Vite, port 5173) |
| `npm run server` | Backend only (Express, port 3001) |
| `npm run dev:all` | Both frontend and backend (concurrently) |

From `trichella-app`: same scripts, plus `npm run build`, `npm run preview`.

---

## Environment

- **OPENAI_API_KEY** (required for analysis) — [OpenAI API keys](https://platform.openai.com/api-keys).  
- **OPENAI_MODEL** (optional) — default `gpt-4o`.  
- **PORT** — backend port (default `3001`).  
- **VITE_API_URL** — optional; set to your API base URL when using an external backend (e.g. Railway).

---

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.  
2. Import **GitHub** and select **darderrdur17/Trichella**.  
3. Set **Root Directory** to **`trichella-app`** (so Vite and `vercel.json` are used).  
4. Add **Environment Variable:** `OPENAI_API_KEY` = your OpenAI key.  
5. Deploy. App: `https://your-project.vercel.app`; `/api/analyse` runs as a serverless function.

**Note:** Vercel has a ~4.5 MB request body limit. For large images, compress or resize before upload, or host the API elsewhere and set `VITE_API_URL`.

---

## Tech and design

- **Frontend:** React 19, Vite, Recharts, Lucide icons. Flow: Landing → Auth → Dashboard → Scan → Results (with PDF export) → History → Pro Mode / Training Hub / Settings.  
- **Storage:** `localStorage` (or Cursor Artifacts storage when available).  
- **AI:** POST image (base64) to `/api/analyse` → OpenAI GPT-4o returns structured report (overall score, 6 conditions, metrics, findings, recommendations, urgency, nextScanDays).  
- **Design:** Dark clinical luxury — deep charcoal, gold accents, sage/terra/amber health indicators. Cormorant Garamond + Outfit.

---

## Dataset (Images)

Scalp images for testing or Ground Truth training live in **`Images (data)`** (sibling to `trichella-app`), organised by subject. Use **New Scan** to upload any image, or **Training Hub** (Pro) to submit image + professional metrics for AI training.

---

## Troubleshooting

**“Analysis failed” or can’t upload**
- Ensure the backend is running: `npm run server` or `npm run dev:all`.  
- Set `OPENAI_API_KEY` in `trichella-app/.env`.  
- Use JPG, PNG, BMP, or HEIC; if the picker doesn’t open, click the drop zone.

**API details**  
- **Endpoint:** `POST /api/analyse` (body: `{ b64, mime }`).  
- **Response:** `{ report: { overallScore, summary, conditions, primaryCondition, metrics, findings, recommendations, urgency, nextScanDays } }`.  
- See `trichella-app/API.md` for a cURL example and full schema.
