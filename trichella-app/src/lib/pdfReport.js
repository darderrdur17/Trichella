/**
 * PDF export for Trichella scan results.
 * Template: header, date, optional scan image, summary, metrics, conditions,
 * findings, recommendations, disclaimer. Filename: Trichella_Report_YYYY-MM-DD.pdf
 */

import { jsPDF } from "jspdf";

const MARGIN = 20;
const PAGE_W = 210;
const LINE_HEIGHT = 6;
const SECTION_GAP = 10;

function scoreLabel(s) {
  if (s >= 75) return "Healthy";
  if (s >= 50) return "Moderate";
  if (s >= 30) return "Needs Care";
  return "Critical";
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
  let y = MARGIN;

  // ── Header ──
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Trichella", MARGIN, y);
  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Scalp Diagnostic Report · AI Trichological Analysis", MARGIN, y);
  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Report date: ${dateStr}`, MARGIN, y);
  y += SECTION_GAP + 4;

  // ── Optional scan image ──
  if (scan.preview && typeof scan.preview === "string") {
    try {
      const dataUrl = await blobUrlToDataUrl(scan.preview);
      const imgW = 50;
      const imgH = 50;
      const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(dataUrl, format, MARGIN, y, imgW, imgH);
      y += imgH + SECTION_GAP;
    } catch (_) {
      // skip image if fetch/convert fails
    }
  }

  // ── Overall score & urgency ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Overall: ${report.overallScore} — ${scoreLabel(report.overallScore)} Scalp`, MARGIN, y);
  y += LINE_HEIGHT;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Scalp type: ${report.metrics?.scalpType ?? "—"}`, MARGIN, y);
  y += LINE_HEIGHT;
  doc.text(`Urgency: ${urgencyLabel(report.urgency)}`, MARGIN, y);
  y += SECTION_GAP;

  // ── Summary ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", MARGIN, y);
  y += LINE_HEIGHT;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.summary || "", PAGE_W - 2 * MARGIN);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * LINE_HEIGHT + SECTION_GAP;

  // ── Metrics ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Diagnostic Metrics", MARGIN, y);
  y += LINE_HEIGHT;
  doc.setFont("helvetica", "normal");
  const m = report.metrics || {};
  const metricsText = [
    `Hair Density: ${m.density ?? "—"}`,
    `Inflammation: ${m.inflammation ?? "—"}`,
    `Sebum Level: ${m.sebumLevel ?? "—"}`,
    `Hydration: ${m.hydration ?? "—"}`,
    `Follicle Health: ${m.follicleHealth ?? "—"}`,
    `Scalp Type: ${m.scalpType ?? "—"}`,
  ];
  metricsText.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  });
  y += SECTION_GAP;

  // ── Conditions ──
  const conditions = report.conditions || [];
  if (conditions.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Conditions Detected", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.text(conditions.join(", "), MARGIN, y);
    y += LINE_HEIGHT;
    if (report.primaryCondition) {
      doc.setFont("helvetica", "italic");
      doc.text(`Primary: ${report.primaryCondition}`, MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
    }
    y += SECTION_GAP;
  }

  // ── Findings ──
  const findings = report.findings || [];
  if (findings.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Clinical Findings", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    findings.forEach((f) => {
      const lines = doc.splitTextToSize(`• ${f}`, PAGE_W - 2 * MARGIN - 4);
      lines.forEach((line) => {
        if (y > 270) {
          doc.addPage();
          y = MARGIN;
        }
        doc.text(line, MARGIN + 4, y);
        y += LINE_HEIGHT;
      });
    });
    y += SECTION_GAP;
  }

  // ── Recommendations ──
  const recs = report.recommendations || [];
  if (recs.length) {
    if (y > 250) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Personalised Recommendations", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    recs.forEach((r, i) => {
      if (y > 265) {
        doc.addPage();
        y = MARGIN;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${r.title || "Recommendation"} [${r.priority || "—"}]`, MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont("helvetica", "normal");
      const detailLines = doc.splitTextToSize(r.detail || "", PAGE_W - 2 * MARGIN - 4);
      detailLines.forEach((line) => {
        if (y > 278) {
          doc.addPage();
          y = MARGIN;
        }
        doc.text(line, MARGIN + 4, y);
        y += LINE_HEIGHT;
      });
      y += 2;
    });
    y += SECTION_GAP;
  }

  // ── Next scan ──
  if (report.nextScanDays) {
    doc.text(`Suggested next scan: within ${report.nextScanDays} days`, MARGIN, y);
    y += LINE_HEIGHT + SECTION_GAP;
  }

  // ── Disclaimer ──
  if (y > 260) {
    doc.addPage();
    y = MARGIN;
  }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const disclaimer =
    "This AI analysis is for informational purposes only and does not constitute medical advice. " +
    "For persistent concerns — significant hair loss, pain, or unusual scalp symptoms — please consult a qualified dermatologist or trichologist.";
  const discLines = doc.splitTextToSize(disclaimer, PAGE_W - 2 * MARGIN);
  doc.text(discLines, MARGIN, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // Filename: Trichella_Report_YYYY-MM-DD.pdf
  const isoDate = new Date(scan.date).toISOString().slice(0, 10);
  const filename = `Trichella_Report_${isoDate}.pdf`;
  doc.save(filename);
}
