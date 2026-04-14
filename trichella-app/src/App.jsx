/**
 * Trichella — Simplified AI Scalp Diagnostics
 * Flow: Upload image → 6 scalp issues output → Check accuracy
 * Dark & light mode support
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Upload, Sun, Moon, CheckCircle, XCircle, MinusCircle, MessageSquare } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════
const STORAGE_CURRENT = "trichella_current_scan";
const STORAGE_HISTORY = "trichella_scan_history";

const T = {
  en: {
    uploadTitle: "Upload scalp image",
    uploadHint: "Image: JPG, PNG, BMP, HEIC · Video: MP4, WebM, MOV, WMV, AVI · up to 20 MB",
    dropHere: "Drop your scalp photo here",
    orClick: "or click to browse",
    change: "Change",
    analyse: "Analyse",
    analysing: "Analysing…",
    fileError: "Please choose an image (JPG, PNG, BMP, HEIC) or video (MP4, WebM, MOV, WMV, AVI).",
    analysisError: "Analysis failed. Ensure backend is running and OPENAI_API_KEY is set.",
    noResults: "No results yet",
    noResultsDesc: "Upload and analyse a scalp image to see the 6 diagnostic conditions.",
    uploadImage: "Upload image",
    sixIssues: "6 scalp issues",
    diagnosis: "Diagnosis",
    primary: "Primary",
    detected: "Detected",
    accuracyCheck: "Check for accurate diagnosis",
    wasAccurate: "Was this diagnosis accurate?",
    yes: "Yes",
    no: "No",
    partially: "Partially",
    newScan: "New scan",
    noteSection: "Additional notes",
    notePlaceholder: "Add any scalp issues not covered by the 6 conditions above…",
    saveNote: "Save note",
    noteSaved: "Note saved",
    noteSavedBanner: "Your note is saved and stored with this scan.",
    dismiss: "Dismiss",
    feedbackSaved: "Thank you, feedback saved",
    feedbackSavedBanner: "Your feedback is saved.",
  },
  zh: {
    uploadTitle: "上传头皮图像",
    uploadHint: "图片：JPG、PNG、BMP、HEIC · 视频：MP4、WebM、MOV、WMV、AVI · 最大 20 MB",
    dropHere: "将头皮照片拖放到此处",
    orClick: "或点击上传",
    change: "更换",
    analyse: "分析",
    analysing: "分析中…",
    fileError: "请选择图片（JPG、PNG、BMP、HEIC）或视频（MP4、WebM、MOV、WMV、AVI）。",
    analysisError: "分析失败。请确保后端已启动且已设置 OPENAI_API_KEY。",
    noResults: "暂无结果",
    noResultsDesc: "上传并分析头皮图像以查看 6 种诊断状况。",
    uploadImage: "上传图像",
    sixIssues: "6 种头皮状况",
    diagnosis: "诊断结果",
    primary: "主要",
    detected: "检测到",
    accuracyCheck: "诊断准确性反馈",
    wasAccurate: "此诊断是否准确？",
    yes: "是",
    no: "否",
    partially: "部分准确",
    newScan: "重新扫描",
    noteSection: "补充说明",
    notePlaceholder: "添加上述 6 种状况以外的头皮问题…",
    saveNote: "保存备注",
    noteSaved: "备注已保存",
    noteSavedBanner: "备注已保存，并与本次扫描一同存储。",
    dismiss: "关闭",
    feedbackSaved: "感谢您的反馈",
    feedbackSavedBanner: "反馈已保存。",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES — Dark & Light themes
// ══════════════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden;transition:background .25s,color .25s}

/* Dark theme (default) — deep green brand look */
:root,[data-theme="dark"]{
  --bg:#07130E; --bg1:#0C1A13; --bg2:#102219; --bg3:#183526;
  --border:rgba(214,232,222,.16); --border2:rgba(214,232,222,.26);
  --text:#F3F7F5; --text2:#B6CBC0; --text3:#81988A;
  /* Primary brand green */
  --gold:#1F5C3A; /* keep variable name for existing styles */
  --gold-lt:rgba(31,92,58,.18);
  --gold-glow:rgba(31,92,58,.32);
  /* Supporting greens */
  --sage:#3C7A4E; --sage-lt:rgba(60,122,78,.20);
  --terra:#27543A; --terra-lt:rgba(39,84,58,.20);
  --amber:#5C8C63; --amber-lt:rgba(92,140,99,.18);
  /* Critical (red-ish but muted) */
  --crit:#B45454; --crit-lt:rgba(180,84,84,.18);
}
/* Light theme — soft cream with green accents */
[data-theme="light"]{
  --bg:#F5F4EF; --bg1:#FFFFFF; --bg2:#ECF3EE; --bg3:#D4E3D9;
  --border:rgba(12,40,26,.10); --border2:rgba(12,40,26,.22);
  --text:#102018; --text2:#4C6254; --text3:#809486;
  --gold:#1F5C3A;
  --gold-lt:rgba(31,92,58,.10);
  --gold-glow:rgba(31,92,58,.25);
  --sage:#2F6E44; --sage-lt:rgba(47,110,68,.16);
  --terra:#205539; --terra-lt:rgba(32,85,57,.16);
  --amber:#4A8157; --amber-lt:rgba(74,129,87,.16);
  --crit:#B04040; --crit-lt:rgba(176,64,64,.16);
}

body{background:var(--bg);color:var(--text)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px}

.app{min-height:100vh;padding:24px;max-width:720px;margin:0 auto}
.app-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:12px}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--gold),#0E2F1F);display:flex;align-items:center;justify-content:center;font-size:18px}
.logo-name{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;letter-spacing:.5px}

.theme-btn,.lang-btn{width:40px;height:40px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:13px;font-weight:600}
.theme-btn:hover,.lang-btn:hover{border-color:var(--gold);color:var(--gold)}
.lang-btn{min-width:48px;padding:0 8px}

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
.btn-gold{background:linear-gradient(135deg,var(--gold),#0E2F1F);color:#F3F7F5;box-shadow:0 4px 20px var(--gold-glow)}
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
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),#0E2F1F);border-radius:99px;transition:width .8s ease}

/* Condition cards */
.cond-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;transition:all .2s}
.cond-card.detected{border-color:var(--gold);background:var(--gold-lt)}
.cond-card.primary{border-color:var(--gold);background:var(--gold-lt);box-shadow:0 0 0 2px rgba(31,92,58,.35)}
.cond-card.faded{opacity:.5}

/* Accuracy feedback */
.accuracy-section{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:24px}
.accuracy-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.accuracy-btn{padding:10px 18px;border-radius:10px;border:1px solid var(--border);background:var(--bg1);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .15s}
.accuracy-btn:hover{border-color:var(--gold)}
.accuracy-btn.selected-yes{border-color:var(--sage);background:var(--sage-lt);color:var(--sage)}
.accuracy-btn.selected-no{border-color:var(--crit);background:var(--crit-lt);color:var(--crit)}
.accuracy-btn.selected-partial{border-color:var(--amber);background:var(--amber-lt);color:var(--amber)}

/* Note section */
.note-section{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:24px}
.note-section textarea{width:100%;min-height:80px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg1);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);resize:vertical;outline:none;transition:border .15s}
.note-section textarea:focus{border-color:var(--gold)}
.note-section textarea::placeholder{color:var(--text3)}

/* Toast confirmation */
@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);max-width:calc(100% - 32px);padding:14px 22px;border-radius:12px;background:var(--gold);color:#fff;font-size:15px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.25);z-index:1000;animation:toastIn .35s ease;display:flex;align-items:center;gap:10px}
.save-banner{margin-top:14px;padding:14px 16px;border-radius:10px;background:var(--sage-lt);border:1px solid var(--sage);color:var(--text);font-size:14px;font-weight:500;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.save-banner button{background:transparent;border:none;color:var(--gold);font-weight:600;cursor:pointer;text-decoration:underline;padding:0;flex-shrink:0}
`;

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES & CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const DIAG_CONDITIONS = [
  { id: "dry", label: "Dry Scalp", labelZh: "干燥头皮", icon: "💧" },
  { id: "oily", label: "Oily Scalp", labelZh: "油性头皮", icon: "✨" },
  { id: "sensitive", label: "Sensitive Scalp", labelZh: "敏感头皮", icon: "🌿" },
  { id: "acne", label: "Acne Scalp", labelZh: "痤疮头皮", icon: "⚡" },
  { id: "inflammation", label: "Inflammation Scalp", labelZh: "炎症头皮", icon: "🔴" },
  { id: "dandruff", label: "Dandruff Scalp", labelZh: "头屑头皮", icon: "❄️" },
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

async function runAI(b64, mime, lang) {
  const apiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  const r = await fetch(apiUrl ? `${apiUrl.replace(/\/$/, "")}/api/analyse` : "/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ b64, mime, lang }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `API ${r.status}`);
  }
  const { report } = await r.json();
  return report;
}

/** Upload analysed image to XDi Google Drive (server must have Drive env configured). */
async function uploadScanToDrive(b64, mime, scanId) {
  const apiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, "") : "";
  const log = (msg, extra) => {
    if (import.meta.env.DEV || import.meta.env.VITE_LOG_DRIVE === "1") {
      console.warn("[Trichella Drive]", msg, extra ?? "");
    }
  };
  try {
    const r = await fetch(`${base}/api/upload-drive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ b64, mime, scanId }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      log(`upload failed HTTP ${r.status}`, data);
      return;
    }
    if (data.skipped) {
      log("upload skipped (server missing GOOGLE_* env?)", data.message);
      return;
    }
    if (import.meta.env.DEV || import.meta.env.VITE_LOG_DRIVE === "1") {
      console.info("[Trichella Drive] saved:", data.name || data.fileId);
    }
  } catch (e) {
    log("network error — is the API running? (npm run dev:all)", e?.message);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// UPLOAD
// ══════════════════════════════════════════════════════════════════════════════

function UploadSection({ onComplete, lang, t }) {
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
      setError(t.fileError);
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
      const report = await runAI(b64, mime, lang);
      const scanId = Date.now().toString();
      uploadScanToDrive(b64, mime, scanId);
      clearInterval(interval);
      setProgress(100);
      const type = (file.type || "").toLowerCase();
      const ext = (file.name || "").split(".").pop()?.toLowerCase();
      const wasConverted = type.startsWith("video/") || type.includes("bmp") || type === "image/heic" || ["bmp", "wmv", "avi", "mov", "mp4", "webm"].includes(ext);
      const previewForResults = wasConverted ? `data:image/png;base64,${b64}` : preview;
      setTimeout(() => onComplete({ id: scanId, date: new Date().toISOString(), preview: previewForResults, report }), 500);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || t.analysisError);
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="heading" style={{ marginBottom: 8 }}>{t.uploadTitle}</h2>
      <p className="caption" style={{ marginBottom: 24 }}>{t.uploadHint}</p>

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
          <h3 className="subheading" style={{ marginBottom: 6 }}>{t.dropHere}</h3>
          <p className="body">{t.orClick}</p>
        </div>
      ) : (
        <div>
          {file?.type?.startsWith("video/") ? (
            <video src={preview} controls style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }} />
          ) : (
            <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }} />
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); setError(null); }}>{t.change}</button>
            <button className="btn btn-gold" onClick={analyse} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  {t.analysing}
                </>
              ) : (
                <>
                  <Upload size={16} /> {t.analyse}
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

function ResultsSection({ scan, onUpdateScan, onNewScan, lang, t }) {
  const [toast, setToast] = useState(null);
  const [showNoteBanner, setShowNoteBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 6500);
  };

  useEffect(() => {
    if (!showNoteBanner) return;
    const id = setTimeout(() => setShowNoteBanner(false), 12000);
    return () => clearTimeout(id);
  }, [showNoteBanner]);

  useEffect(() => {
    if (!showFeedbackBanner) return;
    const id = setTimeout(() => setShowFeedbackBanner(false), 12000);
    return () => clearTimeout(id);
  }, [showFeedbackBanner]);

  const handleAccuracy = (val) => {
    onUpdateScan({ accuracy: val });
    setShowFeedbackBanner(true);
    showToast(t.feedbackSaved);
  };

  const handleNoteSave = () => {
    showToast(t.noteSaved);
    setShowNoteBanner(true);
  };

  useEffect(() => {
    setShowNoteBanner(false);
    setShowFeedbackBanner(false);
  }, [scan?.id]);

  if (!scan) return null;

  const note = scan.note ?? "";
  const accuracy = scan.accuracy ?? null;
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
            <h2 className="heading" style={{ marginBottom: 8 }}>{t.sixIssues}</h2>
            <p className="body">{report?.summary || "—"}</p>
          </div>
        </div>

        <div className="label" style={{ marginBottom: 12 }}>{t.diagnosis}</div>
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
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{lang === "zh" ? cond.labelZh : cond.label}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {detected ? (isPrimary ? t.primary : t.detected) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note section — for issues not in the 6 */}
      <div className="note-section">
        <div className="label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <MessageSquare size={14} /> {t.noteSection}
        </div>
        <textarea
          placeholder={t.notePlaceholder}
          value={note}
          onChange={(e) => {
            onUpdateScan({ note: e.target.value });
            setShowNoteBanner(false);
          }}
        />
        <button className="btn btn-gold" onClick={handleNoteSave} style={{ marginTop: 12 }}>
          <CheckCircle size={16} /> {t.saveNote}
        </button>
        {showNoteBanner && (
          <div className="save-banner">
            <span>{t.noteSavedBanner}</span>
            <button type="button" onClick={() => setShowNoteBanner(false)}>{t.dismiss}</button>
          </div>
        )}
      </div>

      {/* Accuracy check */}
      <div className="accuracy-section">
        <div className="label" style={{ marginBottom: 4 }}>{t.accuracyCheck}</div>
        <p className="body" style={{ marginBottom: 0 }}>{t.wasAccurate}</p>
        <div className="accuracy-btns">
          <button
            className={`accuracy-btn ${accuracy === "yes" ? "selected-yes" : ""}`}
            onClick={() => handleAccuracy("yes")}
          >
            <CheckCircle size={18} /> {t.yes}
          </button>
          <button
            className={`accuracy-btn ${accuracy === "no" ? "selected-no" : ""}`}
            onClick={() => handleAccuracy("no")}
          >
            <XCircle size={18} /> {t.no}
          </button>
          <button
            className={`accuracy-btn ${accuracy === "partial" ? "selected-partial" : ""}`}
            onClick={() => handleAccuracy("partial")}
          >
            <MinusCircle size={18} /> {t.partially}
          </button>
        </div>
        {showFeedbackBanner && (
          <div className="save-banner" style={{ marginTop: 14 }}>
            <span>{t.feedbackSavedBanner}</span>
            <button type="button" onClick={() => setShowFeedbackBanner(false)}>{t.dismiss}</button>
          </div>
        )}
      </div>

      {/* Confirmation toast */}
      {toast && (
        <div className="toast">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-outline" onClick={onNewScan}><Camera size={16} /> {t.newScan}</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [scan, setScan] = useState(null);
  const saveDebounce = useRef(null);

  const archiveCurrentToHistory = useCallback((cur) => {
    if (!cur?.report) return;
    try {
      const hist = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
      hist.unshift({
        id: cur.id,
        date: cur.date,
        preview: cur.preview,
        report: cur.report,
        note: cur.note ?? "",
        accuracy: cur.accuracy ?? null,
      });
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(hist.slice(0, 30)));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.report && p?.id) setScan(p);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    clearTimeout(saveDebounce.current);
    if (!scan?.report) return;
    saveDebounce.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_CURRENT, JSON.stringify(scan));
      } catch (e) {
        console.warn("Could not persist scan", e);
      }
    }, 500);
    return () => clearTimeout(saveDebounce.current);
  }, [scan]);

  const updateScan = useCallback((partial) => {
    setScan((s) => (s ? { ...s, ...partial } : null));
  }, []);

  const handleAnalysisComplete = useCallback(
    (newData) => {
      setScan((cur) => {
        archiveCurrentToHistory(cur);
        return { ...newData, note: "", accuracy: null };
      });
    },
    [archiveCurrentToHistory]
  );

  const handleNewScan = useCallback(() => {
    setScan((cur) => {
      archiveCurrentToHistory(cur);
      try {
        localStorage.removeItem(STORAGE_CURRENT);
      } catch (_) {}
      return null;
    });
  }, [archiveCurrentToHistory]);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trichella_theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  });
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("trichella_lang") || "en";
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trichella_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("trichella_lang", lang);
  }, [lang]);

  const t = T[lang] || T.en;

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <div className="logo-mark">🔬</div>
            <span className="logo-name">Trichella</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="lang-btn"
              onClick={() => setLang((l) => (l === "en" ? "zh" : "en"))}
              title={lang === "en" ? "切换到中文" : "Switch to English"}
            >
              {lang === "en" ? "中文" : "EN"}
            </button>
            <button
              className="theme-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <UploadSection key={scan ? scan.id : "empty"} onComplete={handleAnalysisComplete} lang={lang} t={t} />
        {scan && (
          <div style={{ marginTop: 32 }}>
            <ResultsSection scan={scan} onUpdateScan={updateScan} onNewScan={handleNewScan} lang={lang} t={t} />
          </div>
        )}
      </div>
    </>
  );
}
