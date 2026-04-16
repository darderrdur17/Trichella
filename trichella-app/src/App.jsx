/**
 * Trichella — Simplified AI Scalp Diagnostics
 * Flow: Upload image → 6 scalp issues output → Check accuracy
 * Dark & light mode support
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Upload, Sun, Moon, CheckCircle, XCircle, MinusCircle, MessageSquare, FileText, FileDown, FileCode, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { downloadPDF, downloadWord, downloadMarkdown } from "./reportExport.js";

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
    driveSaved: "Scan image and AI report saved to Google Drive.",
    driveSavedSplitFolders: "Image and report were saved to their respective folders (configured on the server).",
    driveSkipped: "Google Drive not configured on the server — scans stay on this device only.",
    driveFailed: "Could not save to Google Drive. Check server logs and folder sharing.",
    // report sections
    patientSummary: "Summary",
    clinicalSummary: "Clinical Summary",
    scalpMetrics: "Scalp Metrics",
    metricDensity: "Density",
    metricSebum: "Sebum Level",
    metricHydration: "Hydration",
    metricInflammation: "Inflammation",
    metricFollicle: "Follicle Health",
    metricScalpType: "Scalp Type",
    clinicalFindings: "Clinical Findings",
    recommendations: "Recommendations",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    nextScan: "Next Recommended Scan",
    nextScanDays: (n) => `Recommended follow-up in ${n} days`,
    urgencyRoutine: "Routine — self-care sufficient",
    urgencyMonitor: "Monitor — recheck in 2–4 weeks",
    urgencyConsult: "Consult — professional evaluation recommended",
    downloadReport: "Download Report",
    downloadPDF: "PDF",
    downloadWord: "Word",
    downloadMD: "Markdown",
    downloadPDFTitle: "Download as PDF",
    downloadWordTitle: "Download as Word (.doc)",
    downloadMDTitle: "Download as Markdown",
    overallScore: "Overall Score",
    primaryCondition: "Primary Condition",
    urgencyLabel: "Urgency",
    showDetails: "Show full report",
    hideDetails: "Hide full report",
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
    driveSaved: "扫描图像与 AI 报告已保存至 Google Drive。",
    driveSavedSplitFolders: "图像与报告已分别保存至服务器配置的对应文件夹。",
    driveSkipped: "服务器未配置 Google Drive — 数据仅保存在本设备。",
    driveFailed: "无法保存到 Google Drive，请检查服务器日志与文件夹共享。",
    patientSummary: "总结",
    clinicalSummary: "临床摘要",
    scalpMetrics: "头皮指标",
    metricDensity: "密度",
    metricSebum: "皮脂水平",
    metricHydration: "水分",
    metricInflammation: "炎症",
    metricFollicle: "毛囊健康",
    metricScalpType: "头皮类型",
    clinicalFindings: "临床所见",
    recommendations: "建议",
    priorityHigh: "高",
    priorityMedium: "中",
    priorityLow: "低",
    nextScan: "下次扫描建议",
    nextScanDays: (n) => `建议在 ${n} 天后复查`,
    urgencyRoutine: "常规 — 自我护理即可",
    urgencyMonitor: "观察 — 2-4 周后复查",
    urgencyConsult: "就诊 — 建议专业评估",
    downloadReport: "下载报告",
    downloadPDF: "PDF",
    downloadWord: "Word",
    downloadMD: "Markdown",
    downloadPDFTitle: "下载 PDF",
    downloadWordTitle: "下载 Word (.doc)",
    downloadMDTitle: "下载 Markdown",
    overallScore: "综合评分",
    primaryCondition: "主要诊断",
    urgencyLabel: "处理紧迫性",
    showDetails: "查看完整报告",
    hideDetails: "收起完整报告",
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

/* ── Report sections ──────────────────────────────────────────────────────── */
.report-header{background:linear-gradient(135deg,var(--bg2),var(--bg1));border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:20px}
.score-ring{width:72px;height:72px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;border:3px solid var(--gold)}
.score-ring .score-val{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;line-height:1;color:var(--text)}
.score-ring .score-lbl{font-size:9px;font-weight:600;letter-spacing:.5px;color:var(--text3);margin-top:2px}
.urgency-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px;margin-top:6px}
.urgency-routine{background:var(--sage-lt);color:var(--sage);border:1px solid var(--sage)}
.urgency-monitor{background:var(--amber-lt);color:var(--amber);border:1px solid var(--amber)}
.urgency-consult{background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit)}
.patient-summary{background:var(--gold-lt);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;padding:12px 16px;font-size:14px;font-style:italic;color:var(--text);margin-bottom:16px;line-height:1.6}
.clinical-summary{background:var(--bg2);border-radius:10px;padding:14px 16px;font-size:14px;color:var(--text2);line-height:1.7;margin-bottom:0}

/* Metrics grid */
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:12px}
.metric-cell{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.metric-cell .metric-label{font-size:10px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--text3);margin-bottom:4px}
.metric-cell .metric-value{font-size:14px;font-weight:700;color:var(--text)}

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

/* Next scan banner */
.next-scan-banner{background:linear-gradient(135deg,var(--gold),#0E2F1F);border-radius:12px;padding:14px 18px;margin-top:20px;display:flex;align-items:center;gap:12px;color:#F3F7F5}
.next-scan-banner .ns-days{font-size:22px;font-weight:700;font-family:'Cormorant Garamond',serif}
.next-scan-banner .ns-label{font-size:13px;color:rgba(240,250,245,.8)}

/* Download bar */
.download-bar{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin-top:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.download-bar .dl-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--text3);margin-right:4px}
.btn-dl{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:9px;border:1px solid var(--border2);background:var(--bg1);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
.btn-dl:hover{border-color:var(--gold);color:var(--gold);background:var(--gold-lt)}

/* Section toggle */
.section-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none}
.section-header:hover .section-title{color:var(--text)}
.section-title{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--text3);transition:color .15s}
.toggle-btn{background:none;border:none;color:var(--text3);cursor:pointer;padding:2px;display:flex;align-items:center;transition:color .15s}
.toggle-btn:hover{color:var(--gold)}
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

async function runAI(b64, mime, lang, scanId) {
  const apiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  const r = await fetch(apiUrl ? `${apiUrl.replace(/\/$/, "")}/api/analyse` : "/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ b64, mime, lang, scanId }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `API ${r.status}`);
  }
  const data = await r.json();
  return { report: data.report, drive: data.drive };
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
      const scanId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const { report, drive } = await runAI(b64, mime, lang, scanId);
      if (import.meta.env.DEV || import.meta.env.VITE_LOG_DRIVE === "1") {
        console.info("[Trichella] Drive save result:", drive);
      }
      clearInterval(interval);
      setProgress(100);
      const type = (file.type || "").toLowerCase();
      const ext = (file.name || "").split(".").pop()?.toLowerCase();
      const wasConverted = type.startsWith("video/") || type.includes("bmp") || type === "image/heic" || ["bmp", "wmv", "avi", "mov", "mp4", "webm"].includes(ext);
      const previewForResults = wasConverted ? `data:image/png;base64,${b64}` : preview;
      setTimeout(() => onComplete({ id: scanId, date: new Date().toISOString(), preview: previewForResults, report, drive }), 500);
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
// RESULTS — Full clinical report
// ══════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 4 }}>
      <div className="section-header" onClick={() => setOpen((v) => !v)} style={{ marginBottom: open ? 0 : 0 }}>
        <span className="section-title">{title}</span>
        <button className="toggle-btn" type="button" aria-label="toggle">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

function ResultsSection({ scan, onUpdateScan, onNewScan, lang, t }) {
  const [toast, setToast] = useState(null);
  const [showNoteBanner, setShowNoteBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [dlLoading, setDlLoading] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 6500); };

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

  const handleAccuracy = (val) => { onUpdateScan({ accuracy: val }); setShowFeedbackBanner(true); showToast(t.feedbackSaved); };
  const handleNoteSave = () => { showToast(t.noteSaved); setShowNoteBanner(true); };

  useEffect(() => { setShowNoteBanner(false); setShowFeedbackBanner(false); }, [scan?.id]);

  if (!scan) return null;

  const note = scan.note ?? "";
  const accuracy = scan.accuracy ?? null;
  const { report: r, preview } = scan;
  const conditions = r?.conditions || [];
  const primary = (r?.primaryCondition || "").toLowerCase();
  const score = r?.overallScore ?? null;
  const scoreColor = score === null ? "var(--text3)" : score >= 75 ? "var(--sage)" : score >= 50 ? "var(--amber)" : "var(--crit)";

  const urgencyClass = { routine: "urgency-routine", monitor: "urgency-monitor", consult: "urgency-consult" }[r?.urgency] ?? "urgency-routine";
  const urgencyText = { routine: t.urgencyRoutine, monitor: t.urgencyMonitor, consult: t.urgencyConsult }[r?.urgency] ?? r?.urgency;

  const handleDL = async (type) => {
    setDlLoading(type);
    try {
      if (type === "pdf") await downloadPDF(scan);
      else if (type === "word") downloadWord(scan);
      else if (type === "md") downloadMarkdown(scan);
    } catch (e) { console.error(e); showToast("Download failed: " + e.message); }
    finally { setDlLoading(null); }
  };

  return (
    <div>
      {/* ── Report Header ───────────────────────────────────────────────── */}
      <div className="report-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          {/* Trichella logo mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", marginBottom: 16 }}>
            <div className="logo-mark" style={{ width: 34, height: 34, fontSize: 15 }}>🔬</div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: ".3px" }}>Trichella</div>
              <div className="caption">Clinical Scalp Analysis Report</div>
            </div>
            {scan.date && <div className="caption" style={{ marginLeft: "auto" }}>{new Date(scan.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>}
          </div>

          {/* Score ring */}
          <div className="score-ring" style={{ borderColor: scoreColor }}>
            <span className="score-val" style={{ color: scoreColor }}>{score ?? "—"}</span>
            <span className="score-lbl">/ 100</span>
          </div>

          {/* Primary + urgency */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="caption" style={{ marginBottom: 3 }}>{t.primaryCondition}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", color: "var(--text)", marginBottom: 8 }}>{r?.primaryCondition ?? "—"}</div>
            <div className={`urgency-badge ${urgencyClass}`}>
              <Activity size={11} /> {urgencyText}
            </div>
            {r?.urgencyReason && <div className="caption" style={{ marginTop: 6, lineHeight: 1.4 }}>{r.urgencyReason}</div>}
          </div>

          {/* Scan preview */}
          {preview && (
            <img src={preview} alt="Scalp scan" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)", flexShrink: 0 }} />
          )}
        </div>

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
      </div>

      {/* ── Patient summary ─────────────────────────────────────────────── */}
      {r?.patientSummary && (
        <div className="patient-summary" style={{ marginBottom: 16 }}>
          &ldquo;{r.patientSummary}&rdquo;
        </div>
      )}

      {/* ── Clinical Summary ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <CollapsibleSection title={t.clinicalSummary}>
          <p className="clinical-summary">{r?.summary || "—"}</p>
        </CollapsibleSection>
      </div>

      {/* ── Scalp Metrics ───────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <CollapsibleSection title={t.scalpMetrics}>
          <div className="metrics-grid">
            {[
              [t.metricDensity, r?.metrics?.density],
              [t.metricSebum, r?.metrics?.sebumLevel],
              [t.metricHydration, r?.metrics?.hydration],
              [t.metricInflammation, r?.metrics?.inflammation],
              [t.metricFollicle, r?.metrics?.follicleHealth],
              [t.metricScalpType, r?.metrics?.scalpType],
            ].map(([label, value]) => (
              <div key={label} className="metric-cell">
                <div className="metric-label">{label}</div>
                <div className="metric-value">{value ?? "—"}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* ── 6 Condition Cards ───────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <CollapsibleSection title={t.diagnosis}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
            {DIAG_CONDITIONS.map((cond) => {
              const detected = conditions.some((c) => c.toLowerCase().includes(cond.id) || c.toLowerCase() === cond.label.toLowerCase());
              const isPrimary = primary.includes(cond.id);
              return (
                <div key={cond.id} className={`cond-card ${detected ? (isPrimary ? "primary" : "detected") : "faded"}`}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{cond.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{lang === "zh" ? cond.labelZh : cond.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{detected ? (isPrimary ? t.primary : t.detected) : "—"}</div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      </div>

      {/* ── Clinical Findings ──────────────────────────────────────────── */}
      {r?.findings?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CollapsibleSection title={t.clinicalFindings}>
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

      {/* ── Recommendations ────────────────────────────────────────────── */}
      {r?.recommendations?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <CollapsibleSection title={t.recommendations}>
            <div className="rec-list">
              {r.recommendations.map((rec, i) => (
                <div key={i} className="rec-card">
                  <div className="rec-left">
                    <div className="rec-title">{rec.title}</div>
                    <div className="rec-detail">{rec.detail}</div>
                  </div>
                  <span className={`priority-badge priority-${rec.priority}`}>{t[`priority${rec.priority}`] ?? rec.priority}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

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

      {/* ── Notes ──────────────────────────────────────────────────────── */}
      <div className="note-section">
        <div className="label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <MessageSquare size={14} /> {t.noteSection}
        </div>
        <textarea
          placeholder={t.notePlaceholder}
          value={note}
          onChange={(e) => { onUpdateScan({ note: e.target.value }); setShowNoteBanner(false); }}
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

      {/* ── Accuracy check ─────────────────────────────────────────────── */}
      <div className="accuracy-section">
        <div className="label" style={{ marginBottom: 4 }}>{t.accuracyCheck}</div>
        <p className="body" style={{ marginBottom: 0 }}>{t.wasAccurate}</p>
        <div className="accuracy-btns">
          <button className={`accuracy-btn ${accuracy === "yes" ? "selected-yes" : ""}`} onClick={() => handleAccuracy("yes")}><CheckCircle size={17} /> {t.yes}</button>
          <button className={`accuracy-btn ${accuracy === "no" ? "selected-no" : ""}`} onClick={() => handleAccuracy("no")}><XCircle size={17} /> {t.no}</button>
          <button className={`accuracy-btn ${accuracy === "partial" ? "selected-partial" : ""}`} onClick={() => handleAccuracy("partial")}><MinusCircle size={17} /> {t.partially}</button>
        </div>
        {showFeedbackBanner && (
          <div className="save-banner" style={{ marginTop: 14 }}>
            <span>{t.feedbackSavedBanner}</span>
            <button type="button" onClick={() => setShowFeedbackBanner(false)}>{t.dismiss}</button>
          </div>
        )}
      </div>

      {/* ── Confirmation toast ─────────────────────────────────────────── */}
      {toast && <div className="toast"><CheckCircle size={17} /> {toast}</div>}

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
        drive: cur.drive ?? null,
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
