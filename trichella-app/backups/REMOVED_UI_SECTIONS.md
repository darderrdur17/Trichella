# Trichella — backed-up UI sections (removed from `src/App.jsx`)

Archived **2026-04-16**. Restore by copying snippets back into `App.jsx` (and re-adding any translation keys / CSS / imports).

Also on disk:

- `src/reportExport.js` — PDF / Word / Markdown downloads (was disconnected when the download bar was removed).

---

## 1. Google Drive status banners (under report header)

Placed inside the `report-header` card, after the preview row, before closing `</div>` of the header.

```jsx
        {/* Drive save banner */}
        {scan.drive?.ok && (
          <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: "var(--sage-lt)", border: "1px solid var(--sage)", fontSize: 12 }}>
            {t.driveSaved}
            {scan.drive.sameFolder === false && <span style={{ display: "block", marginTop: 3, color: "var(--text3)" }}>{t.driveSavedSplitFolders}</span>}
            {(scan.drive.imageName || scan.drive.reportName) && (
              <span style={{ display: "block", marginTop: 3, color: "var(--text3)", wordBreak: "break-all" }}>{scan.drive.imageName} · {scan.drive.reportName}</span>
            )}
          </div>
        )}
        {scan.drive?.skipped && (
          <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: "var(--amber-lt)", border: "1px solid var(--amber)", fontSize: 12 }}>{t.driveSkipped}</div>
        )}
        {scan.drive && scan.drive.ok === false && !scan.drive.skipped && (
          <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: "var(--crit-lt)", border: "1px solid var(--crit)", fontSize: 12, color: "var(--crit)" }}>
            {t.driveFailed}{scan.drive.error ? ` (${scan.drive.error})` : ""}
          </div>
        )}
```

**i18n (en / zh):** `driveSaved`, `driveSavedSplitFolders`, `driveSkipped`, `driveFailed`.

---

## 2. Next follow-up banner + download bar

Requires imports:

```js
import { FileText, FileDown, FileCode, /* ... */ } from "lucide-react";
import { downloadPDF, downloadWord, downloadMarkdown } from "./reportExport.js";
```

State + handler inside `ResultsSection`:

```js
const [dlLoading, setDlLoading] = useState(null);

const handleDL = async (type) => {
  setDlLoading(type);
  try {
    if (type === "pdf") await downloadPDF(scan);
    else if (type === "word") downloadWord(scan);
    else if (type === "md") downloadMarkdown(scan);
  } catch (e) {
    console.error(e);
    showToast("Download failed: " + e.message);
  } finally {
    setDlLoading(null);
  }
};
```

**JSX** (before Notes section):

```jsx
      {/* ── Next scan ──────────────────────────────────────────────────── */}
      {r?.nextScanDays && (
        <div className="next-scan-banner">
          <div>
            <div className="ns-days">{r.nextScanDays} days</div>
            <div className="ns-label">{typeof t.nextScanDays === "function" ? t.nextScanDays(r.nextScanDays) : t.nextScan}</div>
          </div>
        </div>
      )}

      {/* ── Download Report ────────────────────────────────────────────── */}
      <div className="download-bar">
        <span className="dl-label">{t.downloadReport}</span>
        <button className="btn-dl" title={t.downloadPDFTitle} onClick={() => handleDL("pdf")} disabled={!!dlLoading}>
          <FileDown size={15} /> {dlLoading === "pdf" ? "…" : t.downloadPDF}
        </button>
        <button className="btn-dl" title={t.downloadWordTitle} onClick={() => handleDL("word")} disabled={!!dlLoading}>
          <FileText size={15} /> {dlLoading === "word" ? "…" : t.downloadWord}
        </button>
        <button className="btn-dl" title={t.downloadMDTitle} onClick={() => handleDL("md")} disabled={!!dlLoading}>
          <FileCode size={15} /> {dlLoading === "md" ? "…" : t.downloadMD}
        </button>
      </div>
```

**i18n:** `nextScan`, `nextScanDays` (function), `downloadReport`, `downloadPDF`, `downloadWord`, `downloadMD`, `downloadPDFTitle`, `downloadWordTitle`, `downloadMDTitle`.

**CSS** (in global `G` template string):

```css
/* Next scan banner */
.next-scan-banner{background:linear-gradient(135deg,var(--gold),#0E2F1F);border-radius:12px;padding:14px 18px;margin-top:20px;display:flex;align-items:center;gap:12px;color:#F3F7F5}
.next-scan-banner .ns-days{font-size:22px;font-weight:700;font-family:'Cormorant Garamond',serif}
.next-scan-banner .ns-label{font-size:13px;color:rgba(240,250,245,.8)}

/* Download bar */
.download-bar{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin-top:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.download-bar .dl-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--text3);margin-right:4px}
.btn-dl{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:9px;border:1px solid var(--border2);background:var(--bg1);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
.btn-dl:hover{border-color:var(--gold);color:var(--gold);background:var(--gold-lt)}
```

---

## 3. Clinical Findings + Recommendations (removed 2026-04-16)

Place after the **6 Condition Cards** block and before **Notes**.

**Clinical Findings**

```jsx
      {/* ── Clinical Findings ──────────────────────────────────────────── */}
      {r?.findings?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CollapsibleSection title={t.clinicalFindings} ariaLabel={ariaToggle(t.clinicalFindings)}>
            <ul className="findings-list">
              {r.findings.map((f, i) => (
                <li key={i}>
                  <span className="finding-num">{i + 1}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        </div>
      )}
```

**Recommendations**

```jsx
      {/* ── Recommendations ────────────────────────────────────────────── */}
      {r?.recommendations?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CollapsibleSection title={t.recommendations} ariaLabel={ariaToggle(t.recommendations)}>
            <div className="rec-list">
              {r.recommendations.map((rec, i) => (
                <div key={i} className="rec-card">
                  <div className="rec-left">
                    <div className="rec-title">{rec.title}</div>
                    <div className="rec-detail">{rec.detail}</div>
                  </div>
                  <span className={`priority-badge priority-${rec.priority}`}>
                    {t[`priority${rec.priority}`] != null ? t[`priority${rec.priority}`] : rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}
```

**i18n:** `clinicalFindings`, `recommendations`, `priorityHigh`, `priorityMedium`, `priorityLow`.

**CSS** (in global `G`):

```css
/* Findings */
.findings-list{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.findings-list li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--text2);line-height:1.55}
.finding-num{min-width:22px;height:22px;border-radius:50%;background:var(--gold-lt);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--gold);flex-shrink:0;margin-top:1px}

/* Recommendations */
.rec-list{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.rec-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start}
.rec-left{flex:1;min-width:0}
.rec-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:5px}
.rec-detail{font-size:13px;color:var(--text2);line-height:1.6}
.priority-badge{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.4px;white-space:nowrap;flex-shrink:0;margin-top:2px}
.priority-High{background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit)}
.priority-Medium{background:var(--sage-lt);color:var(--sage);border:1px solid var(--sage)}
.priority-Low{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
```

---

## API / data

`report.findings` and `report.recommendations` are still returned by `lib/analyse.js`; only the **UI** was removed. Drive uploads and `reportExport` are unchanged at the API layer.
