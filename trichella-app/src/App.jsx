/**
 * Trichella — Scalp Reading AI Diagnostics
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CheckCircle, ArrowLeft, Calendar, ChevronDown, ChevronUp, Search, Pencil, User, SlidersHorizontal, Trash2 } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ══════════════════════════════════════════════════════════════════════════════
const STORAGE_CURRENT = "trichella_current_scan";
const STORAGE_HISTORY = "trichella_scan_history";
const STORAGE_ROSTER = "trichella_customers";

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
    customerTypeAria: "New or regular customer",
    // form
    customerName: "Name",
    customerNamePlaceholder: "customer's name",
    nameRequired: "Name is required",
    genderRequired: "Gender is required",
    fillNameGender: "Enter customer name and gender to scan.",
    genderFieldLabel: "Gender",
    genderEmptyOption: "Select…",
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
    searchCustomer: "Search customer",
    recentScanned: "Recent scanned",
    customersListTitle: "Customers",
    noCustomers: "No saved customers yet. Complete a scan on the “New” tab to add one.",
    backToList: "Back to list",
    pastReport: "Past report",
    editProfile: "Edit details",
    save: "Save",
    headerEditProfile: "Edit customer details",
    headerSaveProfile: "Save details",
    editReportFeedback: "Edit",
    listFilterAria: "Filter this list",
    filterAll: "All customers",
    filterRecent: "Recent scanned",
    filterByDate: "By date",
    allReports: "All reports",
    allReportsFilterAll: "All reports",
    allReportsFilterRecent: "Recent",
    allReportsFilterDate: "By date",
    delete: "Delete",
    deleteThisReport: "Delete this report",
    deleteThisCustomer: "Delete this customer",
    confirmDeleteReport: "Remove this report from this device?",
    confirmDeleteCustomer: "Remove this customer and all of their saved reports from this device?",
    deleteAllReports: "Delete all past reports for this customer",
    confirmDeleteAllReports: "Remove all past reports for this customer from this device? The customer will stay in your list.",
    cancelSelection: "Cancel",
    deleteSelected: "Delete selected",
    confirmDeleteNReports: "Delete {n} selected report(s) from this device?",
    confirmDeleteNCustomers: "Delete {n} selected customer(s) and all their reports from this device?",
    deleteHint: "Select items to delete",
  },
  zh: {
    pageTitle: "头皮检测",
    customerReport: "客户报告",
    tabNew: "新客户",
    tabRegular: "常规",
    customerTypeAria: "新客户或常规客户",
    customerName: "姓名",
    customerNamePlaceholder: "客户姓名",
    nameRequired: "请输入姓名",
    genderRequired: "请选择性别",
    fillNameGender: "请填写客户姓名和性别后再扫描。",
    genderFieldLabel: "性别",
    genderEmptyOption: "请选择…",
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
    searchCustomer: "搜索客户",
    recentScanned: "最近检测",
    customersListTitle: "客户",
    noCustomers: "尚无客户。请先在「新客户」中完成一次检测以添加。",
    backToList: "返回列表",
    pastReport: "历史报告",
    editProfile: "编辑资料",
    save: "保存",
    headerEditProfile: "编辑客户资料",
    headerSaveProfile: "保存资料",
    editReportFeedback: "编辑",
    listFilterAria: "筛选此列表",
    filterAll: "全部客户",
    filterRecent: "最近检测",
    filterByDate: "按日期",
    allReports: "全部报告",
    allReportsFilterAll: "全部报告",
    allReportsFilterRecent: "最近",
    allReportsFilterDate: "按日期",
    delete: "删除",
    deleteThisReport: "删除此报告",
    deleteThisCustomer: "删除此客户",
    confirmDeleteReport: "从本机删除此条报告？",
    confirmDeleteCustomer: "从本机删除此客户及其所有已存报告？",
    deleteAllReports: "删除该客户全部历史报告",
    confirmDeleteAllReports: "从本机删除此客户的所有历史报告？客户仍会保留在列表中。",
    cancelSelection: "取消",
    deleteSelected: "删除所选",
    confirmDeleteNReports: "从本机删除所选的 {n} 条报告？",
    confirmDeleteNCustomers: "从本机删除所选的 {n} 位客户及其全部报告？",
    deleteHint: "请选择要删除的项",
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
  /* Intake screen — match design reference (#F0F4F2 sage page, #1B4332 headings) */
  --bg:#F0F4F2; --bg1:#FFFFFF; --bg2:#E8EEEA; --bg3:#D4DED8;
  --border:rgba(27,67,50,.12); --border2:rgba(27,67,50,.2);
  --text:#1B4332; --text2:#1B4332; --text3:#6B8075;
  --gold:#1B4332;
  --gold-lt:rgba(27,67,50,.08);
  --gold-glow:rgba(27,67,50,.2);
  --sage:#1B4332; --sage-lt:rgba(27,67,50,.12);
  --amber:#4A8157; --amber-lt:rgba(74,129,87,.14);
  --crit:#B04040; --crit-lt:rgba(176,64,64,.14);
  --intake-tab-track:#E4EBE7;
  --intake-tab-focus:rgba(107,154,196,.55);
}

body{background:var(--bg);color:var(--text)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px}

/* ── Layout ── */
.app{min-height:100vh;padding:20px 18px 32px;max-width:520px;margin:0 auto}
[data-theme="light"] .app{background:transparent}
.form-page{display:flex;flex-direction:column;gap:12px}
.form-page--below-tabs{margin-top:20px}
.app-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px}
.app-header-left{display:flex;align-items:center;gap:10px}

/* ── Typography ── */
h1,h2,h3{font-family:'Cormorant Garamond',serif}
.page-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;letter-spacing:.2px;color:var(--text);line-height:1.15}
[data-theme="light"] .page-title--intake{color:#1B4332}
.section-title-label{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:10px}
.body-text{font-size:14px;color:var(--text2);line-height:1.6}
.caption{font-size:12px;color:var(--text3)}

/* ── Header controls ── */
.lang-btn{height:36px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:13px;font-weight:600;padding:0 10px;gap:6px}
.lang-btn:hover{border-color:var(--gold);color:var(--gold)}
[data-theme="light"] .intake-header-btn{background:#FFFFFF;border:1px solid #D0D8D4;color:#1B4332;font-weight:600}
[data-theme="light"] .intake-header-btn:hover{border-color:#1B4332;color:#1B4332}
.header-icon-btn{width:36px;height:36px;border-radius:10px;border:1px solid #D0D8D4;background:#FFFFFF;color:#1B4332;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.header-icon-btn:hover{border-color:#1B4332;background:rgba(27,67,50,.04)}
.header-text-btn{height:36px;border-radius:10px;border:1px solid #1B4332;background:linear-gradient(180deg,#1B4332,#132A22);color:#FFFFFF;cursor:pointer;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;padding:0 14px;transition:all .15s;flex-shrink:0}
.header-text-btn:hover{box-shadow:0 4px 12px rgba(27,67,50,.22)}
.input-surface.surface-error{border-color:var(--crit)!important}

/* ── Card / white surfaces (intake) ── */
.card{background:var(--bg1);border:1px solid var(--border);border-radius:14px;padding:20px;transition:border .2s}
[data-theme="light"] .card--intake{background:#FFFFFF;border:1px solid #D5DED9;box-shadow:0 1px 3px rgba(16,42,30,.06)}
.input-surface{background:var(--bg1);border:1px solid var(--border);border-radius:14px;padding:14px 16px;position:relative}
[data-theme="light"] .input-surface{background:#FFFFFF;border:1px solid #D5DED9;box-shadow:0 1px 3px rgba(16,42,30,.06)}
.input-surface .form-input,.input-surface .form-select{border-color:transparent;background:transparent;padding-left:4px;padding-right:12px}
.input-surface.has-asterisk .field-asterisk{left:18px;top:23px}
.input-surface.has-asterisk .form-input,.input-surface.has-asterisk .form-select{padding-left:22px}
.input-surface .form-input:focus,.input-surface .form-select:focus{border-color:transparent;box-shadow:none;outline:2px solid rgba(27,67,50,.12);outline-offset:0;border-radius:8px}
[data-theme="dark"] .input-surface .form-input:focus,[data-theme="dark"] .input-surface .form-select:focus{outline-color:rgba(214,232,222,.2)}
.input-surface .dob-wrap .form-input{padding-right:40px}
.form-label-dob{font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px;letter-spacing:.01em;line-height:1.2}
[data-theme="light"] .form-label-dob{color:#1B4332}
.input-surface--stack{display:flex;flex-direction:column}
.dob-value-row{display:flex;align-items:center;gap:8px;min-height:44px;margin-top:2px}
.dob-wrap{flex:1;min-width:0}
[data-theme="light"] .dob-wrap .form-input{font-size:15px;font-weight:500;color:#1B4332;letter-spacing:.02em}
[data-theme="light"] .dob-wrap .form-input::-webkit-datetime-edit{ padding: 2px 0 }

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border-radius:10px;border:none;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn-solid{background:linear-gradient(135deg,var(--gold),#0E2F1F);color:#F3F7F5;box-shadow:0 4px 18px var(--gold-glow)}
[data-theme="light"] .btn-solid{background:linear-gradient(180deg,#1B4332,#132A22);color:#FFFFFF;box-shadow:0 4px 14px rgba(27,67,50,.25)}
.btn-solid:hover{transform:translateY(-1px);box-shadow:0 6px 26px var(--gold-glow)}
[data-theme="light"] .btn-solid:hover{box-shadow:0 6px 20px rgba(27,67,50,.3)}
.btn-solid:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-outline{background:transparent;color:var(--text2);border:1px solid var(--border2)}
[data-theme="light"] .btn-outline{background:#FFFFFF;border:1px solid #1B4332;color:#1B4332}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
[data-theme="light"] .btn-outline:hover{background:rgba(27,67,50,.06)}
.btn-full{width:100%}

/* ── Customer type tabs (segmented control) ── */
.customer-tabs{display:flex;gap:0;background:var(--bg2);border-radius:12px;padding:4px;border:1px solid var(--border)}
[data-theme="light"] .customer-tabs{background:var(--intake-tab-track,#E4EBE7);border:1px solid #D0D8D4}
.customer-tabs:focus-within{box-shadow:0 0 0 2px var(--intake-tab-focus, rgba(107,154,196,.45))}
.tab-btn{flex:1;padding:10px 0;border:1px solid transparent;border-radius:9px;background:transparent;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:color .15s,background .15s,border-color .15s,box-shadow .15s;color:var(--text2)}
[data-theme="light"] .tab-btn:not(.active){color:#6B8075}
.tab-btn.active{background:var(--gold);color:#F3F7F5;box-shadow:0 2px 10px rgba(27,67,50,.22);border:1px solid rgba(19,42,34,.45)}
[data-theme="dark"] .tab-btn.active{background:#2A3F35;color:#E8F0EC;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);border:1px solid rgba(214,232,222,.12)}
[data-theme="light"] .tab-btn.active{background:linear-gradient(180deg,#1B4332,#132A22);color:#F3F7F5;box-shadow:0 2px 10px rgba(27,67,50,.22);border:1px solid rgba(19,42,34,.45)}
.tab-btn:not(.active):hover{background:rgba(255,255,255,.35)}
[data-theme="light"] .tab-btn:not(.active):hover{background:rgba(255,255,255,.4);color:#4A5E56}

/* ── Regular customer list + profile ── */
.regular-back-btn{display:inline-flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:#1B4332;padding:4px 0 12px;margin:8px 0 4px}
.regular-back-btn:hover{color:#132A22}
.regular-list-row-wrap{display:flex;gap:8px;align-items:stretch;margin-bottom:8px}
.regular-list-row-wrap .regular-list-row{margin-bottom:0;flex:1;min-width:0}
.regular-list-del{flex-shrink:0;width:44px;min-height:48px;border-radius:10px;border:1px solid #D5DED9;background:#FFFFFF;color:#6B8075;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .12s;box-shadow:0 1px 2px rgba(16,42,30,.04)}
.regular-list-del:hover{border-color:var(--crit);color:var(--crit);background:var(--crit-lt)}
.list-section-hd-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
.list-section-hd-actions .regular-list-del{width:36px;min-height:36px}
.reports-hd-del{color:#6B8075}
.reports-hd-del:hover{border-color:var(--crit);color:var(--crit);background:var(--crit-lt)}
.regular-list-search{position:relative;margin-bottom:12px}
.regular-list-search .search-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#6B8075;pointer-events:none}
.regular-list-search input{width:100%;padding:12px 14px 12px 40px;border-radius:10px;border:1px solid #D5DED9;background:#FFFFFF;font-size:14px;color:#1B4332;outline:none;box-shadow:0 1px 3px rgba(16,42,30,.04)}
.regular-list-search input:focus{outline:2px solid rgba(27,67,50,.12);border-color:#C5D0CA}
.list-section-hd{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:16px 0 8px;padding-top:2px}
.list-section-hd .list-section-t{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text3)}
.list-section-d{font-size:11px;font-weight:600;color:var(--text3)}
.regular-list-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid #D5DED9;background:#FFFFFF;box-shadow:0 1px 2px rgba(16,42,30,.04);margin-bottom:8px;cursor:pointer;transition:background .15s,border-color .15s;text-align:left;width:100%;font-family:'Outfit',sans-serif}
.regular-list-row:hover{border-color:#1B4332;background:rgba(27,67,50,.03)}
.regular-list-row .nm{font-size:15px;font-weight:600;color:#1B4332;flex:1;min-width:0}
.regular-list-row .sub{font-size:12px;font-weight:600;color:#6B8075;flex-shrink:0}
.empty-roster-hint{padding:20px 14px;border-radius:10px;border:1px dashed #C5D0CA;background:rgba(255,255,255,.6);font-size:13px;color:var(--text3);line-height:1.5}
.profile-hd-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.profile-edit-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid #D0D8D4;background:#FFFFFF;color:#1B4332;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif}
.profile-edit-btn:hover{border-color:#1B4332}
.profile-readonly .form-input:read-only,.profile-readonly .form-select:disabled{background:transparent;cursor:default;opacity:1}
.past-reports-h{margin-top:18px}
.past-reports-h .list-section-t{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text3)}
.past-reports-h .list-section-d{margin-left:6px}
.past-list{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.list-filter-wrap{position:relative;flex-shrink:0}
.list-hd-action-btn{width:32px;height:32px;border-radius:8px;border:1px solid #D0D8D4;background:#FFFFFF;color:#1B4332;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .12s;flex-shrink:0}
.list-hd-action-btn:hover{border-color:#1B4332;background:rgba(27,67,50,.04)}
.list-hd-action-btn.is-active{border-color:var(--crit);color:var(--crit);background:var(--crit-lt)}
.list-select-bar{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin:10px 0 14px;flex-wrap:wrap}
.list-select-hint{font-size:12px;color:var(--text3);width:100%;margin-bottom:2px}
.list-sel-check{width:20px;height:20px;accent-color:#1B4332;flex-shrink:0;cursor:pointer;margin:0;align-self:center}
.regular-list-row--select{justify-content:flex-start;gap:10px;cursor:default}
.regular-list-row--select:not(.is-disabled):hover{background:rgba(27,67,50,.04)}
.list-filter-btn{width:32px;height:32px;border-radius:8px;border:1px solid #D0D8D4;background:#FFFFFF;color:#1B4332;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .12s}
.list-filter-btn:hover{border-color:#1B4332;background:rgba(27,67,50,.04)}
.list-filter-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:200px;z-index:20;background:#FFF;border:1px solid #D5DED9;border-radius:12px;box-shadow:0 8px 24px rgba(16,42,30,.1);padding:6px;animation:dropdownIn .15s ease}
@keyframes dropdownIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.list-filter-opt{display:block;width:100%;text-align:left;padding:9px 12px;border-radius:8px;border:none;background:none;font-size:14px;font-weight:500;color:#1B4332;cursor:pointer;font-family:'Outfit',sans-serif}
.list-filter-opt:hover{background:rgba(27,67,50,.06)}
.list-filter-opt.active{background:rgba(27,67,50,.1);font-weight:600}
.regular-list-row--with-ic{gap:10px;justify-content:flex-start}
.regular-list-ic{flex-shrink:0;width:36px;height:36px;border-radius:50%;background:rgba(27,67,50,.08);color:#1B4332;display:flex;align-items:center;justify-content:center}
.regular-list-row--with-ic .nm{flex:1;min-width:0}
.regular-list-row--with-ic .sub{margin-left:auto}
.profile-identity{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#1B4332;letter-spacing:.02em;margin-bottom:12px;line-height:1.25}
.profile-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:2px}
.profile-stat-card{background:#F6F9F7;border:1px solid #D5DED9;border-radius:10px;padding:12px 14px}
.profile-stat-label{font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.profile-stat-value{font-size:15px;font-weight:600;color:#1B4332}

/* ── Form fields ── */
.form-group{margin-bottom:0}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0;align-items:start}
.form-row--equal{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.form-row--equal > *{min-width:0;width:100%}
.form-row--equal .input-surface{width:100%;box-sizing:border-box}
.form-row--equal .dob-wrap,.form-row--equal .dob-wrap .form-input{width:100%;min-width:0;box-sizing:border-box}
.field-asterisk{position:absolute;left:10px;top:10px;z-index:1;color:var(--crit);font-size:14px;font-weight:700;line-height:1;pointer-events:none}
.input-surface .form-error{margin-top:8px}
.form-input,.form-select{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border2);background:var(--bg1);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border .15s,box-shadow .15s;appearance:none;-webkit-appearance:none}
[data-theme="light"] .form-input,[data-theme="light"] .form-select{color:#1B4332}
.form-input:focus,.form-select:focus{border-color:var(--gold)}
.form-input.error,.form-select.error{border-color:var(--crit)}
.form-input::placeholder{color:var(--text3);opacity:.9}
[data-theme="light"] .form-input::placeholder{color:#8A9B92}
.form-select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B8075' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
.form-select option{background:var(--bg1);color:var(--text)}
.form-label{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:var(--text2);margin-bottom:6px}
.form-required{color:var(--crit);font-size:14px}
.form-error{font-size:12px;color:var(--crit);margin-top:4px}
.dob-wrap{position:relative}
.dob-wrap .form-input{padding-right:40px}
.dob-wrap .dob-cal-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gold);pointer-events:none;display:flex}
[data-theme="light"] .dob-wrap .dob-cal-icon{color:#5C6F66;opacity:.88}

/* ── Upload section ── */
.upload-section-label{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;letter-spacing:.02em}
[data-theme="light"] .upload-section-label{color:#1B4332}
.upload-hint{font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.55;font-weight:500}
[data-theme="light"] .upload-hint{color:#6B8075}
.dropzone{border:2px dashed #C5D0CA;border-radius:14px;padding:40px 20px 36px;text-align:center;cursor:pointer;transition:all .2s;background:#FFFFFF;position:relative}
[data-theme="dark"] .dropzone{background:var(--bg1);border-color:var(--border2)}
.dropzone:hover,.dropzone.drag{border-color:#1B4332;background:rgba(27,67,50,.04)}
[data-theme="dark"] .dropzone:hover,[data-theme="dark"] .dropzone.drag{border-color:var(--gold);background:var(--gold-lt)}
.dropzone input{position:absolute;left:-9999px;width:0;height:0;opacity:0}
.dropzone-icon{font-size:36px;margin-bottom:8px}
.dropzone-text{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:#1B4332;letter-spacing:.02em}
[data-theme="dark"] .dropzone-text{color:var(--text)}
.dropzone-sub{font-size:12px;color:#6B8075;margin-top:6px;font-weight:500}
[data-theme="dark"] .dropzone-sub{color:var(--text3)}
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

/* ── Condition pills (report — reference palette) ── */
.condition-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}
.cond-pill-report{display:inline-flex;align-items:center;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;letter-spacing:.02em;border:none}
.card-primary-focus{border:1px solid rgba(59,130,246,.42)}
[data-theme="dark"] .card-primary-focus{border-color:rgba(129,180,255,.38)}

/* ── Diagnosis section ── */
.diagnosis-layout{display:flex;gap:16px;align-items:flex-start;margin-top:10px}
.diagnosis-thumb{width:136px;height:136px;min-width:136px;object-fit:cover;border-radius:12px;border:1px solid var(--border);flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.diagnosis-bullets{list-style:disc;padding-left:18px;display:flex;flex-direction:column;gap:7px}
.diagnosis-bullets li{font-size:13px;color:var(--text2);line-height:1.5}

/* ── Summary ── */
.summary-text{font-size:14px;color:var(--text2);line-height:1.7;margin-top:8px}

/* ── Metrics (numeric severity colors) ── */
.metrics-collapsible-body{margin-top:12px}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px;margin-top:0}
.metric-cell{border-radius:10px;padding:10px 12px;border:1px solid var(--metric-border, var(--border));background:var(--metric-bg, var(--bg2))}
.metric-cell-label{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text3);margin-bottom:4px}
.metric-cell-num{font-size:10px;font-weight:700;color:var(--metric-num, var(--text3));margin-bottom:2px;letter-spacing:.3px}
.metric-cell-value{font-size:13px;font-weight:700;color:var(--metric-fg, var(--text))}
.metric-cell--primary{background:rgba(27,67,50,.1)!important;border-color:#1B4332!important}
.metric-cell--primary .metric-cell-label{color:#4A5C54}
.metric-cell--primary .metric-cell-num,.metric-cell--primary .metric-cell-value{color:#1B4332}
.metric-cell--muted{background:#ECEEED!important;border-color:rgba(108,118,112,.28)!important}
.metric-cell--muted .metric-cell-label,.metric-cell--muted .metric-cell-num,.metric-cell--muted .metric-cell-value{color:#7A8580}
.btn-send-report{background:#1B4332!important;color:#FFFFFF!important;box-shadow:0 3px 12px rgba(27,67,50,.22)!important}
.btn-send-report:hover{filter:brightness(1.05);box-shadow:0 4px 16px rgba(27,67,50,.28)!important}
.btn-send-report:disabled{opacity:.5;filter:none}

/* ── Urgency badge ── */
.urgency-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px}
.urgency-routine{background:var(--sage-lt);color:var(--sage);border:1px solid var(--sage)}
.urgency-monitor{background:var(--amber-lt);color:var(--amber);border:1px solid var(--amber)}
.urgency-consult{background:var(--crit-lt);color:var(--crit);border:1px solid var(--crit)}

/* ── Feedback section ── */
.report-ref{font-size:12px;color:var(--text3);margin-bottom:14px}
.feedback-q{font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px}
.feedback-btns{display:flex;gap:10px;margin-bottom:18px}
.feedback-btn{flex:1;padding:10px 0;border-radius:9px;border:1px solid rgba(27,67,50,.2);background:var(--bg1);font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:var(--text2);cursor:pointer;transition:all .15s}
[data-theme="dark"] .feedback-btn{border-color:rgba(214,232,222,.2)}
[data-theme="light"] .feedback-btn{background:#FFFFFF}
.feedback-btn:hover{border-color:rgba(27,67,50,.45);color:var(--gold)}
[data-theme="dark"] .feedback-btn:hover{border-color:rgba(214,232,222,.45)}
.feedback-btn.yes-active{border-color:rgba(47,110,68,.45);background:var(--sage-lt);color:var(--sage)}
.feedback-btn.no-active{border-color:rgba(176,64,64,.45);background:var(--crit-lt);color:var(--crit)}
.notes-label{font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px}
.notes-textarea{width:100%;min-height:76px;padding:11px 14px;border-radius:10px;border:1px solid rgba(27,67,50,.22);background:var(--bg2);font-family:'Outfit',sans-serif;font-size:13px;color:var(--text);resize:vertical;outline:none;transition:border .15s,box-shadow .15s}
[data-theme="light"] .notes-textarea{background:#FFFFFF;border:1px solid rgba(27,67,50,.18)}
[data-theme="dark"] .notes-textarea{border:1px solid rgba(214,232,222,.18);background:var(--bg1)}
.notes-textarea:focus{border-color:rgba(27,67,50,.38);box-shadow:0 0 0 2px rgba(27,67,50,.06)}
[data-theme="dark"] .notes-textarea:focus{border-color:rgba(214,232,222,.32);box-shadow:0 0 0 2px rgba(214,232,222,.06)}
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

/** Report tag colors — matches patient-facing mock (sensitive = blush, oily = grey + black text). */
const CONDITION_REPORT_STYLE = {
  sensitive: { backgroundColor: "#FCEEEA", color: "#C75D5D" },
  oily: { backgroundColor: "#E8EAEB", color: "#141414" },
  dry: { backgroundColor: "#E8F4FC", color: "#1565C0" },
  acne: { backgroundColor: "#F3E5F5", color: "#6A1B9A" },
  inflammation: { backgroundColor: "#FFEBEE", color: "#B71C1C" },
  dandruff: { backgroundColor: "#ECEFF1", color: "#37474F" },
};

function conditionReportPillStyle(condId) {
  return CONDITION_REPORT_STYLE[condId] || { backgroundColor: "var(--bg2)", color: "var(--text)" };
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

function generateReportId() {
  return "N" + Math.floor(100000 + Math.random() * 900000);
}

/** Stable roster id from display name (merge scans for same person). */
function customerRosterIdFromName(name) {
  const k = String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!k) return "r_empty";
  let h = 0;
  for (let i = 0; i < k.length; i += 1) h = (Math.imul(31, h) + k.charCodeAt(i)) | 0;
  return "r" + Math.abs(h).toString(36);
}

function readJson(key, fallback) {
  try {
    const r = localStorage.getItem(key);
    if (!r) return fallback;
    const p = JSON.parse(r);
    return p ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function readHistory() {
  return readJson(STORAGE_HISTORY, []);
}

function writeHistory(arr) {
  try {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(arr));
  } catch (_) {}
}

/** Keep local history row in sync when user updates feedback on an existing scan. */
function patchHistoryScanFields(scanId, fields) {
  if (!scanId) return;
  const hist = readHistory();
  const i = hist.findIndex((h) => h.id === scanId);
  if (i < 0) return;
  hist[i] = { ...hist[i], ...fields };
  writeHistory(hist);
}

function removeHistoryEntryById(scanId) {
  if (!scanId) return;
  writeHistory(readHistory().filter((h) => h.id !== scanId));
}

function removeHistoryEntriesByIds(scanIds) {
  if (!scanIds?.length) return;
  const set = new Set(scanIds);
  writeHistory(readHistory().filter((h) => !set.has(h.id)));
}

function removeCustomersByRosterIds(rosterIds) {
  if (!rosterIds?.length) return;
  const set = new Set(rosterIds);
  const hist = readHistory().filter((h) => {
    if (!h?.customer) return true;
    const rid = h.customer.rosterId || customerRosterIdFromName(h.customer.name);
    return !set.has(rid);
  });
  writeHistory(hist);
  writeRoster(readRoster().filter((c) => !set.has(c.id)));
}

/** Remove all history for this customer; roster entry is kept (still listed under Regular). */
function removeAllHistoryForCustomerProfile(rosterId, displayName) {
  if (!rosterId) return;
  const hist = readHistory().filter((h) => {
    if (!h?.customer) return true;
    if (sameCustomerRoster(h.customer, rosterId)) return false;
    if (displayName && h.customer.name?.trim().toLowerCase() === String(displayName).trim().toLowerCase()) return false;
    return true;
  });
  writeHistory(hist);
  syncRosterWithHistory();
}

function readRoster() {
  return readJson(STORAGE_ROSTER, []);
}

function writeRoster(arr) {
  try {
    localStorage.setItem(STORAGE_ROSTER, JSON.stringify(arr));
  } catch (_) {}
}

/**
 * Rebuilds roster from scan history and merges with stored roster.
 * Any completed scan (new or regular) adds/updates a customer.
 */
function syncRosterWithHistory() {
  const hist = readHistory();
  const existing = readRoster();
  const byId = new Map();
  for (const c of existing) {
    if (c?.id) byId.set(c.id, { ...c });
  }
  for (const h of hist) {
    if (!h?.customer?.name) continue;
    const name = String(h.customer.name).trim();
    if (!name) continue;
    const id = h.customer.rosterId || customerRosterIdFromName(name);
    const nextDate = h.date || "";
    const cur = byId.get(id) || { id, name, gender: "", dob: "" };
    byId.set(id, {
      id,
      name,
      gender: h.customer.gender || cur.gender || "",
      dob: h.customer.dob || cur.dob || "",
      lastScan: !cur.lastScan || (nextDate && new Date(nextDate) >= new Date(cur.lastScan)) ? nextDate : cur.lastScan,
    });
  }
  const merged = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  writeRoster(merged);
  return merged;
}

function sameCustomerRoster(cust, rosterId) {
  if (!cust || !rosterId) return false;
  if (cust.rosterId) return cust.rosterId === rosterId;
  return customerRosterIdFromName(cust.name) === rosterId;
}

function customerPastReportsFromHistory(rosterId, name) {
  return readHistory().filter((h) => {
    if (rosterId && h?.customer) return sameCustomerRoster(h.customer, rosterId);
    if (name && h?.customer?.name) return h.customer.name.trim().toLowerCase() === name.trim().toLowerCase();
    return false;
  });
}

/** Newest history entry = first in array; used for "Name | N123" display. */
function lastReportIdForCustomer(rosterId, name) {
  for (const h of readHistory()) {
    if (!h?.customer?.name) continue;
    if (rosterId && sameCustomerRoster(h.customer, rosterId) && h.reportId) return h.reportId;
    if (name && h.customer.name.trim().toLowerCase() === name.trim().toLowerCase() && h.reportId) return h.reportId;
  }
  return "";
}

function upsertCustomerInRosterFromScan(fullCustomer) {
  if (!fullCustomer?.name) return;
  const name = String(fullCustomer.name).trim();
  if (!name) return;
  const id = fullCustomer.rosterId || customerRosterIdFromName(name);
  const list = readRoster();
  const i = list.findIndex((c) => c.id === id);
  const next = { id, name, gender: fullCustomer.gender || "", dob: fullCustomer.dob || "", lastScan: new Date().toISOString() };
  if (i >= 0) list[i] = { ...list[i], ...next, lastScan: next.lastScan };
  else list.push(next);
  writeRoster(list);
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

/** Metric keys most relevant to each primary condition (shown in green on the report). */
const PRIMARY_METRICS_BY_CONDITION = {
  sensitive: ["hydration", "scalpType", "inflammation"],
  oily: ["sebumLevel", "scalpType"],
  dry: ["hydration", "density"],
  acne: ["follicleHealth", "inflammation"],
  inflammation: ["inflammation", "hydration", "follicleHealth"],
  dandruff: ["sebumLevel", "scalpType", "density"],
};

function primaryConditionIdFromLabel(primaryLabel) {
  const p = (primaryLabel || "").trim().toLowerCase();
  const hit = DIAG_CONDITIONS.find((c) => p.includes(c.id) || p === c.label.toLowerCase());
  return hit?.id ?? null;
}

function isMetricPrimaryAligned(metricKey, primaryCondId) {
  if (!primaryCondId) return false;
  const keys = PRIMARY_METRICS_BY_CONDITION[primaryCondId];
  return Array.isArray(keys) && keys.includes(metricKey);
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

function CustomerFormSection({ onComplete, lang, t }) {
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
        customer: { name: name.trim(), gender, dob, type: "new" },
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
      <div className={`input-surface has-asterisk${nameError ? " surface-error" : ""}`}>
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

      <div className="form-row form-row--equal">
        <div className={`input-surface input-surface--stack${genderError ? " surface-error" : ""}`} style={{ minWidth: 0 }}>
          <div className="form-label-dob" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>{t.genderFieldLabel}</span>
            <span className="form-required" aria-hidden="true">*</span>
          </div>
          <select
            className={`form-select${genderError ? " error" : ""}`}
            value={gender}
            onChange={(e) => { setGender(e.target.value); setGenderError(false); }}
            aria-required
          >
            <option value="">{t.genderEmptyOption}</option>
            <option value="male">{t.genderMale}</option>
            <option value="female">{t.genderFemale}</option>
            <option value="other">{t.genderOther}</option>
          </select>
          {genderError && <div className="form-error">{t.genderRequired}</div>}
        </div>
        <div className="input-surface input-surface--stack input-surface--dob" style={{ minWidth: 0 }}>
          <div className="form-label-dob">{t.dobLabel}</div>
          <div className="dob-value-row">
            <div className="dob-wrap">
              <input
                className="form-input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                aria-label={t.dobLabel}
                style={{ colorScheme: "light" }}
              />
              <span className="dob-cal-icon" aria-hidden><Calendar size={18} strokeWidth={2} /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card--intake">
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
// REGULAR CUSTOMER — list + profile + upload (same analysis pipeline as new)
// ══════════════════════════════════════════════════════════════════════════════

function ListFilterMenu({ t, value, onChange, mode = "default" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const options = mode === "reports" ? [
    { id: "all", label: t.allReportsFilterAll },
    { id: "recent", label: t.allReportsFilterRecent },
    { id: "date", label: t.allReportsFilterDate },
  ] : [
    { id: "all", label: t.filterAll },
    { id: "recent", label: t.filterRecent },
    { id: "date", label: t.filterByDate },
  ];
  return (
    <div className="list-filter-wrap" ref={ref}>
      <button
        type="button"
        className="list-filter-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t.listFilterAria}
        aria-haspopup="menu"
      >
        <SlidersHorizontal size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="list-filter-menu" role="menu">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitem"
              className={`list-filter-opt${value === o.id ? " active" : ""}`}
              onClick={() => { onChange(o.id); setOpen(false); }}
            >
              {o.label}
              {value === o.id ? " \u2713" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function genderToLabel(t, g) {
  if (g === "male") return t.genderMale;
  if (g === "female") return t.genderFemale;
  if (g === "other") return t.genderOther;
  return g || "—";
}

function RegularCustomerList({ t, lang, onSelect, rosterVersion, onBatchDeleteHistory, onBatchDeleteCustomers }) {
  const [q, setQ] = useState("");
  const [recentFilter, setRecentFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [deleteMode, setDeleteMode] = useState(null);
  const [selRecent, setSelRecent] = useState([]);
  const [selCustomers, setSelCustomers] = useState([]);
  const roster = useMemo(() => {
    syncRosterWithHistory();
    return readRoster();
  }, [rosterVersion, q]);
  const hist = useMemo(() => readHistory(), [rosterVersion]);
  const year = new Date().getFullYear();
  const todayStr = useMemo(
    () => new Date().toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    [lang],
  );
  const qy = q.trim().toLowerCase();
  const baseRoster = roster.filter((c) => (c.name || "").toLowerCase().includes(qy));
  const customerRows = useMemo(() => {
    let rows = baseRoster;
    if (customerFilter === "recent") {
      const th = Date.now() - 30 * 86400000;
      rows = rows.filter((c) => c.lastScan && new Date(c.lastScan) >= th);
    }
    rows = [...rows].sort((a, b) => {
      if (customerFilter === "date") {
        return new Date(b.lastScan || 0) - new Date(a.lastScan || 0);
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    return rows;
  }, [baseRoster, customerFilter, rosterVersion]);
  const recentRows = useMemo(() => {
    let rows = hist.filter((h) => h?.customer?.name);
    if (recentFilter === "recent") {
      const th = Date.now() - 7 * 86400000;
      rows = rows.filter((h) => new Date(h.date) >= th);
    }
    rows = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (recentFilter === "all") {
      return rows.slice(0, 8);
    }
    return rows.slice(0, 12);
  }, [hist, recentFilter, rosterVersion]);

  useEffect(() => {
    setSelRecent((prev) => prev.filter((id) => recentRows.some((h) => h.id === id)));
  }, [recentFilter, recentRows, rosterVersion]);
  useEffect(() => {
    setSelCustomers((prev) => prev.filter((id) => customerRows.some((c) => c.id === id)));
  }, [customerFilter, customerRows, rosterVersion]);

  const toggleRecentSel = (id) => {
    setSelRecent((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const toggleCustomerSel = (id) => {
    setSelCustomers((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const startRecentDeleteMode = () => {
    if (deleteMode === "recent") {
      setDeleteMode(null);
      setSelRecent([]);
    } else {
      setDeleteMode("recent");
      setSelCustomers([]);
    }
  };
  const startCustomerDeleteMode = () => {
    if (deleteMode === "customers") {
      setDeleteMode(null);
      setSelCustomers([]);
    } else {
      setDeleteMode("customers");
      setSelRecent([]);
    }
  };

  const runDeleteRecent = () => {
    if (!selRecent.length) return;
    if (!window.confirm(t.confirmDeleteNReports.replace("{n}", String(selRecent.length)))) return;
    onBatchDeleteHistory(selRecent);
    setDeleteMode(null);
    setSelRecent([]);
  };
  const runDeleteCustomers = () => {
    if (!selCustomers.length) return;
    if (!window.confirm(t.confirmDeleteNCustomers.replace("{n}", String(selCustomers.length)))) return;
    onBatchDeleteCustomers(selCustomers);
    setDeleteMode(null);
    setSelCustomers([]);
  };

  return (
    <div className="form-page form-page--below-tabs">
      <div className="regular-list-search">
        <span className="search-ic" aria-hidden><Search size={16} strokeWidth={2.2} /></span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchCustomer}
          aria-label={t.searchCustomer}
        />
      </div>
      <div className="list-section-hd" style={{ alignItems: "center" }}>
        <span>
          <span className="list-section-t">{t.recentScanned}</span>
          <span className="list-section-d"> | {todayStr}</span>
        </span>
        <div className="list-section-hd-actions">
          <button
            type="button"
            className={`list-hd-action-btn${deleteMode === "recent" ? " is-active" : ""}`}
            onClick={startRecentDeleteMode}
            title={deleteMode === "recent" ? t.cancelSelection : t.delete}
            aria-label={deleteMode === "recent" ? t.cancelSelection : t.delete}
            aria-pressed={deleteMode === "recent"}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
          <ListFilterMenu t={t} value={recentFilter} onChange={setRecentFilter} mode="default" />
        </div>
      </div>
      {deleteMode === "recent" && (
        <p className="list-select-hint" role="status">{t.deleteHint}</p>
      )}
      {recentRows.length > 0 ? (
        recentRows.map((h) => {
          const id = h.customer.rosterId || customerRosterIdFromName(h.customer.name);
          const inSel = selRecent.includes(h.id);
          return (
            <div key={h.id} className="regular-list-row-wrap">
              {deleteMode === "recent" && (
                <input
                  type="checkbox"
                  className="list-sel-check"
                  checked={inSel}
                  onChange={() => toggleRecentSel(h.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={h.reportId || h.customer.name}
                />
              )}
              <button
                type="button"
                className={`regular-list-row regular-list-row--with-ic${deleteMode === "recent" ? " regular-list-row--select" : ""}`}
                onClick={() => {
                  if (deleteMode === "recent") toggleRecentSel(h.id);
                  else
                    onSelect({
                      id, name: h.customer.name.trim(), gender: h.customer.gender || "", dob: h.customer.dob || "",
                    });
                }}
              >
                <div className="regular-list-ic" aria-hidden><User size={18} strokeWidth={2} /></div>
                <span className="nm">{h.customer.name}</span>
                {h.reportId && <span className="sub">{h.reportId}</span>}
              </button>
            </div>
          );
        })
      ) : null}
      {deleteMode === "recent" && recentRows.length > 0 && (
        <div className="list-select-bar">
          <button type="button" className="btn btn-outline" onClick={() => { setDeleteMode(null); setSelRecent([]); }}>
            {t.cancelSelection}
          </button>
          <button type="button" className="btn btn-solid" disabled={!selRecent.length} onClick={runDeleteRecent}>
            {t.deleteSelected}
            {selRecent.length > 0 ? ` (${selRecent.length})` : ""}
          </button>
        </div>
      )}

      <div className="list-section-hd" style={{ marginTop: 18, alignItems: "center" }}>
        <span>
          <span className="list-section-t">{t.customersListTitle}</span>
          <span className="list-section-d"> | {year}</span>
        </span>
        <div className="list-section-hd-actions">
          <button
            type="button"
            className={`list-hd-action-btn${deleteMode === "customers" ? " is-active" : ""}`}
            onClick={startCustomerDeleteMode}
            title={deleteMode === "customers" ? t.cancelSelection : t.delete}
            aria-label={deleteMode === "customers" ? t.cancelSelection : t.delete}
            aria-pressed={deleteMode === "customers"}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
          <ListFilterMenu t={t} value={customerFilter} onChange={setCustomerFilter} mode="default" />
        </div>
      </div>
      {deleteMode === "customers" && (
        <p className="list-select-hint" role="status">{t.deleteHint}</p>
      )}
      {customerRows.length > 0 ? (
        customerRows.map((c) => {
          const rid = lastReportIdForCustomer(c.id, c.name);
          const inSel = selCustomers.includes(c.id);
          return (
            <div key={c.id} className="regular-list-row-wrap">
              {deleteMode === "customers" && (
                <input
                  type="checkbox"
                  className="list-sel-check"
                  checked={inSel}
                  onChange={() => toggleCustomerSel(c.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={c.name}
                />
              )}
              <button
                type="button"
                className={`regular-list-row regular-list-row--with-ic${deleteMode === "customers" ? " regular-list-row--select" : ""}`}
                onClick={() => {
                  if (deleteMode === "customers") toggleCustomerSel(c.id);
                  else onSelect({ id: c.id, name: c.name, gender: c.gender || "", dob: c.dob || "" });
                }}
              >
                <div className="regular-list-ic" aria-hidden><User size={18} strokeWidth={2} /></div>
                <span className="nm">{c.name}</span>
                {rid ? <span className="sub">| {rid}</span> : null}
              </button>
            </div>
          );
        })
      ) : (
        <div className="empty-roster-hint">{t.noCustomers}</div>
      )}
      {deleteMode === "customers" && customerRows.length > 0 && (
        <div className="list-select-bar">
          <button type="button" className="btn btn-outline" onClick={() => { setDeleteMode(null); setSelCustomers([]); }}>
            {t.cancelSelection}
          </button>
          <button type="button" className="btn btn-solid" disabled={!selCustomers.length} onClick={runDeleteCustomers}>
            {t.deleteSelected}
            {selCustomers.length > 0 ? ` (${selCustomers.length})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}

function RegularCustomerIntake({ t, lang, profile, onBack, onComplete, onOpenPastReport, rosterVersion, onProfileUpdate, editorOpen, onEditorOpenChange, onRegisterSave, onDeleteReportEntry, onDeleteAllReports }) {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender);
  const [dob, setDob] = useState(profile.dob);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setDob(profile.dob);
  }, [profile.id, profile.name, profile.gender, profile.dob, rosterVersion]);

  const canScan = Boolean(name.trim() && gender && file);
  const year = new Date().getFullYear();
  const [reportFilter, setReportFilter] = useState("all");
  const displayReportId = useMemo(
    () => lastReportIdForCustomer(profile.id, profile.name),
    [profile.id, profile.name, rosterVersion, name],
  );
  const past = useMemo(
    () => customerPastReportsFromHistory(profile.id, profile.name)
      .filter((e) => e.id && e.report) // have stored report
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [profile.id, profile.name, rosterVersion],
  );
  const pastFiltered = useMemo(() => {
    let p = past;
    if (reportFilter === "recent") {
      const th = Date.now() - 30 * 86400000;
      p = p.filter((e) => new Date(e.date) >= th);
    }
    return [...p].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [past, reportFilter]);

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

  const handleCancel = () => { setFile(null); setPreview(null); setError(null); };

  const saveProfile = useCallback(() => {
    const ne = !name.trim();
    const ge = !gender;
    setNameError(ne);
    setGenderError(ge);
    if (ne || ge) return false;
    const p = { id: profile.id, name: name.trim(), gender, dob, lastScan: profile.lastScan };
    onProfileUpdate(p);
    onEditorOpenChange(false);
    return true;
  }, [name, gender, dob, profile.id, profile.lastScan, onProfileUpdate, onEditorOpenChange]);

  useEffect(() => {
    onRegisterSave?.(saveProfile);
    return () => onRegisterSave?.(null);
  }, [onRegisterSave, saveProfile]);

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
      const wasConverted = type.startsWith("video/") || type.includes("bmp") || type === "image/heic" || ["bmp", "wmv", "avi", "mov", "mp4", "webm"].includes(ext);
      const previewFinal = wasConverted ? `data:image/png;base64,${b64}` : preview;
      const reportId = generateReportId();
      setTimeout(() => onComplete({
        id: scanId,
        reportId,
        date: new Date().toISOString(),
        customer: { name: name.trim(), gender, dob, type: "regular", rosterId: profile.id },
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
    <div className="form-page form-page--below-tabs">
      <button type="button" className="regular-back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        {t.backToList}
      </button>
      <div className="card card--intake" style={{ marginBottom: 12 }}>
        {editorOpen ? (
          <>
            <div className="section-title-label" style={{ marginBottom: 10 }}>{t.editProfile}</div>
            <div className={`input-surface has-asterisk${nameError ? " surface-error" : ""}`} style={{ marginBottom: 10 }}>
              <span className="field-asterisk" aria-hidden>*</span>
              <input
                className={`form-input${nameError ? " error" : ""}`}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
                placeholder={t.customerNamePlaceholder}
              />
              {nameError && <div className="form-error">{t.nameRequired}</div>}
            </div>
            <div className="form-row form-row--equal">
              <div className={`input-surface input-surface--stack${genderError ? " surface-error" : ""}`} style={{ minWidth: 0 }}>
                <div className="form-label-dob" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span>{t.genderFieldLabel}</span>
                  <span className="form-required" aria-hidden>*</span>
                </div>
                <select
                  className={`form-select${genderError ? " error" : ""}`}
                  value={gender}
                  onChange={(e) => { setGender(e.target.value); setGenderError(false); }}
                >
                  <option value="">{t.genderEmptyOption}</option>
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                </select>
                {genderError && <div className="form-error">{t.genderRequired}</div>}
              </div>
              <div className="input-surface input-surface--stack" style={{ minWidth: 0 }}>
                <div className="form-label-dob">{t.dobLabel}</div>
                <div className="dob-value-row">
                  <div className="dob-wrap">
                    <input
                      className="form-input"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ colorScheme: "light" }}
                    />
                    <span className="dob-cal-icon" aria-hidden><Calendar size={18} strokeWidth={2} /></span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="profile-identity">
              {name || "—"}
              {displayReportId ? <span> | {displayReportId}</span> : null}
            </div>
            <div className="profile-stat-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-label">{t.genderFieldLabel}</div>
                <div className="profile-stat-value">{genderToLabel(t, gender)}</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-label">{t.dobLabel}</div>
                <div className="profile-stat-value">{dob ? formatDate(dob, lang) : "—"}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="card card--intake">
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
            {!canScan && <p className="caption" style={{ marginTop: 14, textAlign: "center" }}>{t.fillNameGender}</p>}
            <div className="action-row">
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleCancel}>{t.cancel}</button>
              <button type="button" className="btn btn-solid" style={{ flex: 1, opacity: canScan ? 1 : 0.5 }} onClick={handleScan}>{t.scan}</button>
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
      {past.length > 0 && (
        <div className="card card--intake" style={{ marginBottom: 0, marginTop: 20 }}>
          <div className="list-section-hd past-reports-h" style={{ margin: "0 0 8px", alignItems: "center" }}>
            <span>
              <span className="list-section-t">{t.allReports}</span>
              <span className="list-section-d"> | {year}</span>
            </span>
            <div className="list-section-hd-actions">
              <button
                type="button"
                className="regular-list-del reports-hd-del"
                onClick={() => { if (window.confirm(t.confirmDeleteAllReports)) onDeleteAllReports?.(); }}
                title={t.deleteAllReports}
                aria-label={t.deleteAllReports}
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
              <ListFilterMenu t={t} value={reportFilter} onChange={setReportFilter} mode="reports" />
            </div>
          </div>
          <div className="past-list">
            {pastFiltered.map((h) => (
              <div key={h.id} className="regular-list-row-wrap">
                <button
                  type="button"
                  className="regular-list-row regular-list-row--with-ic"
                  onClick={() => onOpenPastReport(h)}
                >
                  <div className="regular-list-ic" aria-hidden><User size={18} strokeWidth={2} /></div>
                  <span className="nm">{formatDate(h.date, lang)}</span>
                  {h.reportId && <span className="sub">{h.reportId}</span>}
                </button>
                <button
                  type="button"
                  className="regular-list-del"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm(t.confirmDeleteReport)) onDeleteReportEntry?.(h.id); }}
                  aria-label={t.deleteThisReport}
                  title={t.deleteThisReport}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE (e.g. scalp metrics dropdown)
// ══════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({ title, children, defaultOpen = false, ariaLabel }) {
  const [open, setOpen] = useState(defaultOpen);
  const a11y = ariaLabel || title;
  return (
    <div>
      <div
        className="section-header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={a11y}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span className="section-toggle-title">{title}</span>
        <span className="toggle-icon" aria-hidden>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>
      {open && <div className="metrics-collapsible-body">{children}</div>}
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
  }, [scan?.id, scan?.viewingPastReport]);

  if (!scan) return null;

  const { report: r, preview, customer, reportId, date } = scan;
  const viewingPast = scan.viewingPastReport === true;
  const conditions = r?.conditions || [];
  const primaryLabel = r?.primaryCondition || "";
  const primaryLc = primaryLabel.toLowerCase();
  const primaryCondId = primaryConditionIdFromLabel(primaryLabel);

  const detectedConditionTags = DIAG_CONDITIONS.filter((c) =>
    conditions.some((rc) => {
      const x = rc.toLowerCase();
      return x.includes(c.id) || x === c.label.toLowerCase();
    })
  ).sort((a, b) => {
    const pa = primaryLc.includes(a.id) ? 0 : 1;
    const pb = primaryLc.includes(b.id) ? 0 : 1;
    return pa - pb || a.id.localeCompare(b.id);
  });

  const handleSend = () => {
    onUpdateScan({ accuracy: feedbackAccurate, note: notes, feedbackSent: true, viewingPastReport: false });
    setFeedbackSent(true);
    showToast(t.feedbackSent);
  };

  const diagnosisPoints = (r?.findings || []).slice(0, 3);
  const summaryText = r?.patientSummary || r?.summary || "—";

  const m = r?.metrics || {};
  const metricRows = [
    { key: "density", label: t.metricDensity, raw: m.density },
    { key: "sebumLevel", label: t.metricSebum, raw: m.sebumLevel },
    { key: "hydration", label: t.metricHydration, raw: m.hydration },
    { key: "inflammation", label: t.metricInflammation, raw: m.inflammation },
    { key: "follicleHealth", label: t.metricFollicle, raw: m.follicleHealth },
    { key: "scalpType", label: t.metricScalpType, raw: m.scalpType },
  ];

  return (
    <div>
      {/* ── Patient row (outside card) + Primary condition card (mock palette) ── */}
      <div style={{ marginBottom: 14 }}>
        <div className="patient-info-row" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            <span className="patient-name">{customer?.name || "—"}</span>
            {reportId && <span className="patient-id">| {reportId}</span>}
          </div>
          <span className="patient-date" style={{ flexShrink: 0 }}>{t.dateLabel} | {formatDate(date, lang)}</span>
        </div>
        <div className="card card-primary-focus">
          <div className="section-title-label" style={{ marginBottom: 10 }}>{t.primaryConditionLabel}</div>
          <div className="condition-pills">
            {detectedConditionTags.length > 0 ? (
              detectedConditionTags.map((cond) => {
                const label = lang === "zh" ? cond.labelZh : cond.label;
                return (
                  <span key={cond.id} className="cond-pill-report" style={conditionReportPillStyle(cond.id)}>
                    {label}
                  </span>
                );
              })
            ) : (
              <span className="caption">—</span>
            )}
          </div>
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

      {/* ── Scalp Metrics — collapsible dropdown ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <CollapsibleSection
          key={scan.id}
          title={t.scalpMetrics}
          defaultOpen={false}
          ariaLabel={`${t.toggleSectionAria}: ${t.scalpMetrics}`}
        >
          <div className="metrics-grid">
            {metricRows.map((row) => {
              const sev = metricSeverity0to100(row.raw, row.key);
              const display = translateMetricValue(row.raw, lang, t);
              const primaryAligned = isMetricPrimaryAligned(row.key, primaryCondId);
              return (
                <div
                  key={row.key}
                  className={`metric-cell${primaryAligned ? " metric-cell--primary" : " metric-cell--muted"}`}
                >
                  <div className="metric-cell-label">{row.label}</div>
                  <div className="metric-cell-num">
                    {t.metricSeverityIndex}: {Math.round(sev)}
                  </div>
                  <div className="metric-cell-value">{display}</div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
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
            onClick={() => { if (!feedbackSent && !viewingPast) setFeedbackAccurate("yes"); }}
            disabled={feedbackSent || viewingPast}
          >
            {t.yes}
          </button>
          <button
            className={`feedback-btn${feedbackAccurate === "no" ? " no-active" : ""}`}
            onClick={() => { if (!feedbackSent && !viewingPast) setFeedbackAccurate("no"); }}
            disabled={feedbackSent || viewingPast}
          >
            {t.no}
          </button>
        </div>

        <div className="notes-label">{t.additionalNotes}</div>
        <textarea
          className="notes-textarea"
          placeholder={t.notesPlaceholder}
          value={notes}
          onChange={(e) => { if (!feedbackSent && !viewingPast) setNotes(e.target.value); }}
          disabled={feedbackSent || viewingPast}
        />

        {viewingPast && !feedbackSent ? (
          <button
            type="button"
            className="btn btn-solid btn-full btn-send-report"
            style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            onClick={() => onUpdateScan({ viewingPastReport: false })}
            aria-label={t.editReportFeedback}
          >
            <Pencil size={16} strokeWidth={2.2} />
            <span>{t.editReportFeedback}</span>
          </button>
        ) : !feedbackSent ? (
          <button
            type="button"
            className="btn btn-solid btn-full btn-send-report"
            style={{ marginTop: 14 }}
            onClick={handleSend}
          >
            {t.sendFeedback}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-solid btn-full btn-send-report"
            style={{ marginTop: 14 }}
            disabled
          >
            <><CheckCircle size={16} /> {t.feedbackSent}</>
          </button>
        )}
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
  const [regularProfile, setRegularProfile] = useState(null);
  const [rosterVersion, setRosterVersion] = useState(0);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const saveDebounce = useRef(null);
  const registerProfileSave = useRef(null);
  const setProfileSaveHandler = useCallback((fn) => { registerProfileSave.current = fn; }, []);

  const changeCustomerType = useCallback((next) => {
    setCustomerType(next);
    setRegularProfile(null);
    setProfileEditorOpen(false);
  }, []);

  useEffect(() => {
    setProfileEditorOpen(false);
  }, [regularProfile?.id]);

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
        if (p?.report && p?.id) {
          setScan(p);
          const c = p.customer;
          if (c && c.type === "regular") {
            setCustomerType("regular");
            setRegularProfile({
              id: c.rosterId || customerRosterIdFromName(c.name),
              name: c.name || "",
              gender: c.gender || "",
              dob: c.dob || "",
              lastScan: p.date,
            });
          } else {
            setCustomerType("new");
            setRegularProfile(null);
          }
        }
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
    setScan((s) => {
      if (!s) return null;
      const n = { ...s, ...partial };
      if (n.id && ("note" in partial || "accuracy" in partial || "feedbackSent" in partial)) {
        patchHistoryScanFields(n.id, { note: n.note, accuracy: n.accuracy, feedbackSent: n.feedbackSent });
      }
      return n;
    });
  }, []);

  const handleAnalysisComplete = useCallback((newData) => {
    const enriched = newData?.customer
      ? {
        ...newData,
        customer: {
          ...newData.customer,
          rosterId: newData.customer.rosterId || customerRosterIdFromName(newData.customer.name),
        },
      }
      : newData;
    if (enriched?.customer) {
      upsertCustomerInRosterFromScan(enriched.customer);
      syncRosterWithHistory();
      setRosterVersion((v) => v + 1);
    }
    setScan((cur) => {
      archiveCurrentToHistory(cur);
      return { ...enriched, note: "", accuracy: null, feedbackSent: false, viewingPastReport: false };
    });
  }, [archiveCurrentToHistory]);

  const handleNewScan = useCallback(() => {
    setScan((cur) => {
      archiveCurrentToHistory(cur);
      try { localStorage.removeItem(STORAGE_CURRENT); } catch (_) {}
      return null;
    });
    // Keep regular customer selected so back from report returns to profile + list flow
  }, [archiveCurrentToHistory]);

  const openPastReport = useCallback((entry) => {
    if (!entry?.report) return;
    const c = entry.customer || {};
    const rid = c.rosterId || customerRosterIdFromName(c.name);
    setScan({
      id: entry.id,
      reportId: entry.reportId,
      date: entry.date,
      customer: { ...c, rosterId: rid, type: "regular" },
      preview: entry.preview,
      report: entry.report,
      note: entry.note ?? "",
      accuracy: entry.accuracy ?? null,
      feedbackSent: entry.feedbackSent ?? false,
      drive: entry.drive ?? null,
      viewingPastReport: true,
    });
    setCustomerType("regular");
    setRegularProfile({
      id: rid,
      name: c.name || "",
      gender: c.gender || "",
      dob: c.dob || "",
      lastScan: entry.date,
    });
  }, []);

  const handleProfileUpdate = useCallback((p) => {
    setRegularProfile(p);
    const list = readRoster();
    const i = list.findIndex((c) => c.id === p.id);
    const row = { id: p.id, name: p.name, gender: p.gender || "", dob: p.dob || "", lastScan: p.lastScan || new Date().toISOString() };
    if (i >= 0) list[i] = { ...list[i], ...row };
    else list.push(row);
    writeRoster(list);
    setRosterVersion((v) => v + 1);
  }, []);

  const clearStoredCurrentIfScanId = useCallback((scanId) => {
    if (!scanId) return;
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.id === scanId) localStorage.removeItem(STORAGE_CURRENT);
      }
    } catch (_) {}
  }, []);

  const handleBatchDeleteHistory = useCallback((ids) => {
    if (!ids?.length) return;
    removeHistoryEntriesByIds(ids);
    syncRosterWithHistory();
    setRosterVersion((v) => v + 1);
    setScan((s) => (s && ids.includes(s.id) ? null : s));
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.id && ids.includes(p.id)) localStorage.removeItem(STORAGE_CURRENT);
      }
    } catch (_) {}
  }, []);

  const handleBatchDeleteCustomers = useCallback((rids) => {
    if (!rids?.length) return;
    removeCustomersByRosterIds(rids);
    setRosterVersion((v) => v + 1);
    const sset = new Set(rids);
    setRegularProfile((rp) => (rp && sset.has(rp.id) ? null : rp));
    setScan((s) => {
      if (!s?.customer) return s;
      const rid = s.customer.rosterId || customerRosterIdFromName(s.customer.name);
      if (sset.has(rid)) {
        try { localStorage.removeItem(STORAGE_CURRENT); } catch (_) {}
        return null;
      }
      return s;
    });
  }, []);

  const handleDeleteReportFromProfile = useCallback(
    (scanId) => {
      removeHistoryEntryById(scanId);
      syncRosterWithHistory();
      setRosterVersion((v) => v + 1);
      setScan((s) => (s?.id === scanId ? null : s));
      clearStoredCurrentIfScanId(scanId);
    },
    [clearStoredCurrentIfScanId],
  );

  const handleDeleteAllReportsForProfile = useCallback(() => {
    if (!regularProfile?.id) return;
    removeAllHistoryForCustomerProfile(regularProfile.id, regularProfile.name);
    setRosterVersion((v) => v + 1);
    setScan((s) => {
      if (s?.customer && sameCustomerRoster(s.customer, regularProfile.id)) {
        try { localStorage.removeItem(STORAGE_CURRENT); } catch (_) {}
        return null;
      }
      return s;
    });
  }, [regularProfile]);

  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("trichella_lang") || "en";
    return "en";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  useEffect(() => {
    localStorage.setItem("trichella_lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const t = T[lang] || T.en;
  const inResults = !!scan;
  const useIntakeChrome = !inResults;

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
            <span className={`page-title${useIntakeChrome ? " page-title--intake" : ""}`}>{inResults ? t.customerReport : t.pageTitle}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!inResults && customerType === "regular" && regularProfile && (
              profileEditorOpen ? (
                <button
                  type="button"
                  className="header-text-btn"
                  onClick={() => registerProfileSave.current?.()}
                  title={t.headerSaveProfile}
                >
                  {t.save}
                </button>
              ) : (
                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={() => setProfileEditorOpen(true)}
                  title={t.headerEditProfile}
                  aria-label={t.headerEditProfile}
                >
                  <Pencil size={16} />
                </button>
              )
            )}
            <button
              type="button"
              className={`lang-btn${useIntakeChrome ? " intake-header-btn" : ""}`}
              onClick={() => setLang((l) => (l === "en" ? "zh" : "en"))}
              title={lang === "en" ? "切换到中文" : "Switch to English"}
            >
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        {!inResults ? (
          <>
            <div className="customer-tabs" role="tablist" aria-label={t.customerTypeAria}>
              <button
                type="button"
                role="tab"
                aria-selected={customerType === "new"}
                className={`tab-btn ${customerType === "new" ? "active" : ""}`}
                onClick={() => changeCustomerType("new")}
              >
                {t.tabNew}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={customerType === "regular"}
                className={`tab-btn ${customerType === "regular" ? "active" : ""}`}
                onClick={() => changeCustomerType("regular")}
              >
                {t.tabRegular}
              </button>
            </div>
            {customerType === "new" ? (
              <CustomerFormSection
                key="form-new"
                onComplete={handleAnalysisComplete}
                lang={lang}
                t={t}
              />
            ) : !regularProfile ? (
              <RegularCustomerList
                key={`roster-${rosterVersion}`}
                t={t}
                lang={lang}
                rosterVersion={rosterVersion}
                onSelect={(p) => { setProfileEditorOpen(false); setRegularProfile(p); }}
                onBatchDeleteHistory={handleBatchDeleteHistory}
                onBatchDeleteCustomers={handleBatchDeleteCustomers}
              />
            ) : (
              <RegularCustomerIntake
                key={`reg-profile-${regularProfile.id}`}
                t={t}
                lang={lang}
                profile={regularProfile}
                rosterVersion={rosterVersion}
                editorOpen={profileEditorOpen}
                onEditorOpenChange={setProfileEditorOpen}
                onRegisterSave={setProfileSaveHandler}
                onBack={() => { setProfileEditorOpen(false); setRegularProfile(null); }}
                onComplete={handleAnalysisComplete}
                onOpenPastReport={openPastReport}
                onProfileUpdate={handleProfileUpdate}
                onDeleteReportEntry={handleDeleteReportFromProfile}
                onDeleteAllReports={handleDeleteAllReportsForProfile}
              />
            )}
          </>
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
