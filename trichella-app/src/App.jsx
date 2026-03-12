/**
 * Trichella — Simplified AI Scalp Diagnostics
 * Flow: Upload image → 6 scalp issues output → Check accuracy
 * Dark & light mode support
 */

import { useState, useEffect, useRef } from "react";
import { Camera, Upload, Sun, Moon, CheckCircle, XCircle, MinusCircle } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES — Dark & Light themes
// ══════════════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden;transition:background .25s,color .25s}

/* Dark theme (default) */
:root,[data-theme="dark"]{
  --bg:#0C0B09; --bg1:#141210; --bg2:#1C1A17; --bg3:#252220;
  --border:rgba(240,235,225,.1); --border2:rgba(240,235,225,.18);
  --text:#F0EBE1; --text2:#B8AF9E; --text3:#7A746A;
  --gold:#C9A96E; --gold-lt:rgba(201,169,110,.15); --gold-glow:rgba(201,169,110,.25);
  --sage:#7A9E7E; --sage-lt:rgba(122,158,126,.15);
  --terra:#C4785A; --terra-lt:rgba(196,120,90,.15);
  --amber:#D4A843; --amber-lt:rgba(212,168,67,.15);
  --crit:#B45454; --crit-lt:rgba(180,84,84,.15);
}
/* Light theme */
[data-theme="light"]{
  --bg:#F5F3EF; --bg1:#FFFFFF; --bg2:#EBE8E2; --bg3:#DDD9D2;
  --border:rgba(32,30,28,.12); --border2:rgba(32,30,28,.2);
  --text:#1C1A17; --text2:#5A554D; --text3:#8A857C;
  --gold:#A07840; --gold-lt:rgba(160,120,64,.12); --gold-glow:rgba(160,120,64,.2);
  --sage:#5A7E5E; --sage-lt:rgba(90,126,94,.15);
  --terra:#A85A3A; --terra-lt:rgba(168,90,58,.15);
  --amber:#B88830; --amber-lt:rgba(184,136,48,.15);
  --crit:#A04040; --crit-lt:rgba(160,64,64,.15);
}

body{background:var(--bg);color:var(--text)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px}

.app{min-height:100vh;padding:24px;max-width:720px;margin:0 auto}
.app-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--gold),#A07840);display:flex;align-items:center;justify-content:center;font-size:18px}
.logo-name{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;letter-spacing:.5px}

.theme-btn{width:40px;height:40px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.theme-btn:hover{border-color:var(--gold);color:var(--gold)}

/* Cards */
.card{background:var(--bg1);border:1px solid var(--border);border-radius:16px;padding:24px;transition:all .2s}
.card:hover{border-color:var(--border2)}
.card-sm{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px}

/* Typography */
h1,h2,h3{font-family:'Cormorant Garamond',serif}
.heading{font-size:clamp(22px,4vw,28px);font-weight:600;line-height:1.2}
.subheading{font-size:18px;font-weight:500}
.label{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--text3)}
.body{font-size:14px;color:var(--text2);line-height:1.6}
.caption{font-size:12px;color:var(--text3)}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:10px;border:none;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-gold{background:linear-gradient(135deg,var(--gold),#A07840);color:#0C0B09;box-shadow:0 4px 20px var(--gold-glow)}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 6px 28px var(--gold-glow)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-outline{background:transparent;color:var(--text2);border:1px solid var(--border2)}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.btn-ghost{background:transparent;color:var(--text2)}
.btn-ghost:hover{color:var(--text)}

/* Dropzone */
.dropzone{border:2px dashed var(--border2);border-radius:16px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg1);position:relative}
.dropzone:hover,.dropzone.drag{border-color:var(--gold);background:var(--gold-lt);transform:translateY(-2px)}
.dropzone input{position:absolute;left:-9999px;width:0;height:0;opacity:0}

/* Spinner & progress */
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:48px;height:48px;border-radius:50%;border:3px solid var(--bg3);border-top-color:var(--gold);animation:spin 1s linear infinite}
.progress-bar{height:4px;border-radius:99px;background:var(--bg3);overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),#A07840);border-radius:99px;transition:width .8s ease}

/* Condition cards */
.cond-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;transition:all .2s}
.cond-card.detected{border-color:var(--gold);background:var(--gold-lt)}
.cond-card.primary{border-color:var(--gold);background:var(--gold-lt);box-shadow:0 0 0 2px rgba(201,169,110,.3)}
.cond-card.faded{opacity:.5}

/* Accuracy feedback */
.accuracy-section{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:24px}
.accuracy-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.accuracy-btn{padding:10px 18px;border-radius:10px;border:1px solid var(--border);background:var(--bg1);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .15s}
.accuracy-btn:hover{border-color:var(--gold)}
.accuracy-btn.selected-yes{border-color:var(--sage);background:var(--sage-lt);color:var(--sage)}
.accuracy-btn.selected-no{border-color:var(--crit);background:var(--crit-lt);color:var(--crit)}
.accuracy-btn.selected-partial{border-color:var(--amber);background:var(--amber-lt);color:var(--amber)}
`;

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES & CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const DIAG_CONDITIONS = [
  { id: "dry", label: "Dry Scalp", icon: "💧" },
  { id: "oily", label: "Oily Scalp", icon: "✨" },
  { id: "sensitive", label: "Sensitive Scalp", icon: "🌿" },
  { id: "acne", label: "Acne Scalp", icon: "⚡" },
  { id: "inflammation", label: "Inflammation Scalp", icon: "🔴" },
  { id: "dandruff", label: "Dandruff Scalp", icon: "❄️" },
];

function fileToB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

/** OpenAI Vision supports only png, jpeg, gif, webp. Convert BMP/video to PNG. */
async function toSupportedFormat(file) {
  const type = (file.type || "").toLowerCase();
  const ext = (file.name || "").split(".").pop()?.toLowerCase();
  const supported = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
  if (supported.includes(type) || ["png", "jpeg", "jpg", "gif", "webp"].includes(ext)) {
    const b64 = await fileToB64(file);
    return { b64, mime: type.startsWith("image/") ? type : "image/jpeg" };
  }
  const url = URL.createObjectURL(file);
  try {
    if (type.startsWith("video/") || ["mp4", "webm", "mov", "wmv", "avi"].includes(ext)) {
      return await videoFrameToPng(url);
    }
    if (type === "image/bmp" || type === "image/x-ms-bmp" || ext === "bmp" || type.includes("bmp")) {
      return await imageToPng(url);
    }
    if (type === "image/heic" || ext === "heic") {
      return await imageToPng(url);
    }
    const b64 = await fileToB64(file);
    return { b64, mime: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function imageToPng(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      res({ b64: dataUrl.split(",")[1], mime: "image/png" });
    };
    img.onerror = () => rej(new Error("Could not load image for conversion"));
    img.src = url;
  });
}

function videoFrameToPng(url) {
  return new Promise((res, rej) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onloadeddata = () => {
      const d = video.duration;
      video.currentTime = Number.isFinite(d) ? Math.min(1, d * 0.1) : 0.5;
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      res({ b64: dataUrl.split(",")[1], mime: "image/png" });
    };
    video.onerror = () => rej(new Error("Could not load video for frame extraction"));
    video.src = url;
  });
}

async function runAI(b64, mime) {
  const sys = `You are a senior AI trichologist. Analyse the scalp image and return ONLY valid JSON — no markdown, no explanation.

Evaluate against these 6 conditions: Dry Scalp, Oily Scalp, Sensitive Scalp, Acne Scalp, Inflammation Scalp, Dandruff Scalp.
Return schema: { "conditions": ["<detected conditions from the 6>"], "primaryCondition": "<single most prominent>", "summary": "<2-sentence summary>" }
Each condition string must match exactly one of the 6 names above.`;

  const apiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  const r = await fetch(apiUrl ? `${apiUrl.replace(/\/$/, "")}/api/analyse` : "/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ b64, mime }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `API ${r.status}`);
  }
  const { report } = await r.json();
  return report;
}

// ══════════════════════════════════════════════════════════════════════════════
// UPLOAD
// ══════════════════════════════════════════════════════════════════════════════

function UploadSection({ onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const ref = useRef();

  const pick = (f) => {
    if (!f) return;
    const type = (f.type || "").toLowerCase();
    const ext = (f.name || "").split(".").pop()?.toLowerCase();
    const isImage = type.startsWith("image/") || /\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(f.name || "");
    const isVideo = type.startsWith("video/") || ["mp4", "webm", "mov", "wmv", "avi"].includes(ext);
    if (!isImage && !isVideo) {
      setError("Please choose an image (JPG, PNG, BMP, HEIC) or video (MP4, WebM, MOV, WMV, AVI).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const analyse = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 400);
    try {
      const { b64, mime } = await toSupportedFormat(file);
      const report = await runAI(b64, mime);
      clearInterval(interval);
      setProgress(100);
      const type = (file.type || "").toLowerCase();
      const ext = (file.name || "").split(".").pop()?.toLowerCase();
      const wasConverted = type.startsWith("video/") || type.includes("bmp") || type === "image/heic" || ["bmp", "wmv", "avi", "mov", "mp4", "webm"].includes(ext);
      const previewForResults = wasConverted ? `data:image/png;base64,${b64}` : preview;
      setTimeout(() => onComplete({ id: Date.now().toString(), date: new Date().toISOString(), preview: previewForResults, report }), 500);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || "Analysis failed. Ensure backend is running and OPENAI_API_KEY is set.");
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="heading" style={{ marginBottom: 8 }}>Upload scalp image</h2>
      <p className="caption" style={{ marginBottom: 24 }}>Image: JPG, PNG, BMP, HEIC · Video: MP4, WebM, MOV, WMV, AVI · up to 20 MB</p>

      {!preview ? (
        <div
          className="dropzone"
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("drag"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); pick(e.dataTransfer?.files?.[0]); }}
          onClick={() => ref.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
        >
          <input
            ref={ref}
            type="file"
            accept="image/*,.bmp,image/bmp,video/*,.mp4,.webm,.mov,.wmv,.avi"
            onChange={(e) => { pick(e.target?.files?.[0]); e.target.value = ""; }}
            aria-hidden
          />
          <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
          <h3 className="subheading" style={{ marginBottom: 6 }}>Drop your scalp photo here</h3>
          <p className="body">or click to browse</p>
        </div>
      ) : (
        <div>
          {file?.type?.startsWith("video/") ? (
            <video src={preview} controls style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }} />
          ) : (
            <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }} />
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); setError(null); }}>Change</button>
            <button className="btn btn-gold" onClick={analyse} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Analysing…
                </>
              ) : (
                <>
                  <Upload size={16} /> Analyse
                </>
              )}
            </button>
          </div>
          {loading && (
            <div style={{ marginTop: 16 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="caption" style={{ marginTop: 6 }}>{progress}%</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 14, background: "var(--crit-lt)", border: "1px solid var(--crit)", borderRadius: 12, fontSize: 14, color: "var(--crit)" }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULTS — 6 scalp issues
// ══════════════════════════════════════════════════════════════════════════════

function ResultsSection({ scan, onNewScan }) {
  const [accuracy, setAccuracy] = useState(null); // "yes" | "no" | "partial"

  if (!scan) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 className="subheading" style={{ marginBottom: 8 }}>No results yet</h3>
        <p className="body" style={{ marginBottom: 20 }}>Upload and analyse a scalp image to see the 6 diagnostic conditions.</p>
        <button className="btn btn-gold" onClick={onNewScan}><Camera size={16} /> Upload image</button>
      </div>
    );
  }

  const { report, preview } = scan;
  const conditions = report?.conditions || [];
  const primary = (report?.primaryCondition || "").toLowerCase();

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          {preview && (
            <img src={preview} alt="Scan" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 className="heading" style={{ marginBottom: 8 }}>6 scalp issues</h2>
            <p className="body">{report?.summary || "—"}</p>
          </div>
        </div>

        <div className="label" style={{ marginBottom: 12 }}>Diagnosis</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {DIAG_CONDITIONS.map((cond) => {
            const detected = conditions.some((c) => c.toLowerCase().includes(cond.id) || c.toLowerCase() === cond.label.toLowerCase());
            const isPrimary = primary.includes(cond.id);
            return (
              <div
                key={cond.id}
                className={`cond-card ${detected ? (isPrimary ? "primary" : "detected") : "faded"}`}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{cond.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cond.label}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {detected ? (isPrimary ? "Primary" : "Detected") : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accuracy check */}
      <div className="accuracy-section">
        <div className="label" style={{ marginBottom: 4 }}>Check for accurate diagnosis</div>
        <p className="body" style={{ marginBottom: 0 }}>Was this diagnosis accurate?</p>
        <div className="accuracy-btns">
          <button
            className={`accuracy-btn ${accuracy === "yes" ? "selected-yes" : ""}`}
            onClick={() => setAccuracy("yes")}
          >
            <CheckCircle size={18} /> Yes
          </button>
          <button
            className={`accuracy-btn ${accuracy === "no" ? "selected-no" : ""}`}
            onClick={() => setAccuracy("no")}
          >
            <XCircle size={18} /> No
          </button>
          <button
            className={`accuracy-btn ${accuracy === "partial" ? "selected-partial" : ""}`}
            onClick={() => setAccuracy("partial")}
          >
            <MinusCircle size={18} /> Partially
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-outline" onClick={onNewScan}><Camera size={16} /> New scan</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [scan, setScan] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trichella_theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trichella_theme", theme);
  }, [theme]);

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <div className="logo-mark">🔬</div>
            <span className="logo-name">Trichella</span>
          </div>
          <button
            className="theme-btn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <UploadSection key={scan ? scan.id : "empty"} onComplete={(s) => setScan(s)} />
        <div style={{ marginTop: 32 }}>
          <ResultsSection scan={scan} onNewScan={() => setScan(null)} />
        </div>
      </div>
    </>
  );
}
