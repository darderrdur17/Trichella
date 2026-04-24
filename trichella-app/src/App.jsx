/**
 * Trichella — Scalp Reading AI Diagnostics
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Moon, CheckCircle, ArrowLeft, Calendar } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ══════════════════════════════════════════════════════════════════════════════
const STORAGE_CURRENT = "trichella_current_scan";
const STORAGE_HISTORY = "trichella_scan_history";

// ══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════
const T = {
  en: {
    // app chrome
    pageTitle: "Scalp Reading",
    customerReport: "Customer Report",
    tabNew: "New",
    tabRegular: "Regular",
    // form
    customerName: "Name",
    customerNamePlaceholder: "Customer's name",
    nameRequired: "Name is required",
    genderRequired: "Gender is required",
    fillNameGender: "Enter customer name and gender to scan.",
    genderPlaceholder: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    dobPlaceholder: "Date of Birth",
    dobLabel: "Date of Birth",
    uploadScalpImage: "Upload scalp image",
    uploadHint: "Image: JPG, PNG, BMP, HEIC · Video: MP4, WebM, MOV, WMV, AVI · up to 20 MB",
    dropHere: "Drop your scalp photo here",
    orClick: "or click to browse",
    cancel: "Cancel",
    scan: "Scan",
    analysing: "Analysing…",
    fileError: "Please choose an image (JPG, PNG, BMP, HEIC) or video (MP4, WebM, MOV, WMV, AVI).",
    analysisError: "Analysis failed. Ensure backend is running and OPENAI_API_KEY is set.",
    // results
    dateLabel: "Date",
    primaryConditionLabel: "Primary Condition",
    diagnosisLabel: "Diagnosis",
    overallSummaryLabel: "Overall Summary",
    scalpMetrics: "Scalp Metrics",
    reportLabel: "Report",
    isReportCorrect: "Is this report correct?",
    yes: "Yes",
    no: "No",
    additionalNotes: "Additional notes for better accuracy",
    notesPlaceholder: "Add any observations or notes…",
    sendFeedback: "Send",
    feedbackSent: "Feedback sent — thank you!",
    newScan: "New scan",
    // metric translations
    metricDensity: "Density",
    metricSebum: "Sebum Level",
    metricHydration: "Hydration",
    metricInflammation: "Inflammation",
    metricFollicle: "Follicle Health",
    metricScalpType: "Scalp Type",
    metricLow: "Low",
    metricMed: "Medium",
    metricHigh: "High",
    scalpNormal: "Normal",
    scalpOily: "Oily",
    scalpDry: "Dry",
    scalpCombination: "Combination",
    scalpSensitive: "Sensitive",
    toggleSectionAria: "Expand or collapse section",
    scanPreviewAlt: "Scalp scan preview",
    metricConditionBurden: "Condition burden",
    metricScoreHint: "0–100 · higher = more severe",
    metricSeverityIndex: "Severity index",
  },
  zh: {
    pageTitle: "头皮检测",
    customerReport: "客户报告",
    tabNew: "新客户",
    tabRegular: "常规",
    customerName: "姓名",
    customerNamePlaceholder: "客户姓名",
    nameRequired: "请输入姓名",
    genderRequired: "请选择性别",
    fillNameGender: "请填写客户姓名和性别后再扫描。",
    genderPlaceholder: "性别",
    genderMale: "男",
    genderFemale: "女",
    genderOther: "其他",
    dobPlaceholder: "出生日期",
    dobLabel: "出生日期",
    uploadScalpImage: "上传头皮图像",
    uploadHint: "图片：JPG、PNG、BMP、HEIC · 视频：MP4、WebM、MOV、WMV、AVI · 最大 20 MB",
    dropHere: "将头皮照片拖放到此处",
    orClick: "或点击上传",
    cancel: "取消",
    scan: "扫描",
    analysing: "分析中…",
    fileError: "请选择图片（JPG、PNG、BMP、HEIC）或视频（MP4、WebM、MOV、WMV、AVI）。",
    analysisError: "分析失败。请确保后端已启动且已设置 OPENAI_API_KEY。",
    dateLabel: "日期",
    primaryConditionLabel: "主要诊断",
    diagnosisLabel: "诊断结果",
    overallSummaryLabel: "总体摘要",
    scalpMetrics: "头皮指标",
    reportLabel: "报告",
    isReportCorrect: "此报告是否准确？",
    yes: "是",
    no: "否",
    additionalNotes: "补充说明以提高准确性",
    notesPlaceholder: "添加任何观察或备注…",
    sendFeedback: "发送",
    feedbackSent: "反馈已发送，感谢！",
    newScan: "重新扫描",
    metricDensity: "密度",
    metricSebum: "皮脂水平",
    metricHydration: "水分",
    metricInflammation: "炎症",
    metricFollicle: "毛囊健康",
    metricScalpType: "头皮类型",
    metricLow: "低",
    metricMed: "中",
    metricHigh: "高",
    scalpNormal: "正常",
    scalpOily: "油性",
    scalpDry: "干性",
    scalpCombination: "混合",
    scalpSensitive: "敏感",
    toggleSectionAria: "展开或收起此区块",
    scanPreviewAlt: "头皮扫描预览",
    metricConditionBurden: "症状负担指数",
    metricScoreHint: "0–100 · 越高越严重",
    metricSeverityIndex: "严重度指数",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden;transition:background .25s,color .25s}

/* ── Themes ── */
:root,[data-theme="dark"]{
  --bg:#07130E; --bg1:#0C1A13; --bg2:#102219; --bg3:#183526;
  --border:rgba(214,232,222,.16); --border2:rgba(214,232,222,.26);
  --text:#F3F7F5; --text2:#B6CBC0; --text3:#81988A;
  --gold:#1F5C3A;
  --gold-lt:rgba(31,92,58,.18);
  --gold-glow:rgba(31,92,58,.32);
  --sage:#3C7A4E; --sage-lt:rgba(60,122,78,.20);
  --amber:#5C8C63; --amber-lt:rgba(92,140,99,.18);
  --crit:#B45454; --crit-lt:rgba(180,84,84,.18);
}
[data-theme="light"]{
  --bg:#E8F0E9; --bg1:#FFFFFF; --bg2:#ECF3EE; --bg3:#D4E3D9;
  --border:rgba(12,40,26,.10); --border2:rgba(12,40,26,.22);
  --text:#102018; --text2:#4C6254; --text3:#809486;
  --gold:#1F5C3A;
  --gold-lt:rgba(31,92,58,.10);
  --gold-glow:rgba(31,92,58,.25);
  --sage:#2F6E44; --sage-lt:rgba(47,110,68,.16);
  --amber:#4A8157; --amber-lt:rgba(74,129,87,.16);
  --crit:#B04040; --crit-lt:rgba(176,64,64,.16);
}

body{background:var(--bg);color:var(--text)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px}

/* ── Layout ── */
.app{min-height:100vh;padding:20px;max-width:520px;margin:0 auto}
[data-theme="light"] .app{background:transparent}
.form-page{display:flex;flex-direction:column;gap:16px}
.app-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:12px}
.app-header-left{display:flex;align-items:center;gap:10px}

/* ── Typography ── */
h1,h2,h3{font-family:'Cormorant Garamond',serif}
.page-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;letter-spacing:.3px;color:var(--text)}
.section-title-label{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:10px}
.body-text{font-size:14px;color:var(--text2);line-height:1.6}
.caption{font-size:12px;color:var(--text3)}

/* ── Header controls ── */
.theme-btn,.lang-btn{height:36px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:13px;font-weight:600;padding:0 10px;gap:6px}
.theme-btn:hover,.lang-btn:hover{border-color:var(--gold);color:var(--gold)}

/* ── Card ── */
.card{background:var(--bg1);border:1px solid var(--border);border-radius:14px;padding:20px;transition:border .2s}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border-radius:10px;border:none;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-solid{background:linear-gradient(135deg,var(--gold),#0E2F1F);color:#F3F7F5;box-shadow:0 4px 18px var(--gold-glow)}
.btn-solid:hover{transform:translateY(-1px);box-shadow:0 6px 26px var(--gold-glow)}
.btn-solid:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-outline{background:transparent;color:var(--text2);border:1px solid var(--border2)}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.btn-full{width:100%}

/* ── Customer type tabs ── */
.customer-tabs{display:flex;gap:0;margin-bottom:20px;background:var(--bg2);border-radius:10px;padding:4px}
.tab-btn{flex:1;padding:9px 0;border:none;border-radius:7px;background:transparent;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;color:var(--text3)}
.tab-btn.active{background:var(--gold);color:#F3F7F5;box-shadow:0 2px 12px var(--gold-glow)}

/* ── Form fields ── */
.form-group{margin-bottom:0}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0}
.field-wrap{position:relative;margin-bottom:14px}
.field-asterisk{position:absolute;left:10px;top:10px;z-index:1;color:var(--crit);font-size:14px;font-weight:700;line-height:1;pointer-events:none}
.field-wrap.has-asterisk .form-input,.field-wrap.has-asterisk .form-select{padding-left:22px}
.form-input,.form-select{width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--border2);background:var(--bg1);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border .15s;appearance:none;-webkit-appearance:none}
.form-input:focus,.form-select:focus{border-color:var(--gold)}
.form-input.error,.form-select.error{border-color:var(--crit)}
.form-input::placeholder{color:var(--text3)}
.form-select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2381988A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
.form-select option{background:var(--bg1);color:var(--text)}
.form-label{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:var(--text2);margin-bottom:6px}
.form-required{color:var(--crit);font-size:14px}
.form-error{font-size:12px;color:var(--crit);margin-top:4px}
.dob-wrap{position:relative}
.dob-wrap .form-input{padding-right:40px}
.dob-wrap .dob-cal-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gold);pointer-events:none;display:flex}

/* ── Upload section ── */
.upload-section-label{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px}
.upload-hint{font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.5}
.dropzone{border:2px dashed var(--border2);border-radius:12px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg1);position:relative}
.dropzone:hover,.dropzone.drag{border-color:var(--gold);background:var(--gold-lt)}
.dropzone input{position:absolute;left:-9999px;width:0;height:0;opacity:0}
.dropzone-icon{font-size:36px;margin-bottom:8px}
.dropzone-text{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:var(--text)}
.dropzone-sub{font-size:12px;color:var(--text3);margin-top:4px}
.preview-img{width:100%;max-height:220px;object-fit:cover;border-radius:10px;border:1px solid var(--border);display:block}
.preview-video{width:100%;max-height:220px;object-fit:cover;border-radius:10px;border:1px solid var(--border);display:block}

/* ── Progress ── */
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{border-radius:50%;border:2px solid var(--bg3);border-top-color:var(--gold);animation:spin .8s linear infinite;flex-shrink:0}
.progress-bar{height:4px;border-radius:99px;background:var(--bg3);overflow:hidden;margin-top:12px}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),#0E2F1F);border-radius:99px;transition:width .8s ease}

/* ── Error ── */
.error-box{margin-top:14px;padding:13px 16px;background:var(--crit-lt);border:1px solid var(--crit);border-radius:10px;font-size:13px;color:var(--crit)}

/* ── Action row ── */
.action-row{display:flex;gap:10px;margin-top:16px}

/* ── Back button ── */
.back-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;border:1px solid var(--border2);background:var(--bg2);color:var(--text2);cursor:pointer;transition:all .15s;flex-shrink:0}
.back-btn:hover{border-color:var(--gold);color:var(--gold)}

/* ── Report — patient info row ── */
.patient-info-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.patient-name{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--text)}
.patient-id{font-size:13px;font-weight:600;color:var(--text3)}
.patient-date{font-size:12px;color:var(--text3)}
.primary-inline{margin-top:10px;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;padding:8px 14px;border-radius:10px;display:inline-block;border:1px solid transparent}

/* ── Condition pills ── */
.condition-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.cond-pill{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.2px;cursor:default}
.cond-pill-primary{background:var(--gold);color:#F3F7F5}
.cond-pill-detected{background:var(--sage-lt);color:var(--sage);border:1px solid var(--sage)}

/* ── Diagnosis section ── */
.diagnosis-layout{display:flex;gap:14px;align-items:flex-start;margin-top:10px}
.diagnosis-thumb{width:84px;height:84px;object-fit:cover;border-radius:10px;border:1px solid var(--border);flex-shrink:0}
.diagnosis-bullets{list-style:disc;padding-left:18px;display:flex;flex-direction:column;gap:7px}
.diagnosis-bullets li{font-size:13px;color:var(--text2);line-height:1.5}

/* ── Summary ── */
.summary-text{font-size:14px;color:var(--text2);line-height:1.7;margin-top:8px}

/* ── Metrics (numeric severity colors) ── */
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px;margin-top:10px}
.metric-cell{border-radius:10px;padding:10px 12px;border:1px solid var(--metric-border, var(--border));background:var(--metric-bg, var(--bg2))}
.metric-cell-label{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text3);margin-bottom:4px}
.metric-cell-num{font-size:10px;font-weight:700;color:var(--metric-num, var(--text3));margin-bottom:2px;letter-spacing:.3px}
.metric-cell-value{font-size:13px;font-weight:700;color:var(--metric-fg, var(--text))}

/* ── Urgency badge ── */
.urgency-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px}
.urgency-routine{background:var(--sage-lt);color:var(--sage);border:1px solid var(--sage)}
.urgency-monitor{background:var(--amber-lt);color:var(--amber);border:1px solid var(--amber)}
.urgency-consult{background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit)}

/* ── Feedback section ── */
.report-ref{font-size:12px;color:var(--text3);margin-bottom:14px}
.feedback-q{font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px}
.feedback-btns{display:flex;gap:10px;margin-bottom:18px}
.feedback-btn{flex:1;padding:10px 0;border-radius:9px;border:1px solid var(--border2);background:var(--bg1);font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:var(--text2);cursor:pointer;transition:all .15s}
.feedback-btn:hover{border-color:var(--gold);color:var(--gold)}
.feedback-btn.yes-active{border-color:var(--sage);background:var(--sage-lt);color:var(--sage)}
.feedback-btn.no-active{border-color:var(--crit);background:var(--crit-lt);color:var(--crit)}
.notes-label{font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px}
.notes-textarea{width:100%;min-height:76px;padding:11px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);font-family:'Outfit',sans-serif;font-size:13px;color:var(--text);resize:vertical;outline:none;transition:border .15s}
.notes-textarea:focus{border-color:var(--gold)}
.notes-textarea::placeholder{color:var(--text3)}

/* ── Section toggle ── */
.section-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none}
.section-toggle-title{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--text3);transition:color .15s}
.section-header:hover .section-toggle-title{color:var(--text)}
.toggle-icon{background:none;border:none;color:var(--text3);cursor:pointer;padding:2px;display:flex;align-items:center}

/* ── Toast ── */
@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);max-width:calc(100% - 32px);padding:13px 22px;border-radius:12px;background:var(--gold);color:#fff;font-size:14px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.25);z-index:1000;animation:toastIn .3s ease;display:flex;align-items:center;gap:10px}
`;

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
const DIAG_CONDITIONS = [
  { id: "dry",          label: "Dry Scalp",          labelZh: "干燥头皮", icon: "💧" },
  { id: "oily",         label: "Oily Scalp",          labelZh: "油性头皮", icon: "✨" },
  { id: "sensitive",    label: "Sensitive Scalp",     labelZh: "敏感头皮", icon: "🌿" },
  { id: "acne",         label: "Acne Scalp",          labelZh: "痤疮头皮", icon: "⚡" },
  { id: "inflammation", label: "Inflammation Scalp",  labelZh: "炎症头皮", icon: "🔴" },
  { id: "dandruff",     label: "Dandruff Scalp",      labelZh: "头屑头皮", icon: "❄️" },
];

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function generateReportId() {
  return "N" + Math.floor(100000 + Math.random() * 900000);
}

function translateMetricValue(raw, lang, t) {
  if (raw == null || raw === "") return "—";
  const s = String(raw).trim();
  if (/%/.test(s)) return s;
  if (lang !== "zh") return s;
  const map = {
    low: t.metricLow, medium: t.metricMed, high: t.metricHigh,
    normal: t.scalpNormal, oily: t.scalpOily, dry: t.scalpDry,
    combination: t.scalpCombination, sensitive: t.scalpSensitive,
  };
  return map[s.toLowerCase().replace(/\s+/g, "")] || s;
}

/** Parse Low / Medium / High from EN or ZH strings. */
function parseLmhToken(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return null;
  if (/\blow\b|^低|干燥.*低|低\s*$/i.test(s)) return "low";
  if (/\bmed\b|\bmedium\b|^中|中等/i.test(s)) return "medium";
  if (/\bhigh\b|^高|高\s*$/i.test(s)) return "high";
  return null;
}

/** Map L/M/H to a 0–100 severity where higher = worse. If invert, high raw → low severity. */
function lmhToSeverity0to100(tri, invert) {
  const t = tri || "medium";
  let x = t === "low" ? 24 : t === "medium" ? 52 : 84;
  if (invert) x = 100 - x;
  return x;
}

/**
 * Numeric severity 0–100 (higher = more concerning) per metric for color bands.
 * Uses explicit numeric rules: percentages, L/M/H, and scalp type mapping.
 */
function metricSeverity0to100(raw, metricKey) {
  const s = String(raw ?? "").trim().toLowerCase();
  const compact = s.replace(/\s+/g, "");
  const pctMatch = String(raw ?? "").match(/(\d+(?:\.\d+)?)\s*%/);
  const pct = pctMatch ? parseFloat(pctMatch[1]) : NaN;

  switch (metricKey) {
    case "overallScore": {
      const n = Number(raw);
      return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 48;
    }
    case "density":
      return lmhToSeverity0to100(parseLmhToken(s), true);
    case "inflammation":
      return lmhToSeverity0to100(parseLmhToken(s), false);
    case "follicleHealth":
      return lmhToSeverity0to100(parseLmhToken(s), true);
    case "hydration":
      return lmhToSeverity0to100(parseLmhToken(s), true);
    case "sebumLevel":
      if (Number.isFinite(pct)) {
        return Math.min(100, Math.max(0, Math.abs(pct - 42) * 2.08));
      }
      return lmhToSeverity0to100(parseLmhToken(s), false);
    case "scalpType": {
      if (compact.includes("sensitive")) return 68;
      if (compact.includes("combination") || compact.includes("混合")) return 48;
      if (compact.includes("oily") || compact.includes("油")) return 60;
      if (compact.includes("dry") || compact.includes("干")) return 52;
      if (compact.includes("normal") || compact.includes("正常")) return 22;
      const map = { normal: 22, dry: 52, oily: 60, combination: 48, sensitive: 68 };
      return map[compact] ?? 44;
    }
    default:
      return 48;
  }
}

/** Tier colors from numeric severity (0–100): green / amber / red. */
function metricBandStyle(score0to100) {
  const v = Math.max(0, Math.min(100, score0to100));
  if (v <= 33) {
    return { borderColor: "var(--sage)", background: "var(--sage-lt)", color: "var(--sage)" };
  }
  if (v <= 66) {
    return { borderColor: "var(--amber)", background: "var(--amber-lt)", color: "var(--amber)" };
  }
  return { borderColor: "var(--crit)", background: "var(--crit-lt)", color: "var(--crit)" };
}

function primaryConditionBadgeStyle(overallScore) {
  const n = Number(overallScore);
  const s = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 48;
  const band = metricBandStyle(s);
  return {
    ...band,
    display: "inline-block",
    marginTop: 10,
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 700,
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16,
    borderWidth: 1,
    borderStyle: "solid",
  };
}

function primaryConditionDisplayLabel(primaryLabel, lang) {
  const p = (primaryLabel || "").trim().toLowerCase();
  const hit = DIAG_CONDITIONS.find((c) => p.includes(c.id) || p === c.label.toLowerCase());
  if (hit) return lang === "zh" ? hit.labelZh : hit.label;
  return primaryLabel?.trim() || "—";
}

function formatDate(iso, lang) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch (_) { return ""; }
}

function fileToB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

async function toSupportedFormat(file) {
  const type = (file.type || "").toLowerCase();
  const ext = (file.name || "").split(".").pop()?.toLowerCase();
  const supported = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
  if (supported.includes(type) || ["png", "jpeg", "jpg", "gif", "webp"].includes(ext)) {
    return { b64: await fileToB64(file), mime: type.startsWith("image/") ? type : "image/jpeg" };
  }
  const url = URL.createObjectURL(file);
  try {
    if (type.startsWith("video/") || ["mp4", "webm", "mov", "wmv", "avi"].includes(ext)) return await videoFrameToPng(url);
    if (type === "image/bmp" || ext === "bmp" || type.includes("bmp")) return await imageToPng(url);
    if (type === "image/heic" || ext === "heic") return await imageToPng(url);
    return { b64: await fileToB64(file), mime: "image/jpeg" };
  } finally { URL.revokeObjectURL(url); }
}

function imageToPng(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const d = canvas.toDataURL("image/png");
      res({ b64: d.split(",")[1], mime: "image/png" });
    };
    img.onerror = () => rej(new Error("Could not load image"));
    img.src = url;
  });
}

function videoFrameToPng(url) {
  return new Promise((res, rej) => {
    const video = document.createElement("video");
    video.muted = true; video.playsInline = true; video.preload = "metadata";
    video.onloadeddata = () => { const d = video.duration; video.currentTime = Number.isFinite(d) ? Math.min(1, d * 0.1) : 0.5; };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const d = canvas.toDataURL("image/png");
      res({ b64: d.split(",")[1], mime: "image/png" });
    };
    video.onerror = () => rej(new Error("Could not load video"));
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
// CUSTOMER FORM + UPLOAD
// ══════════════════════════════════════════════════════════════════════════════

function CustomerFormSection({ onComplete, lang, t, customerType, onCustomerTypeChange, theme }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const fileRef = useRef();

  const canScan = Boolean(name.trim() && gender && file);

  const pick = (f) => {
    if (!f) return;
    const type = (f.type || "").toLowerCase();
    const ext = (f.name || "").split(".").pop()?.toLowerCase();
    const isImage = type.startsWith("image/") || /\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(f.name || "");
    const isVideo = type.startsWith("video/") || ["mp4", "webm", "mov", "wmv", "avi"].includes(ext);
    if (!isImage && !isVideo) { setError(t.fileError); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!file) return;
    const ne = !name.trim();
    const ge = !gender;
    setNameError(ne);
    setGenderError(ge);
    if (ne || ge) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 12, 90)), 450);
    try {
      const { b64, mime } = await toSupportedFormat(file);
      const scanId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const { report, drive } = await runAI(b64, mime, lang, scanId);
      if (import.meta.env.DEV || import.meta.env.VITE_LOG_DRIVE === "1") {
        console.info("[Trichella] Drive:", drive);
      }
      clearInterval(interval);
      setProgress(100);
      const type = (file.type || "").toLowerCase();
      const ext = (file.name || "").split(".").pop()?.toLowerCase();
      const wasConverted = type.startsWith("video/") || type.includes("bmp") || type === "image/heic" || ["bmp","wmv","avi","mov","mp4","webm"].includes(ext);
      const previewFinal = wasConverted ? `data:image/png;base64,${b64}` : preview;
      const reportId = generateReportId();
      setTimeout(() => onComplete({
        id: scanId,
        reportId,
        date: new Date().toISOString(),
        customer: { name: name.trim(), gender, dob, type: customerType },
        preview: previewFinal,
        report,
        drive,
      }), 400);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || t.analysisError);
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="customer-tabs">
        <button type="button" className={`tab-btn ${customerType === "new" ? "active" : ""}`} onClick={() => onCustomerTypeChange("new")}>
          {t.tabNew}
        </button>
        <button type="button" className={`tab-btn ${customerType === "regular" ? "active" : ""}`} onClick={() => onCustomerTypeChange("regular")}>
          {t.tabRegular}
        </button>
      </div>

      <div className="field-wrap has-asterisk">
        <span className="field-asterisk" aria-hidden="true">*</span>
        <input
          className={`form-input${nameError ? " error" : ""}`}
          type="text"
          placeholder={t.customerNamePlaceholder}
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(false); }}
          autoComplete="name"
          aria-required
        />
        {nameError && <div className="form-error">{t.nameRequired}</div>}
      </div>

      <div className="form-row">
        <div className="field-wrap has-asterisk">
          <span className="field-asterisk" aria-hidden="true">*</span>
          <select
            className={`form-select${genderError ? " error" : ""}`}
            value={gender}
            onChange={(e) => { setGender(e.target.value); setGenderError(false); }}
            aria-required
          >
            <option value="">{t.genderPlaceholder}</option>
            <option value="male">{t.genderMale}</option>
            <option value="female">{t.genderFemale}</option>
            <option value="other">{t.genderOther}</option>
          </select>
          {genderError && <div className="form-error">{t.genderRequired}</div>}
        </div>
        <div>
          <div className="form-label" style={{ marginBottom: 6 }}>{t.dobLabel}</div>
          <div className="dob-wrap">
            <input
              className="form-input"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              aria-label={t.dobLabel}
              style={{ colorScheme: theme === "light" ? "light" : "dark" }}
            />
            <span className="dob-cal-icon" aria-hidden><Calendar size={18} strokeWidth={2} /></span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="upload-section-label">{t.uploadScalpImage}</div>
        <div className="upload-hint">{t.uploadHint}</div>

        {!preview ? (
          <div
            className="dropzone"
            role="button"
            tabIndex={0}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("drag"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); pick(e.dataTransfer?.files?.[0]); }}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.bmp,image/bmp,video/*,.mp4,.webm,.mov,.wmv,.avi"
              onChange={(e) => { pick(e.target?.files?.[0]); e.target.value = ""; }}
              aria-hidden
            />
            <div className="dropzone-icon">📸</div>
            <div className="dropzone-text">{t.dropHere}</div>
            <div className="dropzone-sub">{t.orClick}</div>
          </div>
        ) : (
          <div>
            {file?.type?.startsWith("video/") ? (
              <video src={preview} controls className="preview-video" />
            ) : (
              <img src={preview} alt={t.scanPreviewAlt} className="preview-img" />
            )}
          </div>
        )}

        {preview && !loading && (
          <>
            {!canScan && (
              <p className="caption" style={{ marginTop: 14, textAlign: "center" }}>{t.fillNameGender}</p>
            )}
            <div className="action-row">
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleCancel}>
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn btn-solid"
                style={{ flex: 1, opacity: canScan ? 1 : 0.5 }}
                onClick={handleScan}
              >
                {t.scan}
              </button>
            </div>
          </>
        )}

        {loading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="spinner" style={{ width: 18, height: 18 }} />
              <span className="caption">{t.analysing}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <div className="error-box">⚠️ {error}</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER REPORT (RESULTS)
// ══════════════════════════════════════════════════════════════════════════════

function CustomerReportSection({ scan, onUpdateScan, lang, t }) {
  const [feedbackAccurate, setFeedbackAccurate] = useState(scan.accuracy ?? null);
  const [notes, setNotes] = useState(scan.note ?? "");
  const [feedbackSent, setFeedbackSent] = useState(scan.feedbackSent ?? false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 5000); };

  useEffect(() => {
    setFeedbackAccurate(scan.accuracy ?? null);
    setNotes(scan.note ?? "");
    setFeedbackSent(scan.feedbackSent ?? false);
  }, [scan?.id]);

  if (!scan) return null;

  const { report: r, preview, customer, reportId, date } = scan;
  const conditions = r?.conditions || [];
  const primaryLabel = r?.primaryCondition || "";
  const overallScore = r?.overallScore;

  const handleSend = () => {
    onUpdateScan({ accuracy: feedbackAccurate, note: notes, feedbackSent: true });
    setFeedbackSent(true);
    showToast(t.feedbackSent);
  };

  const diagnosisPoints = (r?.findings || []).slice(0, 3);
  const summaryText = r?.patientSummary || r?.summary || "—";

  const m = r?.metrics || {};
  const metricRows = [
    { key: "overallScore", label: t.metricConditionBurden, raw: overallScore },
    { key: "density", label: t.metricDensity, raw: m.density },
    { key: "sebumLevel", label: t.metricSebum, raw: m.sebumLevel },
    { key: "hydration", label: t.metricHydration, raw: m.hydration },
    { key: "inflammation", label: t.metricInflammation, raw: m.inflammation },
    { key: "follicleHealth", label: t.metricFollicle, raw: m.follicleHealth },
    { key: "scalpType", label: t.metricScalpType, raw: m.scalpType },
  ];

  return (
    <div>
      {/* ── Patient header + primary condition (no urgency / summary under name) ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="patient-info-row">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="patient-name">{customer?.name || "—"}</span>
              {reportId && <span className="patient-id">| {reportId}</span>}
            </div>
            <span style={primaryConditionBadgeStyle(overallScore)}>
              {primaryConditionDisplayLabel(primaryLabel, lang)}
            </span>
          </div>
          <span className="patient-date" style={{ alignSelf: "flex-start" }}>{t.dateLabel} | {formatDate(date, lang)}</span>
        </div>
      </div>

      {/* ── Diagnosis ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title-label">{t.diagnosisLabel}</div>
        <div className="diagnosis-layout">
          {preview && (
            <img src={preview} alt={t.scanPreviewAlt} className="diagnosis-thumb" />
          )}
          <div style={{ flex: 1 }}>
            {diagnosisPoints.length > 0 ? (
              <ul className="diagnosis-bullets">
                {diagnosisPoints.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            ) : (
              conditions.length > 0 ? (
                <ul className="diagnosis-bullets">
                  {conditions.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              ) : (
                <span className="caption">—</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Overall Summary ── */}
      <div style={{ marginBottom: 14 }}>
        <div className="section-title-label">{t.overallSummaryLabel}</div>
        <div className="card">
          <p className="summary-text">{summaryText}</p>
        </div>
      </div>

      {/* ── Scalp Metrics — all rows, colors from numeric severity index ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title-label" style={{ marginBottom: 4 }}>{t.scalpMetrics}</div>
        <p className="caption" style={{ marginBottom: 10 }}>{t.metricScoreHint}</p>
        <div className="metrics-grid">
          {metricRows.map((row) => {
            const sev = metricSeverity0to100(row.raw, row.key);
            const band = metricBandStyle(sev);
            const display =
              row.key === "overallScore"
                ? (Number.isFinite(Number(row.raw)) ? `${Math.round(Number(row.raw))}/100` : "—")
                : translateMetricValue(row.raw, lang, t);
            return (
              <div
                key={row.key}
                className="metric-cell"
                style={{
                  borderColor: band.borderColor,
                  background: band.background,
                }}
              >
                <div className="metric-cell-label">{row.label}</div>
                {row.key !== "overallScore" && (
                  <div className="metric-cell-num" style={{ color: band.color }}>
                    {t.metricSeverityIndex}: {Math.round(sev)}
                  </div>
                )}
                <div className="metric-cell-value" style={{ color: band.color }}>{display}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feedback ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        {reportId && (
          <div className="report-ref">{t.reportLabel} | {reportId}</div>
        )}
        <div className="feedback-q">{t.isReportCorrect}</div>
        <div className="feedback-btns">
          <button
            className={`feedback-btn${feedbackAccurate === "yes" ? " yes-active" : ""}`}
            onClick={() => { if (!feedbackSent) setFeedbackAccurate("yes"); }}
            disabled={feedbackSent}
          >
            {t.yes}
          </button>
          <button
            className={`feedback-btn${feedbackAccurate === "no" ? " no-active" : ""}`}
            onClick={() => { if (!feedbackSent) setFeedbackAccurate("no"); }}
            disabled={feedbackSent}
          >
            {t.no}
          </button>
        </div>

        <div className="notes-label">{t.additionalNotes}</div>
        <textarea
          className="notes-textarea"
          placeholder={t.notesPlaceholder}
          value={notes}
          onChange={(e) => { if (!feedbackSent) setNotes(e.target.value); }}
          disabled={feedbackSent}
        />

        <button
          className="btn btn-solid btn-full"
          style={{ marginTop: 14 }}
          onClick={handleSend}
          disabled={feedbackSent}
        >
          {feedbackSent ? <><CheckCircle size={16} /> {t.feedbackSent}</> : t.sendFeedback}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && <div className="toast"><CheckCircle size={16} /> {toast}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [scan, setScan] = useState(null);
  const [customerType, setCustomerType] = useState("new");
  const saveDebounce = useRef(null);

  const archiveCurrentToHistory = useCallback((cur) => {
    if (!cur?.report) return;
    try {
      const hist = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
      hist.unshift({
        id: cur.id, reportId: cur.reportId, date: cur.date,
        customer: cur.customer, preview: cur.preview, report: cur.report,
        note: cur.note ?? "", accuracy: cur.accuracy ?? null,
        drive: cur.drive ?? null, feedbackSent: cur.feedbackSent ?? false,
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
      try { localStorage.setItem(STORAGE_CURRENT, JSON.stringify(scan)); }
      catch (e) { console.warn("Could not persist scan", e); }
    }, 500);
    return () => clearTimeout(saveDebounce.current);
  }, [scan]);

  const updateScan = useCallback((partial) => {
    setScan((s) => (s ? { ...s, ...partial } : null));
  }, []);

  const handleAnalysisComplete = useCallback((newData) => {
    setScan((cur) => {
      archiveCurrentToHistory(cur);
      return { ...newData, note: "", accuracy: null, feedbackSent: false };
    });
  }, [archiveCurrentToHistory]);

  const handleNewScan = useCallback(() => {
    setScan((cur) => {
      archiveCurrentToHistory(cur);
      try { localStorage.removeItem(STORAGE_CURRENT); } catch (_) {}
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
    if (typeof window !== "undefined") return localStorage.getItem("trichella_lang") || "en";
    return "en";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trichella_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("trichella_lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const t = T[lang] || T.en;
  const inResults = !!scan;

  return (
    <>
      <style>{G}</style>
      <div className="app">
        {/* ── Header ── */}
        <header className="app-header">
          <div className="app-header-left">
            {inResults && (
              <button className="back-btn" onClick={handleNewScan} aria-label="Back to new scan" title={t.newScan}>
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="page-title">{inResults ? t.customerReport : t.pageTitle}</span>
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
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        {!inResults ? (
          <CustomerFormSection
            key="form"
            onComplete={handleAnalysisComplete}
            lang={lang}
            t={t}
            theme={theme}
            customerType={customerType}
            onCustomerTypeChange={setCustomerType}
          />
        ) : (
          <CustomerReportSection
            scan={scan}
            onUpdateScan={updateScan}
            lang={lang}
            t={t}
          />
        )}
      </div>
    </>
  );
}
