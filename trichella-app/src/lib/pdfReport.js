/**
 * PDF export for Trichella scan results.
 * Template matches Results page: header, score hero (image + ring + summary + urgency),
 * Scalp Condition Diagnosis (6 conditions), Diagnostic Metrics, Clinical Findings,
 * Personalised Recommendations, disclaimer. Filename: Trichella_Report_YYYY-MM-DD.pdf
 */

import { jsPDF } from "jspdf";

const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const LINE_HEIGHT = 5.5;
const SECTION_GAP = 12;
const CARD_PAD = 8;

// Brand colors (RGB 0–255) — match app CSS
const colors = {
  gold: [201, 169, 110],
  goldLight: [240, 228, 200],
  sage: [122, 158, 126],
  terra: [196, 120, 90],
  amber: [212, 168, 67],
  crit: [180, 84, 84],
  text: [32, 30, 28],
  text2: [115, 110, 100],
  text3: [90, 86, 80],
  bg2: [28, 26, 23],
  border: [55, 52, 48],
};

function scoreLabel(s) {
  if (s >= 75) return "Healthy";
  if (s >= 50) return "Moderate";
  if (s >= 30) return "Needs Care";
  return "Critical";
}

function scoreColor(s) {
  if (s >= 75) return colors.sage;
  if (s >= 50) return colors.amber;
  if (s >= 30) return colors.terra;
  return colors.crit;
}

function urgencyLabel(urgency) {
  const map = {
    routine: "Routine — no immediate action needed",
    monitor: "Monitor — recheck in 2–4 weeks",
    consult: "Consult a specialist — recommend professional evaluation",
  };
  return map[urgency] || urgency;
}

function fmt(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Convert blob URL to data URL for embedding in PDF */
function blobUrlToDataUrl(url) {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        })
    );
}

/** 6 diagnostic conditions — same as App.jsx DIAG_CONDITIONS */
const DIAG_CONDITIONS = [
  { id: "dry", label: "Dry Scalp", color: colors.amber },
  { id: "oily", label: "Oily Scalp", color: colors.terra },
  { id: "sensitive", label: "Sensitive Scalp", color: colors.sage },
  { id: "acne", label: "Acne Scalp", color: colors.crit },
  { id: "inflammation", label: "Inflammation Scalp", color: colors.terra },
  { id: "dandruff", label: "Dandruff Scalp", color: colors.gold },
];

function checkNewPage(doc, y, need = 20) {
  if (y > PAGE_H - MARGIN - need) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/**
 * Generate and download a PDF report for a scan.
 * @param {Object} scan - { id?, date, preview?, report }
 * @returns {Promise<void>}
 */
export async function saveScanAsPdf(scan) {
  if (!scan || !scan.report) return;
  const doc = new jsPDF();
  const report = scan.report;
  const dateStr = fmt(scan.date);
  const m = report.metrics || {};
  let y = MARGIN;

  // ── Brand header with gold accent bar ──
  doc.setFillColor(...colors.gold);
  doc.rect(0, 0, PAGE_W, 3, "F");
  y = 14;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Trichella", MARGIN, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text2);
  doc.text("Scalp Diagnostic Report · AI Trichological Analysis", MARGIN, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...colors.text3);
  doc.text(`Report date: ${dateStr}`, MARGIN, y);
  y += SECTION_GAP + 6;

  // ── Score hero block (mirrors Results card) ──
  const contentW = PAGE_W - 2 * MARGIN;
  const heroY0 = y;
  y += CARD_PAD;

  let imgDrawn = false;
  if (scan.preview && typeof scan.preview === "string") {
    try {
      const dataUrl = await blobUrlToDataUrl(scan.preview);
      const imgSize = 32;
      const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(dataUrl, format, MARGIN + CARD_PAD, y, imgSize, imgSize);
      imgDrawn = true;
    } catch (_) {}
  }

  const leftX = imgDrawn ? MARGIN + CARD_PAD + 32 + 12 : MARGIN + CARD_PAD;
  const rightX = MARGIN + contentW - CARD_PAD;

  // Score ring (circle with arc)
  const ringX = leftX + 22;
  const ringY = y + 18;
  const ringR = 16;
  doc.setDrawColor(...colors.bg2);
  doc.setLineWidth(2.5);
  doc.circle(ringX, ringY, ringR, "S");
  const scorePct = (report.overallScore || 0) / 100;
  const col = scoreColor(report.overallScore);
  doc.setDrawColor(...col);
  doc.setLineWidth(2.5);
  // Approximate arc: draw many small segments
  const steps = 50;
  for (let i = 0; i <= steps * scorePct; i++) {
    const angle = -Math.PI / 2 + (i / steps) * 2 * Math.PI;
    const x1 = ringX + ringR * Math.cos(angle);
    const y1 = ringY + ringR * Math.sin(angle);
    const angle2 = -Math.PI / 2 + ((i + 1) / steps) * 2 * Math.PI;
    const x2 = ringX + ringR * Math.cos(angle2);
    const y2 = ringY + ringR * Math.sin(angle2);
    doc.line(x1, y1, x2, y2);
  }
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...col);
  doc.text(String(report.overallScore), ringX, ringY + 1.5, { align: "center" });
  doc.setFontSize(6);
  doc.setTextColor(...colors.text3);
  doc.text("/ 100", ringX, ringY + 6, { align: "center" });
  doc.setTextColor(...colors.text);

  // Label + scalp type badge to the right of ring
  const labelX = ringX + ringR + 14;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...col);
  doc.text(`${scoreLabel(report.overallScore)} Scalp`, labelX, ringY - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.text2);
  doc.text(String(m.scalpType ?? "—"), labelX, ringY + 2);
  // Urgency with dot
  doc.setFillColor(...(report.urgency === "routine" ? colors.sage : report.urgency === "monitor" ? colors.amber : colors.crit));
  doc.circle(labelX + 1.5, ringY + 8, 1.5, "F");
  doc.setTextColor(...colors.text2);
  doc.setFontSize(8);
  doc.text(urgencyLabel(report.urgency), labelX + 5, ringY + 9);

  // Next scan box (if present) — top right of hero
  if (report.nextScanDays) {
    const boxW = 28;
    const boxX = rightX - boxW;
    doc.setFillColor(...colors.bg2);
    doc.roundedRect(boxX, heroY0 + CARD_PAD, boxW, 22, 2, 2, "F");
    doc.setDrawColor(...colors.border);
    doc.roundedRect(boxX, heroY0 + CARD_PAD, boxW, 22, 2, 2, "S");
    doc.setFontSize(7);
    doc.setTextColor(...colors.text3);
    doc.text("Next scan in", boxX + boxW / 2, heroY0 + CARD_PAD + 6, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.gold);
    doc.text(String(report.nextScanDays), boxX + boxW / 2, heroY0 + CARD_PAD + 14, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.text3);
    doc.text("days", boxX + boxW / 2, heroY0 + CARD_PAD + 19, { align: "center" });
  }

  y += 38;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.text2);
  const summaryLines = doc.splitTextToSize(report.summary || "", contentW - 2 * CARD_PAD);
  summaryLines.forEach((line) => {
    doc.text(line, MARGIN + CARD_PAD, y);
    y += LINE_HEIGHT;
  });
  y += SECTION_GAP;
  const heroH = y - heroY0 + CARD_PAD;
  doc.setDrawColor(...colors.border);
  doc.roundedRect(MARGIN, heroY0, contentW, heroH, 2, 2, "S");
  y += SECTION_GAP;

  // ── Scalp Condition Diagnosis (6 conditions, 3x2 grid) ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text3);
  doc.text("SCALP CONDITION DIAGNOSIS", MARGIN, y);
  y += LINE_HEIGHT + 4;
  const condW = (contentW - 8) / 3;
  const condH = 20;
  const conditions = report.conditions || [];
  const primary = (report.primaryCondition || "").toLowerCase();
  DIAG_CONDITIONS.forEach((cond, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = MARGIN + 4 + col * (condW + 2);
    const cy = y + row * (condH + 4);
    const detected = conditions.some((c) => c.toLowerCase().includes(cond.id) || c.toLowerCase() === cond.label.toLowerCase());
    const isPrimary = primary.includes(cond.id);
    doc.setFillColor(...colors.bg2);
    doc.setDrawColor(detected ? cond.color : colors.border);
    doc.setLineWidth(detected ? 0.4 : 0.2);
    doc.roundedRect(cx, cy, condW, condH, 1.5, 1.5, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(detected ? cond.color : colors.text3));
    doc.text(cond.label, cx + 4, cy + 6);
    if (isPrimary) {
      doc.setFontSize(6);
      doc.setFillColor(...cond.color);
      doc.setTextColor(12, 11, 9);
      doc.roundedRect(cx + condW - 22, cy + 2, 20, 5, 1, 1, "F");
      doc.text("PRIMARY", cx + condW - 12, cy + 5.5, { align: "center" });
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.text2);
    doc.text(detected ? "Detected" : "—", cx + 4, cy + 12);
  });
  y += 2 * (condH + 4) + SECTION_GAP;

  // ── Diagnostic Metrics (6 items in 2 rows of 3) ──
  y = checkNewPage(doc, y, 50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text3);
  doc.text("DIAGNOSTIC METRICS", MARGIN, y);
  y += LINE_HEIGHT + 4;
  const metricLabels = ["Hair Density", "Inflammation", "Sebum Level", "Hydration", "Follicle Health", "Scalp Type"];
  const metricKeys = ["density", "inflammation", "sebumLevel", "hydration", "follicleHealth", "scalpType"];
  const metricW = (contentW - 4) / 3;
  const metricH = 14;
  metricLabels.forEach((label, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const mx = MARGIN + 2 + col * (metricW + 2);
    const my = y + row * (metricH + 3);
    doc.setFillColor(...colors.bg2);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(mx, my, metricW, metricH, 1, 1, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text3);
    doc.text(label, mx + 4, my + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    const val = m[metricKeys[idx]] ?? "—";
    doc.text(String(val), mx + 4, my + 11);
  });
  y += 2 * (metricH + 3) + SECTION_GAP;

  // ── Clinical Findings ──
  y = checkNewPage(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text3);
  doc.text("CLINICAL FINDINGS", MARGIN, y);
  y += LINE_HEIGHT + 6;
  doc.setFont("helvetica", "normal");
  const findings = report.findings || [];
  findings.forEach((f, i) => {
    y = checkNewPage(doc, y, LINE_HEIGHT * 4);
    doc.setFillColor([colors.sage, colors.amber, colors.terra, colors.gold][i % 4]);
    doc.circle(MARGIN + 3, y - 1.5, 1.2, "F");
    doc.setFontSize(9);
    doc.setTextColor(...colors.text2);
    const lines = doc.splitTextToSize(f, contentW - 14);
    lines.forEach((line) => {
      doc.text(line, MARGIN + 8, y);
      y += LINE_HEIGHT;
    });
    y += 4;
  });
  if (findings.length) y += SECTION_GAP;

  // ── Personalised Recommendations ──
  y = checkNewPage(doc, y, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text3);
  doc.text("PERSONALISED RECOMMENDATIONS", MARGIN, y);
  y += LINE_HEIGHT + 6;
  const recs = report.recommendations || [];
  recs.forEach((r, i) => {
    y = checkNewPage(doc, y, 25);
    doc.setFillColor(...colors.goldLight);
    doc.setDrawColor(...colors.gold);
    doc.roundedRect(MARGIN, y - 5, 10, 10, 2, 2, "FD");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.gold);
    doc.text(String(i + 1), MARGIN + 5, y + 1, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text(r.title || "Recommendation", MARGIN + 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const priority = r.priority || "—";
    const badgeCol = priority === "High" ? colors.crit : priority === "Medium" ? colors.amber : colors.sage;
    doc.setFillColor(...badgeCol);
    doc.roundedRect(MARGIN + 14 + doc.getTextWidth(r.title || "") + 4, y - 4, doc.getTextWidth(priority) + 4, 4.5, 1, 1, "F");
    doc.setTextColor(20, 18, 16);
    doc.text(priority, MARGIN + 14 + doc.getTextWidth(r.title || "") + 6, y - 0.5);
    doc.setTextColor(...colors.text2);
    y += 4;
    const detailLines = doc.splitTextToSize(r.detail || "", contentW - 18);
    detailLines.forEach((line) => {
      y = checkNewPage(doc, y, LINE_HEIGHT);
      doc.text(line, MARGIN + 14, y);
      y += LINE_HEIGHT;
    });
    y += 8;
  });
  if (recs.length) y += SECTION_GAP;

  // ── Disclaimer ──
  y = checkNewPage(doc, y, 25);
  doc.setFillColor(248, 242, 230);
  doc.setDrawColor(212, 168, 67);
  doc.roundedRect(MARGIN, y, contentW, 22, 2, 2, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...colors.text2);
  const disclaimer =
    "This AI analysis is for informational purposes only and does not constitute medical advice. " +
    "For persistent concerns — significant hair loss, pain, or unusual scalp symptoms — please consult a qualified dermatologist or trichologist.";
  const discLines = doc.splitTextToSize(disclaimer, contentW - 12);
  doc.text(discLines, MARGIN + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text);

  const isoDate = new Date(scan.date).toISOString().slice(0, 10);
  const filename = `Trichella_Report_${isoDate}.pdf`;
  doc.save(filename);
}
