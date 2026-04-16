# Save Trichella scans to XDi’s Google Drive

Each successful scalp scan uploads the **same image sent to the AI** plus a **JSON report** into **Google Drive folder(s)** you configure (for example **Trichella → Scalp_scans** for images and **Trichella → Reports** for JSON). Uploads run on the **server** (never expose Google keys in the browser).

## How it works

1. You create a **Google Cloud service account** and one or more **Drive folders** shared with that account (**Editor**).
2. You set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and at least **`GOOGLE_DRIVE_FOLDER_ID`** (or the optional split-folder variables below).
3. After analysis succeeds, the server saves in one request:  
   `Trichella_Scan_<timestamp>_<id>_image.<ext>` and `Trichella_Scan_<timestamp>_<id>_report.json`.  
   Optional `POST /api/upload-drive` can upload an image only (same image folder).

If Drive env vars are **not** set, uploads are **skipped** and the app still works normally.

### One folder vs respective folders

- **Single folder (typical):** set only `GOOGLE_DRIVE_FOLDER_ID`. Both the scalp image and the JSON report are created **inside that folder**.
- **Split destinations:** set `GOOGLE_DRIVE_IMAGE_FOLDER_ID` and/or `GOOGLE_DRIVE_REPORT_FOLDER_ID`. Any role you omit falls back to `GOOGLE_DRIVE_FOLDER_ID`. You must still set `GOOGLE_DRIVE_FOLDER_ID` unless **both** image and report folder IDs are set explicitly.
- You may paste either the **raw folder ID** or the **full browser URL** (`…/folders/FOLDER_ID`); the server extracts the ID.
- Before uploading, the server checks that each ID is a **folder** the service account can open (so file links or wrong shares fail with a clear error).

**XDi two-folder layout (Scalp_scans + Scalp_scans_results):** Use **`Scalp_scans`** for uploaded scalp images and **`Scalp_scans_results`** for JSON reports. Set `GOOGLE_DRIVE_FOLDER_ID` to the **Scalp_scans** folder ID (this also acts as the default for anything not overridden). Set **`GOOGLE_DRIVE_REPORT_FOLDER_ID`** to the **Scalp_scans_results** folder ID. You do not need `GOOGLE_DRIVE_IMAGE_FOLDER_ID` unless you want to override the image folder separately. Share **both** folders with the service account as **Editor**.

---

## Step 1 — Folder on XDi Google Drive

1. Sign in to the **XDi** Google account (or the account that owns the Trichella data area).
2. In **Google Drive**, create folders as you prefer, for example:
   - `Trichella`
   - Inside it: `Scalp_scans` (or any name you like).
3. Open the **inner** folder (where files should land).
4. Copy the **folder ID** from the browser URL:
   - URL looks like `https://drive.google.com/drive/folders/THIS_PART_IS_THE_ID`
5. Keep that ID — you will use it as `GOOGLE_DRIVE_FOLDER_ID`.

---

## Step 2 — Google Cloud project & service account

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one), e.g. `trichella-xdi`.
3. **APIs & Services → Enable APIs** → enable **Google Drive API**.
4. **IAM & Admin → Service accounts → Create service account**  
   - Name: e.g. `trichella-drive-uploader`
5. Open the new service account → **Keys → Add key → JSON** → download the JSON file.
6. From the JSON file, copy:
   - `client_email` → this is `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is `GOOGLE_PRIVATE_KEY` (keep the `\n` newlines; in `.env` use quotes and real newlines or `\n`)

---

## Step 3 — Share the Drive folder with the service account

1. In Google Drive, open the **same folder** as in Step 1.
2. **Share** → add the **service account email** (looks like `...@....iam.gserviceaccount.com`).
3. Role: **Editor** (must be able to upload files).
4. If the folder lives on a **Shared drive**, ensure the service account is a **member** of that Shared drive with **Content manager** or **Contributor** as required by your org.

---

## Step 4 — Environment variables

### Local (`trichella-app/.env`)

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=trichella-drive@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j

# Optional — different folders for images vs JSON reports (omit to use GOOGLE_DRIVE_FOLDER_ID for that role)
# GOOGLE_DRIVE_IMAGE_FOLDER_ID=...
# GOOGLE_DRIVE_REPORT_FOLDER_ID=...
```

- Paste the **private key** as one line with `\n` for line breaks, **or** use a multiline string in `.env` if your tooling supports it.
- Restart the API: `npm run server` (or `npm run dev:all`).

### Vercel

1. Project → **Settings → Environment Variables**.
2. Add the same three variables for **Production** (and Preview if needed).
3. For `GOOGLE_PRIVATE_KEY`, paste the full key; Vercel often needs literal `\n` replaced by real newlines — if upload fails with “invalid key”, try storing the key with escaped newlines as in the example above.
4. Redeploy.

---

## Step 5 — Verify

1. Run a scan in Trichella.
2. Check the configured folder(s) — new files `Trichella_Scan_..._image...` and `Trichella_Scan_..._report.json` should appear within a few seconds (or the legacy `Trichella_Scalp_...` name if using upload-only API).
3. If nothing appears, check server logs / Vercel function logs for `Drive upload error`.

---

## Security notes

- Never commit the JSON key or `.env` to git.
- The service account should only have access to the **Trichella** folder (principle of least privilege).
- Images are sent to your backend over HTTPS; the backend uploads to Drive using the service account.

---

## Troubleshooting

### Image never appears in Drive (most common)

1. **Production (Vercel)** — Environment variables live only in **Vercel → Project → Settings → Environment Variables**. Your local `trichella-app/.env` is **not** used on `*.vercel.app`. Add all three `GOOGLE_*` variables there and **Redeploy**.

2. **Local dev** — You must run **both** the API and the app: `npm run dev:all` (or `npm run server` in one terminal and `npm run dev` in another). If only `npm run dev` runs, `/api/upload-drive` never hits a server that has your `.env`.

3. **Folder sharing** — In Drive, open **Scalp_scans** → **Share** → the **service account email** (from the JSON `client_email`) must be **Editor**. A public “anyone with the link” link is **not** enough for the robot account.

4. **Browser console** — With `npm run dev`, open DevTools → **Console** after a scan. You should see either `[Trichella Drive] saved: Trichella_Scalp_...` or a line starting with `[Trichella Drive]` explaining the failure. To log on production builds, set `VITE_LOG_DRIVE=1` in Vercel env and redeploy.

5. **`GOOGLE_PRIVATE_KEY`** — Must be one line in `.env` with `\n` between key lines, or use the quote-stripping the app expects. If auth fails, check Vercel logs for the `upload-drive` function.

---

| Issue | What to check |
|--------|----------------|
| `skipped: true` in API response | Env vars missing locally or on Vercel |
| `403` / `insufficientPermissions` | Folder not shared with service account email, or Shared drive membership |
| `invalid_grant` | Wrong private key or bad `\n` formatting in `GOOGLE_PRIVATE_KEY` |
| File too large | Vercel body limit (~4.5 MB on Hobby); compress image or host API elsewhere |

If `drive.file` scope is too strict for your Workspace policy, ask your admin about using the **Drive** scope or adjusting domain restrictions for the service account.
