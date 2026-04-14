# Save Trichella scans to XDi’s Google Drive

Each successful scalp scan uploads the **same image sent to the AI** into a **Google Drive folder** you choose (for example under **Trichella → Scalp scans** on XDi’s Drive). Uploads run on the **server** (never expose Google keys in the browser).

## How it works

1. You create a **Google Cloud service account** and a **Drive folder** shared with that account.
2. You set three environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`).
3. After analysis succeeds, the app calls `POST /api/upload-drive` with the image; the server uploads a file named like  
   `Trichella_Scalp_2026-04-14T12-30-00_123456789012.png`.

If those variables are **not** set, uploads are **skipped** and the app still works normally.

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
2. Check the Drive folder — a new file `Trichella_Scalp_...` should appear within a few seconds.
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
