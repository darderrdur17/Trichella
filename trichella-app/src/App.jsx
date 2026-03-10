/**
 * Trichella — Full-Stack MVP
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *   Landing → Auth → Dashboard → Scan Flow → Results → History → Pro Mode
 *                                                     → Training Hub (Ground Truth)
 *                                                     → Settings
 *
 * Tech: React + hooks, Recharts, Lucide icons, Anthropic Vision API,
 *       Persistent storage API for scan history & training pairs.
 *
 * Design: Dark clinical luxury — deep charcoal, warm gold accents, sage/terra
 *         health indicators. Cormorant Garamond display + Outfit body.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import {
  Camera, Upload, ChevronRight, ChevronLeft, BarChart2, Users, Brain,
  Settings, Home, Zap, Star, Shield, TrendingUp, AlertCircle, CheckCircle,
  Clock, Download, Plus, ArrowRight, Microscope, Layers, RefreshCw,
  Database, Target, Activity, User, LogOut, Menu, X, BookOpen, Award
} from "lucide-react";
import { saveScanAsPdf } from "./lib/pdfReport.js";

// Storage: use Claude Artifacts window.storage when available, else localStorage
const STORAGE_PREFIX = "trichella_";
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: (key) => Promise.resolve({ value: localStorage.getItem(STORAGE_PREFIX + key) }),
    set: (key, value) => { localStorage.setItem(STORAGE_PREFIX + key, value); return Promise.resolve(); },
    delete: (key) => { localStorage.removeItem(STORAGE_PREFIX + key); return Promise.resolve(); },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:'Outfit',sans-serif;
  background:#0C0B09;
  color:#F0EBE1;
  min-height:100vh;
  overflow-x:hidden;
}

:root{
  /* Core palette */
  --bg:       #0C0B09;
  --bg1:      #141210;
  --bg2:      #1C1A17;
  --bg3:      #252220;
  --border:   rgba(240,235,225,.1);
  --border2:  rgba(240,235,225,.18);

  /* Typography */
  --text:     #F0EBE1;
  --text2:    #B8AF9E;
  --text3:    #7A746A;

  /* Brand accents */
  --gold:     #C9A96E;
  --gold-lt:  rgba(201,169,110,.15);
  --gold-glow:rgba(201,169,110,.25);

  /* Health indicators */
  --sage:     #7A9E7E;
  --sage-lt:  rgba(122,158,126,.15);
  --terra:    #C4785A;
  --terra-lt: rgba(196,120,90,.15);
  --amber:    #D4A843;
  --amber-lt: rgba(212,168,67,.15);
  --crit:     #B45454;
  --crit-lt:  rgba(180,84,84,.15);

  --radius:   14px;
  --radius-lg:22px;
  --shadow:   0 4px 24px rgba(0,0,0,.4);
  --shadow-lg:0 16px 60px rgba(0,0,0,.5);
}

/* Scrollbar */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:4px}

/* Grain texture overlay */
.grain::after{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:999;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* ── Layout ── */
.app-shell{display:flex;min-height:100vh}
.sidebar{
  width:240px;flex-shrink:0;
  background:var(--bg1);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  padding:24px 16px;
  position:fixed;top:0;left:0;bottom:0;
  z-index:50;transition:transform .3s ease;
}
.sidebar.closed{transform:translateX(-100%)}
.page-content{
  margin-left:240px;flex:1;
  min-height:100vh;
  padding:32px;
  max-width:1100px;
}
@media(max-width:768px){
  .sidebar{transform:translateX(-100%)}
  .sidebar.open{transform:translateX(0)}
  .page-content{margin-left:0;padding:16px}
}

/* ── Sidebar items ── */
.sidebar-logo{
  display:flex;align-items:center;gap:10px;
  padding:4px 8px 24px;
  border-bottom:1px solid var(--border);
  margin-bottom:20px;
}
.logo-mark{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,var(--gold),#A07840);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;flex-shrink:0;
}
.logo-name{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;letter-spacing:.5px}
.logo-ver{font-size:10px;color:var(--text3);letter-spacing:.3px}

.nav-section{margin-bottom:8px}
.nav-label{font-size:10px;font-weight:600;letter-spacing:1px;color:var(--text3);text-transform:uppercase;padding:0 8px;margin-bottom:4px}
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;border-radius:10px;
  font-size:13px;font-weight:500;color:var(--text2);
  cursor:pointer;transition:all .15s ease;
  margin-bottom:2px;
}
.nav-item:hover{background:var(--bg2);color:var(--text)}
.nav-item.active{background:var(--gold-lt);color:var(--gold);border:1px solid rgba(201,169,110,.2)}
.nav-item svg{flex-shrink:0;opacity:.7}
.nav-item.active svg{opacity:1}

.sidebar-footer{margin-top:auto;padding-top:16px;border-top:1px solid var(--border)}

/* ── Cards ── */
.card{
  background:var(--bg1);
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  padding:24px;
  transition:all .2s ease;
}
.card:hover{border-color:var(--border2)}
.card-sm{
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:16px;
}
.card-gold{border-color:rgba(201,169,110,.3);background:linear-gradient(135deg,var(--bg1),rgba(201,169,110,.04))}

/* ── Typography ── */
h1,h2,h3{font-family:'Cormorant Garamond',serif}
.display{font-size:clamp(32px,5vw,56px);font-weight:700;line-height:1.1;letter-spacing:-.5px}
.heading{font-size:clamp(22px,3vw,30px);font-weight:600;line-height:1.2}
.subheading{font-size:18px;font-weight:500}
.label{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--text3)}
.body{font-size:14px;color:var(--text2);line-height:1.65}
.caption{font-size:12px;color:var(--text3);line-height:1.5}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:11px 22px;border-radius:10px;border:none;
  font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;transition:all .15s ease;letter-spacing:.2px;
  white-space:nowrap;
}
.btn-gold{
  background:linear-gradient(135deg,var(--gold),#A07840);
  color:#0C0B09;
  box-shadow:0 4px 20px var(--gold-glow);
}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 6px 28px var(--gold-glow)}
.btn-gold:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-outline{
  background:transparent;color:var(--text2);
  border:1px solid var(--border2);
}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.btn-ghost{background:transparent;color:var(--text2);padding:8px 12px}
.btn-ghost:hover{color:var(--text)}
.btn-danger{background:var(--crit-lt);color:var(--crit);border:1px solid rgba(180,84,84,.3)}
.btn-sage{background:var(--sage-lt);color:var(--sage);border:1px solid rgba(122,158,126,.3)}

/* ── Badges ── */
.badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 10px;border-radius:99px;
  font-size:11px;font-weight:600;letter-spacing:.3px;
}
.badge-gold{background:var(--gold-lt);color:var(--gold)}
.badge-sage{background:var(--sage-lt);color:var(--sage)}
.badge-terra{background:var(--terra-lt);color:var(--terra)}
.badge-amber{background:var(--amber-lt);color:var(--amber)}
.badge-crit{background:var(--crit-lt);color:var(--crit)}

/* ── Form elements ── */
.input{
  width:100%;
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:10px;
  padding:11px 14px;
  font-family:'Outfit',sans-serif;
  font-size:14px;color:var(--text);
  outline:none;transition:border .15s;
}
.input:focus{border-color:var(--gold)}
.input::placeholder{color:var(--text3)}
.input-label{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;display:block}
.form-group{margin-bottom:16px}
textarea.input{min-height:100px;resize:vertical}

/* ── Divider ── */
.divider{height:1px;background:var(--border);margin:24px 0}

/* ── Grid helpers ── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:900px){.grid-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}}

/* ── Drop zone ── */
.dropzone{
  border:2px dashed var(--border2);
  border-radius:var(--radius-lg);
  padding:48px 24px;
  text-align:center;
  cursor:pointer;
  transition:all .2s ease;
  background:var(--bg1);
  position:relative;
}
.dropzone:hover,.dropzone.drag{
  border-color:var(--gold);
  background:var(--gold-lt);
  transform:translateY(-2px);
}
.dropzone input{position:absolute;left:-9999px;width:0;height:0;opacity:0;pointer-events:none}

/* ── Score ring ── */
.ring-wrap{position:relative;display:inline-flex}
.ring-label{
  position:absolute;inset:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
}

/* ── Metric bar ── */
.metric-bar{height:5px;border-radius:99px;background:var(--bg3);overflow:hidden;margin-top:8px}
.metric-fill{height:100%;border-radius:99px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}

/* ── Scan step indicator ── */
.scan-steps{display:flex;gap:0;margin-bottom:32px}
.scan-step{
  flex:1;padding:14px 8px;text-align:center;
  position:relative;
  border-bottom:2px solid var(--border);
  transition:all .2s;
}
.scan-step.done{border-bottom-color:var(--sage)}
.scan-step.active{border-bottom-color:var(--gold)}
.scan-step-num{
  width:24px;height:24px;border-radius:50%;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;margin-bottom:4px;
  background:var(--bg3);color:var(--text3);
}
.scan-step.done .scan-step-num{background:var(--sage-lt);color:var(--sage)}
.scan-step.active .scan-step-num{background:var(--gold-lt);color:var(--gold)}
.scan-step-label{font-size:11px;font-weight:500;color:var(--text3)}
.scan-step.active .scan-step-label{color:var(--gold)}

/* ── Loading spinner ── */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}

.spinner{
  width:48px;height:48px;border-radius:50%;
  border:3px solid var(--bg3);
  border-top-color:var(--gold);
  animation:spin 1s linear infinite;
}
.pulse{animation:pulse 1.5s ease infinite}
.slide-up{animation:slideUp .4s ease both}
.fade-in{animation:fadeIn .3s ease both}

/* ── Progress bar ── */
.progress-bar{
  height:3px;border-radius:99px;background:var(--bg3);overflow:hidden;
}
.progress-fill{
  height:100%;background:linear-gradient(90deg,var(--gold),#A07840);
  border-radius:99px;transition:width .8s ease;
}

/* ── Tag ── */
.tag{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 8px;border-radius:6px;
  font-size:11px;font-weight:500;
  background:var(--bg3);color:var(--text2);
}

/* ── Table ── */
.table{width:100%;border-collapse:collapse}
.table th{
  font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;
  color:var(--text3);padding:10px 14px;text-align:left;
  border-bottom:1px solid var(--border);
}
.table td{
  padding:12px 14px;font-size:13px;color:var(--text2);
  border-bottom:1px solid var(--border);vertical-align:middle;
}
.table tr:hover td{background:var(--bg2)}
.table tr:last-child td{border-bottom:none}

/* ── Tooltip (recharts override) ── */
.recharts-tooltip-wrapper .recharts-default-tooltip{
  background:var(--bg2) !important;
  border:1px solid var(--border) !important;
  border-radius:10px !important;
  box-shadow:var(--shadow) !important;
}

/* ── Mobile top bar ── */
.mobile-bar{
  display:none;
  position:fixed;top:0;left:0;right:0;z-index:60;
  background:var(--bg1);border-bottom:1px solid var(--border);
  padding:12px 16px;align-items:center;justify-content:space-between;
}
@media(max-width:768px){
  .mobile-bar{display:flex}
  .page-content{padding-top:64px}
}

/* ── Feature card (landing) ── */
.feature-card{
  background:var(--bg1);border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:28px;
  transition:all .25s ease;
}
.feature-card:hover{border-color:rgba(201,169,110,.3);transform:translateY(-3px);box-shadow:var(--shadow)}
.feature-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:16px;
}

/* ── Tier card (pricing) ── */
.tier-card{
  background:var(--bg1);border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:28px;
  transition:all .2s;
}
.tier-card.featured{border-color:var(--gold);background:linear-gradient(160deg,var(--bg1),rgba(201,169,110,.05))}

/* ── Protocol step ── */
.proto-step{
  display:flex;gap:16px;padding:20px;
  background:var(--bg2);border:1px solid var(--border);
  border-radius:var(--radius);margin-bottom:12px;
  transition:all .2s;
}
.proto-step:hover{border-color:var(--gold);background:var(--gold-lt)}
.proto-num{
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;font-weight:700;font-size:15px;
}

/* ── Stat card ── */
.stat-card{
  background:var(--bg1);border:1px solid var(--border);
  border-radius:var(--radius);padding:20px;
}
.stat-value{
  font-family:'Cormorant Garamond',serif;
  font-size:36px;font-weight:700;line-height:1;
  margin:8px 0 4px;
}
`;

// ══════════════════════════════════════════════════════════════════════════════
// UTILITIES & CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const PAGES = {
  LANDING:"landing", AUTH:"auth", DASHBOARD:"dashboard",
  SCAN:"scan", RESULTS:"results", HISTORY:"history",
  TRAINING:"training", PRO:"pro", SETTINGS:"settings",
};

function fileToB64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=()=>rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

function scoreColor(s){
  if(s>=75) return "var(--sage)";
  if(s>=50) return "var(--amber)";
  if(s>=30) return "var(--terra)";
  return "var(--crit)";
}
function scoreLabel(s){
  if(s>=75) return "Healthy";
  if(s>=50) return "Moderate";
  if(s>=30) return "Needs Care";
  return "Critical";
}
function levelColor(v){
  const l=(v||"").toLowerCase();
  if(l==="low"||l==="normal") return "var(--sage)";
  if(l==="medium"||l==="moderate") return "var(--amber)";
  if(l==="high") return "var(--terra)";
  return "var(--crit)";
}
function levelFill(v,inv=false){
  const map={low:inv?85:20, medium:55, moderate:55, high:inv?15:85, "very high":95, normal:70};
  return map[(v||"").toLowerCase()]||50;
}
function levelBadge(v){
  const l=(v||"").toLowerCase();
  if(l==="low"||l==="normal") return "badge-sage";
  if(l==="medium"||l==="moderate") return "badge-amber";
  if(l==="high") return "badge-terra";
  return "badge-crit";
}
function fmt(d){return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
function fmtShort(d){return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}

// ══════════════════════════════════════════════════════════════════════════════
// AI ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

// ── 6 defined diagnostic conditions ─────────────────────────────────────────
const DIAG_CONDITIONS = [
  { id:"dry",         label:"Dry Scalp",          color:"var(--amber)",  icon:"💧",
    desc:"Insufficient moisture and natural oil, causing fine white flakes, tightness, and itching." },
  { id:"oily",        label:"Oily Scalp",          color:"var(--terra)",  icon:"✨",
    desc:"Overproduction of sebum causing greasy roots, flat hair, and rapid re-soiling." },
  { id:"sensitive",   label:"Sensitive Scalp",     color:"var(--sage)",   icon:"🌿",
    desc:"Reactive skin easily irritated by products, temperature, or touch — burning or tingling." },
  { id:"acne",        label:"Acne Scalp",          color:"var(--crit)",   icon:"⚡",
    desc:"Clogged follicles producing pustules, painful bumps, crusting, and localised hair loss." },
  { id:"inflammation",label:"Inflammation Scalp",  color:"var(--terra)",  icon:"🔴",
    desc:"Redness, swelling, and scaling from dermatitis, seborrhoeic conditions, or autoimmune triggers." },
  { id:"dandruff",    label:"Dandruff Scalp",      color:"var(--gold)",   icon:"❄️",
    desc:"Malassezia yeast overgrowth causing accelerated cell turnover and large yellowish flakes." },
];

async function runAI(b64,mime){
  const sys=`You are a senior AI trichologist. Perform a rigorous, clinical scalp health analysis on the image.
Return ONLY valid JSON — no markdown fences, no explanation, no preamble.

IMPORTANT: You must evaluate the image against these exact 6 diagnostic conditions:
1. Dry Scalp — fine white flakes, tightness, low sebum, dullness
2. Oily Scalp — sebum shine at roots, greasy appearance, heavy hair
3. Sensitive Scalp — redness, reactive texture, thin/delicate skin
4. Acne Scalp — follicle bumps, pustules, crusting, localised tenderness
5. Inflammation Scalp — diffuse redness, swelling, scaling, heat
6. Dandruff Scalp — larger yellowish/white flakes, yeast patterns, oily flaking

For the "primaryCondition" field, select the SINGLE most prominent condition from the 6 above.
For the "conditions" array, list ALL conditions present (can be 1–3 typically).
Each condition string must match exactly one of: "Dry Scalp", "Oily Scalp", "Sensitive Scalp", "Acne Scalp", "Inflammation Scalp", "Dandruff Scalp"

Schema (all fields required):
{
  "overallScore": <0-100 integer>,
  "summary": "<3-sentence professional clinical summary>",
  "primaryCondition": "<one of the 6 conditions above>",
  "metrics": {
    "density": "<Low|Medium|High>",
    "inflammation": "<Low|Medium|High>",
    "sebumLevel": "<percentage string e.g. '68%'>",
    "hydration": "<Low|Medium|High>",
    "follicleHealth": "<Low|Medium|High>",
    "scalpType": "<Normal|Oily|Dry|Combination|Sensitive>"
  },
  "findings": ["<finding 1>","<finding 2>","<finding 3>","<finding 4>"],
  "recommendations": [
    {"title":"<short>","detail":"<2-sentence action specific to detected conditions>","priority":"<High|Medium|Low>"},
    {"title":"<short>","detail":"<2-sentence action>","priority":"<High|Medium|Low>"},
    {"title":"<short>","detail":"<2-sentence action>","priority":"<High|Medium|Low>"},
    {"title":"<short>","detail":"<2-sentence action>","priority":"<High|Medium|Low>"}
  ],
  "urgency": "<routine|monitor|consult>",
  "conditions": ["<from the 6 defined types only>"],
  "nextScanDays": <integer 30-90>
}`;

  // Prefer backend proxy (keeps API key server-side); fallback to direct call if VITE_ANTHROPIC_KEY set
  const apiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL;
  const clientKey = typeof import.meta !== "undefined" && import.meta.env?.VITE_ANTHROPIC_KEY;

  if (apiUrl) {
    const r = await fetch(`${apiUrl.replace(/\/$/, "")}/api/analyse`, {
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

  if (clientKey) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": clientKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: sys,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mime, data: b64 } },
              { type: "text", text: "Perform a comprehensive scalp health analysis. Return structured JSON only." },
            ],
          },
        ],
      }),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const d = await r.json();
    const txt = (d.content || []).map((i) => i.text || "").join("\n");
    return JSON.parse(txt.replace(/```json|```/g, "").trim());
  }

  // Default: call same-origin /api/analyse (Vite proxy to backend)
  const r = await fetch("/api/analyse", {
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
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/** Animated score ring */
function ScoreRing({score,size=100}){
  const r=size*.4,circ=2*Math.PI*r,filled=(score/100)*circ,col=scoreColor(score);
  return(
    <div className="ring-wrap" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={size*.07}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={size*.07}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div className="ring-label">
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:size*.26,fontWeight:700,color:col,lineHeight:1}}>{score}</span>
        <span style={{fontSize:size*.09,color:"var(--text3)",fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginTop:2}}>/ 100</span>
      </div>
    </div>
  );
}

/** Single metric display card */
function MetricCard({label,value,inv=false}){
  const pct=levelFill(value,inv),col=levelColor(value);
  return(
    <div className="card-sm slide-up" style={{animationDelay:".1s"}}>
      <div className="label" style={{marginBottom:6}}>{label}</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:col}}>{value}</div>
      <div className="metric-bar">
        <div className="metric-fill" style={{width:`${pct}%`,background:col}}/>
      </div>
    </div>
  );
}

/** Page header */
function PageHeader({title,sub,action}){
  return(
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12}}>
      <div>
        <h2 className="heading" style={{marginBottom:4}}>{title}</h2>
        {sub&&<p className="body">{sub}</p>}
      </div>
      {action&&<div>{action}</div>}
    </div>
  );
}

/** Empty state */
function Empty({icon,title,body,cta}){
  return(
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
      <h3 className="subheading" style={{marginBottom:8}}>{title}</h3>
      <p className="body" style={{maxWidth:360,margin:"0 auto 20px"}}>{body}</p>
      {cta}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════

function Landing({onEnter}){
  const features=[
    {icon:"🔬",color:"var(--gold-lt)",col:"var(--gold)",title:"Clinical-Grade AI",body:"Powered by multimodal vision AI trained on dermatological data. Detect density, inflammation, sebum levels, and follicle health instantly."},
    {icon:"📊",color:"var(--sage-lt)",col:"var(--sage)",title:"Progress Tracking",body:"Monitor your scalp health over time with trend charts. Understand how lifestyle, products, and treatments impact your readings."},
    {icon:"🏥",color:"var(--terra-lt)",col:"var(--terra)",title:"Professional Mode",body:"Built for clinics and spas. Manage multiple clients, generate reports, and feed scan data back into the AI training loop."},
    {icon:"🧠",color:"var(--amber-lt)",col:"var(--amber)",title:"Ground Truth Protocol",body:"Pair raw scalp images with professional scanner data to continuously improve the AI's diagnostic accuracy."},
    {icon:"💊",color:"var(--gold-lt)",col:"var(--gold)",title:"Personalised Care Plans",body:"Receive prioritised, actionable recommendations tailored to your specific scalp condition and health metrics."},
    {icon:"🔒",color:"var(--sage-lt)",col:"var(--sage)",title:"Private & Secure",body:"Your images are analysed in real-time and never stored permanently. Full control over your diagnostic data."},
  ];

  const tiers=[
    {name:"Consumer",price:"Free",desc:"Personal scalp health monitoring",features:["Unlimited AI scans","6 key health metrics","Progress history","Basic recommendations"],cta:"Start Free"},
    {name:"Professional",price:"$49/mo",desc:"For clinics, spas & practitioners",features:["Everything in Consumer","Multi-client dashboard","Ground Truth training","Export reports (PDF)","Priority AI analysis","API access"],cta:"Start Trial",featured:true},
    {name:"Enterprise",price:"Custom",desc:"Custom AI deployment for brands",features:["Private Gemini Gem","White-label UI","Custom scanner integration","Bulk training data","SLA support","On-premise option"],cta:"Contact Sales"},
  ];

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"0 24px"}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:"80px 0 60px",position:"relative"}}>
        <div style={{
          position:"absolute",inset:0,
          background:"radial-gradient(ellipse 700px 400px at 50% 0,rgba(201,169,110,.08),transparent)",
          pointerEvents:"none"
        }}/>
        <div className="badge badge-gold" style={{marginBottom:20}}>AI-Powered Trichology · 2026</div>
        <h1 className="display" style={{marginBottom:20}}>
          Professional Scalp Diagnostics<br/>
          <span style={{color:"var(--gold)"}}>in Your Pocket.</span>
        </h1>
        <p className="body" style={{fontSize:17,maxWidth:520,margin:"0 auto 36px",lineHeight:1.7}}>
          Upload a photo. Get a clinical-grade analysis of your hair density, inflammation, sebum levels, and follicle health — powered by multimodal AI.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn btn-gold" style={{fontSize:15,padding:"14px 32px"}} onClick={onEnter}>
            Get Your Free Analysis <ArrowRight size={16}/>
          </button>
          <button className="btn btn-outline" style={{fontSize:15,padding:"14px 28px"}}>
            Watch Demo
          </button>
        </div>
        {/* Social proof */}
        <div style={{display:"flex",gap:32,justifyContent:"center",marginTop:48,flexWrap:"wrap"}}>
          {[["12K+","Scans completed"],["94%","Accuracy vs pro scanners"],["4.9★","User satisfaction"],["3 tiers","Consumer to Enterprise"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"var(--gold)"}}>{v}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="divider"/>
      <div style={{textAlign:"center",marginBottom:36}}>
        <h2 className="heading" style={{marginBottom:10}}>Everything You Need</h2>
        <p className="body">From baseline consumer testing to professional-grade Ground Truth training.</p>
      </div>
      <div className="grid-3" style={{marginBottom:60}}>
        {features.map(f=>(
          <div className="feature-card" key={f.title}>
            <div className="feature-icon" style={{background:f.color}}>
              <span style={{fontSize:20}}>{f.icon}</span>
            </div>
            <h3 className="subheading" style={{marginBottom:8,color:"var(--text)"}}>{f.title}</h3>
            <p className="body" style={{fontSize:13}}>{f.body}</p>
          </div>
        ))}
      </div>

      {/* 4-step protocol preview */}
      <div className="card card-gold" style={{marginBottom:48}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{fontSize:20}}>🧬</div>
          <div>
            <h3 className="subheading">The 4-Step Ground Truth Protocol</h3>
            <p className="caption">How Trichella continuously improves its diagnostic accuracy</p>
          </div>
        </div>
        <div className="grid-4">
          {[
            {n:1,c:"var(--gold-lt)",col:"var(--gold)",t:"Obtain Ground Truth",b:"Use consumer apps or pro scanners to generate verified diagnostic baselines."},
            {n:2,c:"var(--sage-lt)",col:"var(--sage)",t:"Gather Raw Image",b:"Isolate the original, untouched scalp photo used by the scanner."},
            {n:3,c:"var(--terra-lt)",col:"var(--terra)",t:"Input Data Pairs",b:"Feed both the raw image and the professional report simultaneously into the AI."},
            {n:4,c:"var(--amber-lt)",col:"var(--amber)",t:"Train & Iterate",b:"Repeat to achieve pattern-recognition mastery across diverse scalp conditions."},
          ].map(s=>(
            <div key={s.n} style={{background:s.c,borderRadius:"var(--radius)",padding:16,border:`1px solid ${s.col}33`}}>
              <div style={{width:28,height:28,borderRadius:8,background:s.col,color:"#0C0B09",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,marginBottom:10}}>{s.n}</div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>{s.t}</div>
              <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5}}>{s.b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <h2 className="heading" style={{marginBottom:10}}>Pricing</h2>
        <p className="body">Start free. Scale as you grow.</p>
      </div>
      <div className="grid-3" style={{marginBottom:60}}>
        {tiers.map(t=>(
          <div key={t.name} className={`tier-card${t.featured?" featured":""}`}>
            {t.featured&&<div className="badge badge-gold" style={{marginBottom:12}}>Most Popular</div>}
            <div className="label" style={{marginBottom:6}}>{t.name}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,marginBottom:4,color:t.featured?"var(--gold)":"var(--text)"}}>{t.price}</div>
            <p className="caption" style={{marginBottom:20}}>{t.desc}</p>
            <div className="divider" style={{margin:"16px 0"}}/>
            {t.features.map(f=>(
              <div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,fontSize:13,color:"var(--text2)"}}>
                <CheckCircle size={13} color="var(--sage)"/>{f}
              </div>
            ))}
            <button className={`btn ${t.featured?"btn-gold":"btn-outline"}`}
              style={{width:"100%",marginTop:20}} onClick={onEnter}>{t.cta}</button>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",paddingBottom:60}}>
        <p className="caption">⚠️ Trichella provides informational analysis only. Not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH PAGE
// ══════════════════════════════════════════════════════════════════════════════

function Auth({onAuth}){
  const[mode,setMode]=useState("signin");
  const[form,setForm]=useState({name:"",email:"",role:"consumer"});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const submit=()=>{
    if(!form.email)return;
    onAuth({name:form.name||form.email.split("@")[0],email:form.email,role:form.role,joined:new Date().toISOString()});
  };
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24}}>
      <div className="card" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:36,marginBottom:12}}>🔬</div>
          <h2 className="heading" style={{marginBottom:6}}>
            {mode==="signin"?"Welcome back":"Create account"}
          </h2>
          <p className="body">
            {mode==="signin"?"Sign in to your Trichella account":"Join 12,000+ users monitoring their scalp health"}
          </p>
        </div>

        {mode==="signup"&&(
          <div className="form-group">
            <label className="input-label">Your Name</label>
            <input className="input" placeholder="e.g. Alex Chen" value={form.name} onChange={set("name")}/>
          </div>
        )}
        <div className="form-group">
          <label className="input-label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")}/>
        </div>
        {mode==="signup"&&(
          <div className="form-group">
            <label className="input-label">Account Type</label>
            <select className="input" value={form.role} onChange={set("role")}>
              <option value="consumer">Consumer — Personal use</option>
              <option value="professional">Professional — Clinic / Spa</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="••••••••"/>
        </div>

        <button className="btn btn-gold" style={{width:"100%",marginTop:4,padding:"13px"}} onClick={submit}>
          {mode==="signin"?"Sign In →":"Create Account →"}
        </button>

        <p className="caption" style={{textAlign:"center",marginTop:16}}>
          {mode==="signin"?"No account? ":"Already have one? "}
          <span style={{color:"var(--gold)",cursor:"pointer"}}
            onClick={()=>setMode(mode==="signin"?"signup":"signin")}>
            {mode==="signin"?"Sign up free":"Sign in"}
          </span>
        </p>
        <div className="divider"/>
        <button className="btn btn-outline" style={{width:"100%"}} onClick={()=>onAuth({name:"Demo User",email:"demo@trichella.ai",role:"professional",joined:new Date().toISOString()})}>
          Continue as Demo (Full Access)
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function Dashboard({user,scans,onNav}){
  const latest=scans[scans.length-1];
  const prev=scans[scans.length-2];
  const trend=latest&&prev?latest.report.overallScore-prev.report.overallScore:null;
  const avg=scans.length?Math.round(scans.reduce((a,s)=>a+s.report.overallScore,0)/scans.length):null;

  const stats=[
    {label:"Total Scans",value:scans.length,icon:<Camera size={18}/>,color:"var(--gold)"},
    {label:"Latest Score",value:latest?`${latest.report.overallScore}/100`:"—",icon:<Activity size={18}/>,color:latest?scoreColor(latest.report.overallScore):"var(--text3)"},
    {label:"Score Trend",value:trend!=null?(trend>=0?`+${trend}`:trend):"—",icon:<TrendingUp size={18}/>,color:trend>0?"var(--sage)":trend<0?"var(--crit)":"var(--text3)"},
    {label:"Avg Score",value:avg?`${avg}/100`:"—",icon:<BarChart2 size={18}/>,color:"var(--amber)"},
  ];

  return(
    <div>
      <PageHeader
        title={`Good day, ${user.name.split(" ")[0]}.`}
        sub="Here's your scalp health overview."
        action={<button className="btn btn-gold" onClick={()=>onNav(PAGES.SCAN)}><Camera size={15}/> New Scan</button>}
      />

      {/* Stats row */}
      <div className="grid-4" style={{marginBottom:24}}>
        {stats.map(s=>(
          <div className="stat-card" key={s.label}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span className="label">{s.label}</span>
              <span style={{color:s.color,opacity:.8}}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}} className="grid-2">
        {/* Recent scans */}
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 className="subheading">Recent Scans</h3>
            {scans.length>0&&<button className="btn btn-ghost" onClick={()=>onNav(PAGES.HISTORY)} style={{fontSize:12}}>View all <ChevronRight size={13}/></button>}
          </div>
          {scans.length===0?(
            <Empty icon="📸" title="No scans yet"
              body="Run your first AI analysis to see your scalp health score."
              cta={<button className="btn btn-gold" onClick={()=>onNav(PAGES.SCAN)}><Camera size={14}/> Scan Now</button>}/>
          ):(
            <div>
              {[...scans].reverse().slice(0,5).map((s,i)=>(
                <div key={s.id} style={{
                  display:"flex",alignItems:"center",gap:14,
                  padding:"12px 0",
                  borderBottom:i<4?"1px solid var(--border)":"none"
                }}>
                  <img src={s.preview} alt="scan" style={{width:44,height:44,objectFit:"cover",borderRadius:10,flexShrink:0,border:"1px solid var(--border)"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{scoreLabel(s.report.overallScore)} Scalp</div>
                    <div className="caption">{fmt(s.date)} · {s.report.metrics.scalpType}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:scoreColor(s.report.overallScore)}}>{s.report.overallScore}</div>
                    <div className="caption">score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Latest score */}
          {latest&&(
            <div className="card" style={{textAlign:"center"}}>
              <div className="label" style={{marginBottom:12}}>Latest Scalp Score</div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                <ScoreRing score={latest.report.overallScore} size={110}/>
              </div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:4,color:scoreColor(latest.report.overallScore)}}>{scoreLabel(latest.report.overallScore)}</div>
              <p className="caption" style={{marginBottom:14}}>{fmt(latest.date)}</p>
              <button className="btn btn-outline" style={{width:"100%",fontSize:12}} onClick={()=>onNav(PAGES.RESULTS)}>
                View Full Report
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div className="card">
            <div className="label" style={{marginBottom:12}}>Quick Actions</div>
            {[
              {icon:<Camera size={15}/>,label:"New Scan",page:PAGES.SCAN,color:"var(--gold)"},
              {icon:<TrendingUp size={15}/>,label:"View Progress",page:PAGES.HISTORY,color:"var(--sage)"},
              {icon:<Brain size={15}/>,label:"Training Hub",page:PAGES.TRAINING,color:"var(--amber)"},
              {icon:<Users size={15}/>,label:"Pro Dashboard",page:PAGES.PRO,color:"var(--terra)"},
            ].map(a=>(
              <button key={a.label} className="btn btn-ghost" style={{width:"100%",justifyContent:"flex-start",gap:10,padding:"9px 4px",marginBottom:2}}
                onClick={()=>onNav(a.page)}>
                <span style={{color:a.color}}>{a.icon}</span>
                <span style={{fontSize:13,fontWeight:500}}>{a.label}</span>
                <ChevronRight size={12} style={{marginLeft:"auto",color:"var(--text3)"}}/>
              </button>
            ))}
          </div>

          {/* Tip */}
          <div style={{background:"var(--gold-lt)",border:"1px solid rgba(201,169,110,.3)",borderRadius:"var(--radius)",padding:16}}>
            <div style={{display:"flex",gap:8,marginBottom:6}}>
              <Star size={14} color="var(--gold)"/>
              <span style={{fontSize:12,fontWeight:600,color:"var(--gold)"}}>Pro Tip</span>
            </div>
            <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.55}}>
              For the most accurate readings, scan on a freshly washed, dry scalp in natural light. Consistency in conditions improves trend accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCAN FLOW
// ══════════════════════════════════════════════════════════════════════════════

function ScanFlow({onComplete,onBack}){
  const[step,setStep]=useState(0); // 0=upload 1=analyzing 2=done
  const[file,setFile]=useState(null);
  const[preview,setPreview]=useState(null);
  const[drag,setDrag]=useState(false);
  const[progress,setProgress]=useState(0);
  const[loadMsg,setLoadMsg]=useState(0);
  const[error,setError]=useState(null);
  const ref=useRef();

  const msgs=["Uploading image securely…","Mapping follicle density…","Detecting sebum distribution…","Analysing inflammation markers…","Evaluating hydration levels…","Generating clinical report…"];

  const pick=f=>{
    if(!f)return;
    const type=(f.type||"").toLowerCase();
    const isImage=type.startsWith("image/")||/\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(f.name||"");
    if(!isImage){ setError("Please choose an image file (JPG, PNG, BMP, HEIC)."); return; }
    setFile(f);setPreview(URL.createObjectURL(f));setError(null);
  };

  const analyse=async()=>{
    if(!file)return;
    setStep(1);setProgress(0);setLoadMsg(0);
    // Animate progress messages
    const interval=setInterval(()=>{
      setLoadMsg(m=>Math.min(m+1,msgs.length-1));
      setProgress(p=>Math.min(p+17,95));
    },900);
    try{
      const b64=await fileToB64(file);
      const report=await runAI(b64,file.type);
      clearInterval(interval);
      setProgress(100);
      setTimeout(()=>{
        onComplete({id:Date.now().toString(),date:new Date().toISOString(),preview,report});
      },600);
    }catch(e){
      clearInterval(interval);
      const msg = e.message || "Analysis failed. Please try again.";
      const hint = (msg.includes("API") || msg.includes("fetch") || msg.includes("500"))
        ? " Make sure the backend is running (npm run server) and OPENAI_API_KEY is set in trichella-app/.env."
        : "";
      setError(msg + hint);
      setStep(0);
    }
  };

  const steps=[
    {label:"Upload"},
    {label:"Analyse"},
    {label:"Results"},
  ];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button className="btn btn-ghost" onClick={onBack} style={{padding:"8px 4px"}}>
          <ChevronLeft size={18}/> Back
        </button>
        <div>
          <h2 className="heading">New Scalp Scan</h2>
          <p className="caption">AI-powered clinical analysis</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="scan-steps">
        {steps.map((s,i)=>(
          <div key={s.label} className={`scan-step${i<step?" done":i===step?" active":""}`}>
            <div className="scan-step-num">{i<step?"✓":i+1}</div>
            <div className="scan-step-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Step 0: Upload ── */}
      {step===0&&(
        <div className="fade-in">
          {!preview?(
            <>
              <div
                className={`dropzone${drag?" drag":""}`}
                role="button"
                tabIndex={0}
                onDragOver={e=>{e.preventDefault();e.stopPropagation();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);pick(e.dataTransfer?.files?.[0])}}
                onClick={()=>{ ref.current?.click(); }}
                onKeyDown={e=>{ if(e.key==="Enter"||e.key===" ") { e.preventDefault(); ref.current?.click(); } }}
              >
                <input
                  ref={ref}
                  type="file"
                  accept="image/*,.bmp,image/bmp,image/x-ms-bmp,image/jpeg,image/png,image/heic"
                  onChange={e=>{ pick(e.target?.files?.[0]); e.target.value=""; }}
                  aria-hidden="true"
                />
                <div style={{fontSize:44,marginBottom:14}}>📸</div>
                <h3 className="subheading" style={{marginBottom:8}}>Drop your scalp photo here</h3>
                <p className="body">or click to browse · JPG, PNG, BMP, HEIC · up to 20 MB</p>
              </div>

              {/* Photography tips */}
              <div className="grid-3" style={{marginTop:20}}>
                {[
                  {e:"💡",t:"Good Lighting",b:"Natural light or bright indoor — avoid flash and shadows."},
                  {e:"📐",t:"Close Up",b:"Hold 10–15 cm away. Crown or problem area should fill the frame."},
                  {e:"🚿",t:"Clean Scalp",b:"Freshly washed scalp gives the most accurate metric readings."},
                ].map(tip=>(
                  <div className="card-sm" key={tip.t}>
                    <div style={{fontSize:22,marginBottom:8}}>{tip.e}</div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{tip.t}</div>
                    <p className="caption">{tip.b}</p>
                  </div>
                ))}
              </div>
            </>
          ):(
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <img src={preview} alt="Preview" style={{width:"100%",maxHeight:340,objectFit:"cover",display:"block"}}/>
              <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500}}>{file?.name}</div>
                  <div className="caption">{(file?.size/1024).toFixed(0)} KB · Ready to analyse</div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-outline" onClick={()=>{setFile(null);setPreview(null)}}>Change</button>
                  <button className="btn btn-gold" onClick={analyse}><Zap size={14}/> Analyse Now</button>
                </div>
              </div>
            </div>
          )}
          {error&&(
            <div style={{background:"var(--crit-lt)",border:"1px solid var(--crit)",borderRadius:"var(--radius)",padding:14,marginTop:16,fontSize:14,color:"var(--crit)"}}>
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Analysing ── */}
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"40px 0"}} className="fade-in">
          <div className="spinner" style={{marginBottom:24}}/>
          <h3 className="subheading" style={{marginBottom:8}}>Analysing your scalp…</h3>
          <p className="body" style={{marginBottom:28}}>{msgs[loadMsg]}</p>
          <div style={{width:"100%",maxWidth:400,marginBottom:32}}>
            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${progress}%`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span className="caption">Processing</span>
              <span className="caption">{progress}%</span>
            </div>
          </div>
          {/* Analysing steps list */}
          <div style={{width:"100%",maxWidth:400,textAlign:"left"}}>
            {msgs.slice(0,loadMsg+1).map((m,i)=>(
              <div key={i} style={{
                display:"flex",gap:10,alignItems:"center",
                padding:"8px 12px",borderRadius:8,marginBottom:6,
                background:i===loadMsg?"var(--gold-lt)":"var(--bg2)",
                border:`1px solid ${i===loadMsg?"rgba(201,169,110,.3)":"var(--border)"}`,
                fontSize:13,color:i===loadMsg?"var(--gold)":"var(--text3)"
              }}>
                <span>{i===loadMsg?"⟳":"✓"}</span>{m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULTS PAGE
// ══════════════════════════════════════════════════════════════════════════════

function Results({scan,onNewScan,onHistory}){
  const [savingPdf, setSavingPdf] = useState(false);
  if(!scan)return(
    <Empty icon="📋" title="No report loaded"
      body="Run a scan to see your diagnostic results here."
      cta={<button className="btn btn-gold" onClick={onNewScan}><Camera size={14}/> Scan Now</button>}/>
  );
  const{report,preview,date}=scan;
  const urgencyColor={"routine":"var(--sage)","monitor":"var(--amber)","consult":"var(--crit)"}[report.urgency]||"var(--text2)";
  const urgencyLabel={"routine":"Routine — no immediate action needed","monitor":"Monitor — recheck in 2–4 weeks","consult":"Consult a specialist — recommend professional evaluation"}[report.urgency]||report.urgency;

  const handleSavePdf = async () => {
    setSavingPdf(true);
    try {
      await saveScanAsPdf(scan);
    } finally {
      setSavingPdf(false);
    }
  };

  return(
    <div>
      <PageHeader
        title="Diagnostic Report"
        sub={fmt(date)+" · AI Trichological Analysis"}
        action={
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-outline" onClick={handleSavePdf} disabled={savingPdf}>
              <Download size={14}/> {savingPdf ? "Saving…" : "Save as PDF"}
            </button>
            <button className="btn btn-outline" onClick={onHistory}><Clock size={14}/> History</button>
            <button className="btn btn-gold" onClick={onNewScan}><Camera size={14}/> New Scan</button>
          </div>
        }
      />

      {/* Score hero */}
      <div className="card" style={{display:"flex",gap:24,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
        {preview&&<img src={preview} alt="scan" style={{width:80,height:80,objectFit:"cover",borderRadius:"var(--radius)",flexShrink:0,border:"1px solid var(--border)"}}/>}
        <ScoreRing score={report.overallScore} size={110}/>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
            <h3 className="subheading" style={{color:scoreColor(report.overallScore)}}>{scoreLabel(report.overallScore)} Scalp</h3>
            <div className="badge badge-gold">{report.metrics.scalpType}</div>
          </div>
          <p className="body" style={{fontSize:13,marginBottom:12}}>{report.summary}</p>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:urgencyColor,flexShrink:0}}/>
            <span style={{fontSize:12,color:urgencyColor,fontWeight:500}}>{urgencyLabel}</span>
          </div>
        </div>
        {report.nextScanDays&&(
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"14px 18px",textAlign:"center",flexShrink:0}}>
            <div className="caption" style={{marginBottom:4}}>Next scan in</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:700,color:"var(--gold)"}}>{report.nextScanDays}</div>
            <div className="caption">days</div>
          </div>
        )}
      </div>

      {/* ── 6 Diagnostic Conditions Panel ── */}
      <div className="label" style={{marginBottom:12}}>Scalp Condition Diagnosis</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
        {DIAG_CONDITIONS.map(cond=>{
          const detected=(report.conditions||[]).some(c=>c.toLowerCase().includes(cond.id)||c.toLowerCase()===cond.label.toLowerCase());
          const isPrimary=(report.primaryCondition||"").toLowerCase().includes(cond.id);
          return(
            <div key={cond.id} style={{
              background:detected?"var(--bg2)":"var(--bg1)",
              border:`1px solid ${detected?cond.color:"var(--border)"}`,
              borderRadius:"var(--radius)",padding:"14px",
              position:"relative",overflow:"hidden",
              opacity:detected?1:0.45,
              transition:"all .2s"
            }}>
              {isPrimary&&(
                <div style={{position:"absolute",top:8,right:8}}>
                  <span style={{fontSize:9,fontWeight:700,background:cond.color,color:"#0C0B09",padding:"2px 7px",borderRadius:99}}>PRIMARY</span>
                </div>
              )}
              <div style={{fontSize:22,marginBottom:6}}>{cond.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:detected?cond.color:"var(--text3)",marginBottom:4}}>{cond.label}</div>
              <div style={{fontSize:10,color:"var(--text3)",lineHeight:1.4}}>{cond.desc}</div>
              {detected&&(
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:cond.color}}/>
                  <span style={{fontSize:10,color:cond.color,fontWeight:600}}>Detected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Metrics grid */}
      <div className="label" style={{marginBottom:12}}>Diagnostic Metrics</div>
      <div className="grid-4" style={{marginBottom:24}}>
        <MetricCard label="Hair Density" value={report.metrics.density} inv/>
        <MetricCard label="Inflammation" value={report.metrics.inflammation}/>
        <MetricCard label="Sebum Level" value={report.metrics.sebumLevel} inv={false}/>
        <MetricCard label="Hydration" value={report.metrics.hydration} inv/>
        <MetricCard label="Follicle Health" value={report.metrics.follicleHealth} inv/>
        <div className="card-sm">
          <div className="label" style={{marginBottom:6}}>Scalp Type</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--gold)"}}>{report.metrics.scalpType}</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:24}}>
        {/* Findings */}
        <div className="card">
          <div className="label" style={{marginBottom:14}}>Clinical Findings</div>
          {(report.findings||[]).map((f,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<report.findings.length-1?"1px solid var(--border)":"none",alignItems:"flex-start"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:["var(--terra)","var(--amber)","var(--sage)","var(--gold)"][i%4],marginTop:7,flexShrink:0}}/>
              <span style={{fontSize:13,color:"var(--text2)",lineHeight:1.55}}>{f}</span>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="label" style={{marginBottom:14}}>Personalised Recommendations</div>
          {(report.recommendations||[]).map((r,i)=>(
            <div key={i} style={{
              display:"flex",gap:12,padding:"12px 0",
              borderBottom:i<report.recommendations.length-1?"1px solid var(--border)":"none",
              alignItems:"flex-start"
            }}>
              <div style={{
                width:26,height:26,borderRadius:8,
                background:"var(--gold-lt)",color:"var(--gold)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,flexShrink:0
              }}>{i+1}</div>
              <div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:600}}>{r.title}</span>
                  <span className={`badge ${r.priority==="High"?"badge-crit":r.priority==="Medium"?"badge-amber":"badge-sage"}`}>{r.priority}</span>
                </div>
                <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.55}}>{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{background:"var(--amber-lt)",border:"1px solid rgba(212,168,67,.3)",borderRadius:"var(--radius)",padding:"14px 16px",fontSize:12,color:"var(--text2)",display:"flex",gap:10,marginBottom:24}}>
        <AlertCircle size={16} color="var(--amber)" style={{flexShrink:0,marginTop:1}}/>
        <span>This AI analysis is for informational purposes only and does not constitute medical advice. For persistent concerns — significant hair loss, pain, or unusual scalp symptoms — please consult a qualified dermatologist or trichologist.</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HISTORY & PROGRESS
// ══════════════════════════════════════════════════════════════════════════════

function History({scans,onScanSelect,onNewScan}){
  const chartData=scans.map(s=>({
    date:fmtShort(s.date),
    score:s.report.overallScore,
    density:s.report.metrics.density==="High"?90:s.report.metrics.density==="Medium"?60:30,
  }));

  return(
    <div>
      <PageHeader
        title="Progress History"
        sub={`${scans.length} scan${scans.length!==1?"s":""} tracked`}
        action={<button className="btn btn-gold" onClick={onNewScan}><Plus size={14}/> New Scan</button>}
      />

      {scans.length<2?(
        <Empty icon="📈" title="Not enough data yet"
          body="Complete at least 2 scans to see your progress trends and health charts."
          cta={<button className="btn btn-gold" onClick={onNewScan}><Camera size={14}/> Scan Now</button>}/>
      ):(
        <>
          {/* Score trend chart */}
          <div className="card" style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <h3 className="subheading" style={{marginBottom:2}}>Overall Health Score</h3>
                <p className="caption">Trend over all your scans</p>
              </div>
              <div className="badge badge-gold">Live</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,235,225,.06)"/>
                <XAxis dataKey="date" tick={{fill:"var(--text3)",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fill:"var(--text3)",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,color:"var(--text)"}}/>
                <Area type="monotone" dataKey="score" stroke="#C9A96E" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{r:4,fill:"#C9A96E"}} name="Health Score"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* All scans table */}
          <div className="card">
            <div className="label" style={{marginBottom:14}}>All Scans</div>
            <div style={{overflowX:"auto"}}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Preview</th><th>Date</th><th>Score</th><th>Scalp Type</th>
                    <th>Density</th><th>Inflammation</th><th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {[...scans].reverse().map(s=>(
                    <tr key={s.id} style={{cursor:"pointer"}} onClick={()=>onScanSelect(s)}>
                      <td><img src={s.preview} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}}/></td>
                      <td>{fmt(s.date)}</td>
                      <td><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:scoreColor(s.report.overallScore)}}>{s.report.overallScore}</span></td>
                      <td>{s.report.metrics.scalpType}</td>
                      <td><span className={`badge ${levelBadge(s.report.metrics.density)}`}>{s.report.metrics.density}</span></td>
                      <td><span className={`badge ${levelBadge(s.report.metrics.inflammation)}`}>{s.report.metrics.inflammation}</span></td>
                      <td><span className={`badge ${{routine:"badge-sage",monitor:"badge-amber",consult:"badge-crit"}[s.report.urgency]}`}>{s.report.urgency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TRAINING HUB (Ground Truth Protocol)
// ══════════════════════════════════════════════════════════════════════════════

function TrainingHub({pairs=[],onAddPair}){
  const[step,setStep]=useState(0);
  const[rawImg,setRawImg]=useState(null);
  const[rawPrev,setRawPrev]=useState(null);
  const[sourceType,setSourceType]=useState("consumer");
  const[gtData,setGtData]=useState({density:"",inflammation:"",sebum:"",hydration:"",follicle:"",type:"",summary:""});
  const[submitting,setSubmitting]=useState(false);
  const[done,setDone]=useState(false);
  const rawRef=useRef();

  const pickRaw=f=>{
    if(!f||!f.type.startsWith("image/"))return;
    setRawImg(f);setRawPrev(URL.createObjectURL(f));
  };

  const gtSet=k=>e=>setGtData(p=>({...p,[k]:e.target.value}));

  const submit=async()=>{
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1200));
    onAddPair({id:Date.now().toString(),date:new Date().toISOString(),preview:rawPrev,sourceType,gtData});
    setDone(true);setSubmitting(false);
  };

  const reset=()=>{setStep(0);setRawImg(null);setRawPrev(null);setGtData({density:"",inflammation:"",sebum:"",hydration:"",follicle:"",type:"",summary:""});setDone(false)};

  const sources={
    consumer:["Hair Guru / Hairify","Myhair.ai","Hair Snap","Other App"],
    hardware:["Chowis / DermoPico","Becon AI","KC Technology","Other Device"],
    clinical:["CureSkin Pro","Custom EMR","Research Platform","Other Clinical"],
  };

  const steps=["Ground Truth","Raw Image","Pair Data","Contribute"];

  return(
    <div>
      <PageHeader
        title="Ground Truth Training Hub"
        sub="Contribute paired data to improve AI diagnostic accuracy"
      />

      {/* Protocol overview */}
      <div className="card card-gold" style={{marginBottom:24}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
          <Brain size={20} color="var(--gold)" style={{flexShrink:0,marginTop:2}}/>
          <div>
            <h3 className="subheading" style={{marginBottom:4}}>The 4-Step Ground Truth Protocol</h3>
            <p className="body" style={{fontSize:13}}>
              By pairing raw scalp images with verified professional diagnostic data, you help train the AI to recognize the exact same patterns that specialist medical scanners detect. Each pair you contribute improves accuracy for all users.
            </p>
          </div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {steps.map((s,i)=>(
            <div key={s} style={{
              flex:"0 0 auto",padding:"10px 16px",
              background:i<=step?"var(--gold-lt)":"var(--bg2)",
              borderRight:i<3?"1px solid var(--border)":"none",
              display:"flex",alignItems:"center",gap:8,minWidth:120,
            }}>
              <div style={{width:22,height:22,borderRadius:6,background:i<=step?"var(--gold)":"var(--bg3)",color:i<=step?"#0C0B09":"var(--text3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                {i<step?"✓":i+1}
              </div>
              <span style={{fontSize:12,fontWeight:500,color:i<=step?"var(--gold)":"var(--text3)",whiteSpace:"nowrap"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {done?(
        <div style={{textAlign:"center",padding:"40px 0"}} className="slide-up">
          <div style={{fontSize:48,marginBottom:16}}>🎉</div>
          <h3 className="subheading" style={{marginBottom:8,color:"var(--sage)"}}>Training Pair Submitted!</h3>
          <p className="body" style={{maxWidth:400,margin:"0 auto 24px"}}>Your Ground Truth data pair has been recorded. Every contribution helps improve diagnostic accuracy for the entire community.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button className="btn btn-gold" onClick={reset}><Plus size={14}/> Add Another Pair</button>
          </div>
        </div>
      ):(
        <>
          {/* Step 0: Ground Truth source */}
          {step===0&&(
            <div className="fade-in">
              <div className="card" style={{marginBottom:16}}>
                <div className="label" style={{marginBottom:12}}>Step 1 — Obtain Ground Truth</div>
                <p className="body" style={{marginBottom:20,fontSize:13}}>
                  Select the source technology that generated your professional baseline diagnostic. This establishes the accuracy tier of your Ground Truth data.
                </p>
                {/* Tier selector */}
                <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
                  {[
                    {k:"consumer",l:"Consumer App",e:"📱",d:"Smartphone-only solutions (baseline)"},
                    {k:"hardware",l:"Smart Scanner",e:"🔬",d:"Professional hardware + AI (medical-grade)"},
                    {k:"clinical",l:"Clinical EMR",e:"🏥",d:"Clinic software / EMR systems (highest)"},
                  ].map(t=>(
                    <button key={t.k} onClick={()=>setSourceType(t.k)} style={{
                      flex:"1 1 160px",padding:14,borderRadius:"var(--radius)",
                      border:`1px solid ${sourceType===t.k?"var(--gold)":"var(--border)"}`,
                      background:sourceType===t.k?"var(--gold-lt)":"var(--bg2)",
                      cursor:"pointer",textAlign:"left",transition:"all .15s"
                    }}>
                      <div style={{fontSize:24,marginBottom:6}}>{t.e}</div>
                      <div style={{fontSize:13,fontWeight:600,color:sourceType===t.k?"var(--gold)":"var(--text)",marginBottom:3}}>{t.l}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{t.d}</div>
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="input-label">Specific Tool Used</label>
                  <select className="input">
                    {sources[sourceType].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn btn-gold" onClick={()=>setStep(1)}>Continue <ChevronRight size={14}/></button>
              </div>

              {/* Existing pairs */}
              {pairs.length>0&&(
                <div className="card">
                  <div className="label" style={{marginBottom:12}}>Your Training Pairs ({pairs.length})</div>
                  {pairs.slice(-5).map(p=>(
                    <div key={p.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                      {p.preview&&<img src={p.preview} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}}/>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{p.sourceType} source · {p.gtData.type||"—"}</div>
                        <div className="caption">{fmt(p.date)}</div>
                      </div>
                      <CheckCircle size={16} color="var(--sage)"/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Raw image */}
          {step===1&&(
            <div className="fade-in">
              <div className="card" style={{marginBottom:16}}>
                <div className="label" style={{marginBottom:12}}>Step 2 — Gather Raw Image</div>
                <p className="body" style={{marginBottom:20,fontSize:13}}>
                  Upload the exact original, untouched scalp photo used by the scanner or app. This must be the raw source image — no UI overlays, no filters, no annotations. The AI requires clean visual data to form its own associations.
                </p>
                {!rawPrev?(
                  <div className={`dropzone`}
                    onDragOver={e=>e.preventDefault()}
                    onDrop={e=>{e.preventDefault();pickRaw(e.dataTransfer.files[0])}}
                    onClick={()=>rawRef.current.click()} style={{marginBottom:16}}>
                    <input ref={rawRef} type="file" accept="image/*" onChange={e=>pickRaw(e.target.files[0])}/>
                    <div style={{fontSize:36,marginBottom:10}}>🖼️</div>
                    <div style={{fontWeight:600,marginBottom:4}}>Drop raw scalp photo</div>
                    <p className="caption">Untouched, no overlays or UI elements</p>
                  </div>
                ):(
                  <div style={{position:"relative",marginBottom:16}}>
                    <img src={rawPrev} alt="Raw" style={{width:"100%",maxHeight:240,objectFit:"cover",borderRadius:"var(--radius)",border:"1px solid var(--border)"}}/>
                    <div style={{position:"absolute",top:10,right:10}}>
                      <span className="badge badge-sage">✓ Raw image loaded</span>
                    </div>
                    <button onClick={()=>{setRawImg(null);setRawPrev(null)}} style={{position:"absolute",top:10,left:10,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 10px",fontSize:12,color:"var(--text2)",cursor:"pointer"}}>Change</button>
                  </div>
                )}
                <div style={{background:"var(--amber-lt)",border:"1px solid rgba(212,168,67,.3)",borderRadius:"var(--radius)",padding:"10px 14px",fontSize:12,color:"var(--text2)",display:"flex",gap:8}}>
                  <AlertCircle size={14} color="var(--amber)" style={{flexShrink:0,marginTop:1}}/>
                  <span>Do NOT upload screenshots with app UI visible. The raw, unprocessed scalp image only.</span>
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button className="btn btn-outline" onClick={()=>setStep(0)}><ChevronLeft size={14}/> Back</button>
                  <button className="btn btn-gold" disabled={!rawPrev} onClick={()=>setStep(2)}>Continue <ChevronRight size={14}/></button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enter professional data */}
          {step===2&&(
            <div className="fade-in">
              <div className="card" style={{marginBottom:16}}>
                <div className="label" style={{marginBottom:12}}>Step 3 — Input Professional Data</div>
                <p className="body" style={{marginBottom:20,fontSize:13}}>
                  Enter the exact metrics from your professional scanner or app report. These become the Ground Truth labels that the AI learns to predict from the raw image alone.
                </p>
                <div className="grid-3" style={{marginBottom:16}}>
                  {[
                    {k:"density",l:"Hair Density",opts:["Low","Medium","High"]},
                    {k:"inflammation",l:"Inflammation",opts:["Low","Medium","High"]},
                    {k:"hydration",l:"Hydration",opts:["Low","Medium","High"]},
                    {k:"follicle",l:"Follicle Health",opts:["Low","Medium","High"]},
                    {k:"type",l:"Scalp Type",opts:["Normal","Oily","Dry","Combination","Sensitive"]},
                  ].map(f=>(
                    <div className="form-group" key={f.k} style={{marginBottom:8}}>
                      <label className="input-label">{f.l}</label>
                      <select className="input" value={gtData[f.k]} onChange={gtSet(f.k)}>
                        <option value="">Select…</option>
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className="form-group" style={{marginBottom:8}}>
                    <label className="input-label">Sebum Level (%)</label>
                    <input className="input" type="number" min="0" max="100" placeholder="e.g. 72" value={gtData.sebum} onChange={gtSet("sebum")}/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Professional Summary (optional)</label>
                  <textarea className="input" placeholder="Any additional clinical notes from the report…" value={gtData.summary} onChange={gtSet("summary")} style={{minHeight:80}}/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-outline" onClick={()=>setStep(1)}><ChevronLeft size={14}/> Back</button>
                  <button className="btn btn-gold" onClick={()=>setStep(3)}>Review <ChevronRight size={14}/></button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & submit */}
          {step===3&&(
            <div className="fade-in">
              <div className="card" style={{marginBottom:16}}>
                <div className="label" style={{marginBottom:12}}>Step 4 — Review & Contribute</div>
                <p className="body" style={{marginBottom:20,fontSize:13}}>
                  Review your data pair before contributing it to the training loop. Once submitted, it will be used to improve AI accuracy for all users.
                </p>
                <div style={{display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20}}>
                  {rawPrev&&<img src={rawPrev} alt="Raw" style={{width:100,height:100,objectFit:"cover",borderRadius:"var(--radius)",border:"1px solid var(--border)"}}/>}
                  <div style={{flex:1}}>
                    <div className="badge badge-gold" style={{marginBottom:12}}>Ground Truth Data</div>
                    <div className="grid-3">
                      {Object.entries(gtData).filter(([k,v])=>v&&k!=="summary").map(([k,v])=>(
                        <div key={k} style={{marginBottom:8}}>
                          <div className="caption">{k.charAt(0).toUpperCase()+k.slice(1)}</div>
                          <div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginTop:2}}>{v}{k==="sebum"?"%":""}</div>
                        </div>
                      ))}
                    </div>
                    {gtData.summary&&<p className="caption" style={{marginTop:8,fontStyle:"italic"}}>{gtData.summary}</p>}
                  </div>
                </div>

                <div style={{background:"var(--sage-lt)",border:"1px solid rgba(122,158,126,.3)",borderRadius:"var(--radius)",padding:"10px 14px",fontSize:12,color:"var(--sage)",display:"flex",gap:8,marginBottom:20}}>
                  <Shield size={14} style={{flexShrink:0,marginTop:1}}/>
                  <span>Your data is anonymised before use in training. No personally identifiable information is stored alongside scan images.</span>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="btn btn-outline" onClick={()=>setStep(2)}><ChevronLeft size={14}/> Back</button>
                  <button className="btn btn-gold" disabled={submitting} onClick={submit}>
                    {submitting?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> Submitting…</>:<><Database size={14}/> Submit Training Pair</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ProDashboard({onNav}){
  const[clients,setClients]=useState([
    {id:"1",name:"Sarah Mitchell",age:34,type:"Oily",lastScan:"2026-03-08",score:62,scans:4},
    {id:"2",name:"James Okafor",age:28,type:"Dry",lastScan:"2026-03-07",score:74,scans:7},
    {id:"3",name:"Priya Nair",age:45,type:"Combination",lastScan:"2026-03-05",score:45,scans:2},
    {id:"4",name:"Emma Rodriguez",age:31,type:"Normal",lastScan:"2026-03-01",score:82,scans:9},
    {id:"5",name:"David Chen",age:52,type:"Sensitive",lastScan:"2026-02-25",score:38,scans:3},
  ]);
  const[newName,setNewName]=useState("");
  const[showAdd,setShowAdd]=useState(false);

  const addClient=()=>{
    if(!newName)return;
    setClients(p=>[...p,{id:Date.now().toString(),name:newName,age:0,type:"Unknown",lastScan:new Date().toISOString().split("T")[0],score:null,scans:0}]);
    setNewName("");setShowAdd(false);
  };

  const avgScore=Math.round(clients.reduce((a,c)=>a+(c.score||0),0)/clients.length);

  return(
    <div>
      <PageHeader
        title="Professional Dashboard"
        sub="Manage clients and track multi-patient scalp health"
        action={
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-outline" onClick={()=>setShowAdd(true)}><Plus size={14}/> Add Client</button>
            <button className="btn btn-gold" onClick={()=>onNav(PAGES.SCAN)}><Camera size={14}/> Scan Client</button>
          </div>
        }
      />

      {/* Clinic stats */}
      <div className="grid-4" style={{marginBottom:24}}>
        {[
          {l:"Total Clients",v:clients.length,c:"var(--gold)"},
          {l:"Avg Score",v:`${avgScore}/100`,c:scoreColor(avgScore)},
          {l:"Scans This Month",v:clients.reduce((a,c)=>a+c.scans,0),c:"var(--sage)"},
          {l:"Need Attention",v:clients.filter(c=>c.score&&c.score<50).length,c:"var(--terra)"},
        ].map(s=>(
          <div className="stat-card" key={s.l}>
            <div className="label">{s.l}</div>
            <div className="stat-value" style={{color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Add client modal */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
          <div className="card" style={{width:"100%",maxWidth:400}}>
            <h3 className="subheading" style={{marginBottom:16}}>Add New Client</h3>
            <div className="form-group">
              <label className="input-label">Client Name</label>
              <input className="input" placeholder="Full name" value={newName} onChange={e=>setNewName(e.target.value)} autoFocus/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={addClient}>Add Client</button>
            </div>
          </div>
        </div>
      )}

      {/* Client list */}
      <div className="card">
        <div className="label" style={{marginBottom:14}}>Client List</div>
        <div style={{overflowX:"auto"}}>
          <table className="table">
            <thead>
              <tr>
                <th>Client</th><th>Scalp Type</th><th>Latest Score</th>
                <th>Last Scan</th><th>Total Scans</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c=>(
                <tr key={c.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`hsl(${parseInt(c.id)*67%360},40%,35%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"var(--text)",flexShrink:0}}>
                        {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                        {c.age>0&&<div className="caption">{c.age} yrs</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{c.type}</span></td>
                  <td>
                    {c.score?(
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:scoreColor(c.score)}}>{c.score}</span>
                    ):"—"}
                  </td>
                  <td className="caption">{fmt(c.lastScan)}</td>
                  <td><span style={{fontSize:14,fontWeight:500}}>{c.scans}</span></td>
                  <td>
                    {c.score?(
                      <span className={`badge ${c.score>=75?"badge-sage":c.score>=50?"badge-amber":"badge-crit"}`}>
                        {c.score>=75?"Healthy":c.score>=50?"Monitor":"Consult"}
                      </span>
                    ):(
                      <span className="badge" style={{background:"var(--bg3)"}}>No data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology tier info */}
      <div className="card" style={{marginTop:20}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <Layers size={18} color="var(--gold)"/>
          <h3 className="subheading">Ground Truth Technology Tiers</h3>
        </div>
        <p className="body" style={{fontSize:13,marginBottom:16}}>
          Upgrade your diagnostic accuracy by integrating professional scanner hardware. Each tier generates higher-quality Ground Truth data for AI training.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {tier:"Tier 1 — Consumer Apps",tools:"Hair Guru, Myhair.ai, Hair Snap",desc:"Smartphone-only. Fast baseline testing. Best for: consumer self-monitoring.",color:"var(--sage-lt)",col:"var(--sage)"},
            {tier:"Tier 2 — Smart Scanners",tools:"Chowis, Becon AI, KC Technology",desc:"Hardware + AI. 30–200× magnification. Sebum, hydration, temperature sensors. Medical-grade.",color:"var(--amber-lt)",col:"var(--amber)"},
            {tier:"Tier 3 — Clinical EMR",tools:"CureSkin Pro, Custom Systems",desc:"Full clinic integration. AI-driven EMR with real-time diagnostics. Highest accuracy tier.",color:"var(--terra-lt)",col:"var(--terra)"},
          ].map(t=>(
            <div key={t.tier} style={{display:"flex",gap:12,padding:14,background:t.color,borderRadius:"var(--radius)",border:`1px solid ${t.col}33`}}>
              <div style={{width:8,borderRadius:4,background:t.col,flexShrink:0}}/>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>{t.tier}</div>
                <div style={{fontSize:12,color:t.col,fontWeight:500,marginBottom:4}}>{t.tools}</div>
                <div className="caption">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

function SettingsPage({user,onSignOut}){
  const[prefs,setPrefs]=useState({units:"metric",notify:true,share:false,theme:"dark"});
  const toggle=k=>setPrefs(p=>({...p,[k]:!p[k]}));
  return(
    <div>
      <PageHeader title="Settings" sub="Manage your account and preferences"/>
      {/* Profile */}
      <div className="card" style={{marginBottom:16}}>
        <div className="label" style={{marginBottom:14}}>Profile</div>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"var(--gold-lt)",border:"1px solid rgba(201,169,110,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"var(--gold)"}}>
            {user.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>{user.name}</div>
            <div className="caption">{user.email}</div>
            <div className="caption" style={{marginTop:2}}>{user.role==="professional"?"Professional Account":"Consumer Account"} · Since {fmt(user.joined)}</div>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="input-label">Display Name</label>
            <input className="input" defaultValue={user.name}/>
          </div>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input className="input" defaultValue={user.email}/>
          </div>
        </div>
        <button className="btn btn-gold" style={{marginTop:4}}>Save Changes</button>
      </div>

      {/* Preferences */}
      <div className="card" style={{marginBottom:16}}>
        <div className="label" style={{marginBottom:14}}>Preferences</div>
        {[
          {k:"notify",l:"Scan Reminders",d:"Receive reminders when your next scan is due"},
          {k:"share",l:"Contribute to Training",d:"Anonymously share scan data to improve AI accuracy"},
        ].map(p=>(
          <div key={p.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{p.l}</div>
              <div className="caption">{p.d}</div>
            </div>
            <button onClick={()=>toggle(p.k)} style={{
              width:44,height:24,borderRadius:99,border:"none",cursor:"pointer",
              background:prefs[p.k]?"var(--gold)":"var(--bg3)",
              transition:"background .2s",padding:2,display:"flex",alignItems:"center",
              justifyContent:prefs[p.k]?"flex-end":"flex-start"
            }}>
              <div style={{width:20,height:20,borderRadius:"50%",background:prefs[p.k]?"#0C0B09":"var(--text3)"}}/>
            </button>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="card" style={{marginBottom:16}}>
        <div className="label" style={{marginBottom:14}}>Subscription</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:16,fontWeight:600}}>{user.role==="professional"?"Professional":"Free Consumer"} Plan</span>
              <span className={`badge ${user.role==="professional"?"badge-gold":"badge-sage"}`}>{user.role==="professional"?"Active":"Free"}</span>
            </div>
            <p className="caption">{user.role==="professional"?"Unlimited clients · Ground Truth training · API access · Export reports":"Unlimited personal scans · 6 diagnostic metrics · Progress history"}</p>
          </div>
          {user.role!=="professional"&&<button className="btn btn-gold">Upgrade to Pro</button>}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{borderColor:"rgba(180,84,84,.2)"}}>
        <div className="label" style={{marginBottom:14,color:"var(--crit)"}}>Account</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <button className="btn btn-outline" onClick={onSignOut}><LogOut size={14}/> Sign Out</button>
          <button className="btn btn-danger"><X size={14}/> Delete All Data</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP — Navigation & State Management
// ══════════════════════════════════════════════════════════════════════════════

export default function App(){
  const[page,setPage]=useState(PAGES.LANDING);
  const[user,setUser]=useState(null);
  const[scans,setScans]=useState([]);
  const[latestScan,setLatestScan]=useState(null);
  const[trainingPairs,setTrainingPairs]=useState([]);
  const[sidebarOpen,setSidebarOpen]=useState(false);

  // Load persisted data on mount
  useEffect(()=>{
    (async()=>{
      try{
        const s=await window.storage.get("scans");
        if(s?.value) setScans(JSON.parse(s.value));
        const tp=await window.storage.get("trainingPairs");
        if(tp?.value) setTrainingPairs(JSON.parse(tp.value));
        const u=await window.storage.get("user");
        if(u?.value){setUser(JSON.parse(u.value));setPage(PAGES.DASHBOARD);}
      }catch(_){}
    })();
  },[]);

  // Persist scans
  useEffect(()=>{
    if(scans.length) window.storage.set("scans",JSON.stringify(scans)).catch(()=>{});
  },[scans]);

  // Persist training pairs
  useEffect(()=>{
    if(trainingPairs.length) window.storage.set("trainingPairs",JSON.stringify(trainingPairs)).catch(()=>{});
  },[trainingPairs]);

  const handleAuth=u=>{
    setUser(u);
    window.storage.set("user",JSON.stringify(u)).catch(()=>{});
    setPage(PAGES.DASHBOARD);
  };

  const handleSignOut=()=>{
    setUser(null);setPage(PAGES.LANDING);
    window.storage.delete("user").catch(()=>{});
  };

  const handleScanComplete=scan=>{
    setScans(p=>[...p,scan]);
    setLatestScan(scan);
    setPage(PAGES.RESULTS);
  };

  const handleAddPair=pair=>{
    setTrainingPairs(p=>[...p,pair]);
  };

  const nav=p=>{setPage(p);setSidebarOpen(false)};

  // Navigation items
  const navItems=[
    {icon:<Home size={15}/>,label:"Dashboard",page:PAGES.DASHBOARD,section:"main"},
    {icon:<Camera size={15}/>,label:"New Scan",page:PAGES.SCAN,section:"main"},
    {icon:<BarChart2 size={15}/>,label:"History",page:PAGES.HISTORY,section:"main"},
    {icon:<Brain size={15}/>,label:"Training Hub",page:PAGES.TRAINING,section:"advanced"},
    {icon:<Users size={15}/>,label:"Pro Mode",page:PAGES.PRO,section:"advanced"},
    {icon:<Settings size={15}/>,label:"Settings",page:PAGES.SETTINGS,section:"account"},
  ];

  // Landing page — no sidebar
  if(page===PAGES.LANDING){
    return(
      <>
        <style>{G}</style>
        <div className="grain" style={{minHeight:"100vh"}}>
          {/* Landing nav */}
          <nav style={{padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)",background:"rgba(12,11,9,.8)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="logo-mark">🔬</div>
              <div>
                <div className="logo-name">Trichella</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-ghost" onClick={()=>setPage(PAGES.AUTH)} style={{fontSize:13}}>Sign In</button>
              <button className="btn btn-gold" onClick={()=>setPage(PAGES.AUTH)} style={{fontSize:13}}>Get Started Free</button>
            </div>
          </nav>
          <Landing onEnter={()=>setPage(PAGES.AUTH)}/>
        </div>
      </>
    );
  }

  // Auth page — no sidebar
  if(page===PAGES.AUTH){
    return(
      <>
        <style>{G}</style>
        <div className="grain" style={{minHeight:"100vh"}}>
          <Auth onAuth={handleAuth}/>
        </div>
      </>
    );
  }

  // Main app — with sidebar
  return(
    <>
      <style>{G}</style>
      <div className="grain app-shell">
        {/* Mobile top bar */}
        <div className="mobile-bar">
          <button className="btn btn-ghost" onClick={()=>setSidebarOpen(o=>!o)} style={{padding:6}}>
            {sidebarOpen?<X size={20}/>:<Menu size={20}/>}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="logo-mark" style={{width:28,height:28,borderRadius:8,fontSize:13}}>🔬</div>
            <span className="logo-name" style={{fontSize:15}}>Trichella</span>
          </div>
          <div style={{width:36}}/>
        </div>

        {/* Overlay */}
        {sidebarOpen&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:40}} onClick={()=>setSidebarOpen(false)}/>
        )}

        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen?" open":""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">🔬</div>
            <div>
              <div className="logo-name">Trichella</div>
              <div className="logo-ver">AI · v2.0</div>
            </div>
          </div>

          {/* Main nav */}
          <div className="nav-section">
            <div className="nav-label">Main</div>
            {navItems.filter(n=>n.section==="main").map(n=>(
              <div key={n.page} className={`nav-item${page===n.page?" active":""}`} onClick={()=>nav(n.page)}>
                {n.icon}<span>{n.label}</span>
              </div>
            ))}
          </div>
          <div className="nav-section" style={{marginTop:16}}>
            <div className="nav-label">Advanced</div>
            {navItems.filter(n=>n.section==="advanced").map(n=>(
              <div key={n.page} className={`nav-item${page===n.page?" active":""}`} onClick={()=>nav(n.page)}>
                {n.icon}<span>{n.label}</span>
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="sidebar-footer">
            <div className={`nav-item${page===PAGES.SETTINGS?" active":""}`} onClick={()=>nav(PAGES.SETTINGS)}>
              <Settings size={15}/><span>Settings</span>
            </div>
            {user&&(
              <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",marginTop:4}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"var(--gold-lt)",border:"1px solid rgba(201,169,110,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--gold)",flexShrink:0}}>
                  {user.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                  <div style={{fontSize:10,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.role}</div>
                </div>
              </div>
            )}
            {/* Scan count badge */}
            {scans.length>0&&(
              <div style={{padding:"8px 12px"}}>
                <div style={{background:"var(--gold-lt)",borderRadius:8,padding:"6px 10px",display:"flex",gap:8,alignItems:"center"}}>
                  <Award size={13} color="var(--gold)"/>
                  <span style={{fontSize:11,color:"var(--gold)",fontWeight:600}}>{scans.length} scan{scans.length!==1?"s":""} completed</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Page content */}
        <main className="page-content">
          {page===PAGES.DASHBOARD&&<Dashboard user={user} scans={scans} onNav={nav}/>}

          {page===PAGES.SCAN&&(
            <ScanFlow
              onComplete={handleScanComplete}
              onBack={()=>nav(PAGES.DASHBOARD)}
            />
          )}

          {page===PAGES.RESULTS&&(
            <Results
              scan={latestScan||scans[scans.length-1]||null}
              onNewScan={()=>nav(PAGES.SCAN)}
              onHistory={()=>nav(PAGES.HISTORY)}
            />
          )}

          {page===PAGES.HISTORY&&(
            <History
              scans={scans}
              onScanSelect={s=>{setLatestScan(s);nav(PAGES.RESULTS)}}
              onNewScan={()=>nav(PAGES.SCAN)}
            />
          )}

          {page===PAGES.TRAINING&&(
            <TrainingHub
              pairs={trainingPairs}
              onAddPair={handleAddPair}
            />
          )}

          {page===PAGES.PRO&&(
            <ProDashboard onNav={nav}/>
          )}

          {page===PAGES.SETTINGS&&(
            <SettingsPage user={user} onSignOut={handleSignOut}/>
          )}
        </main>
      </div>
    </>
  );
}
