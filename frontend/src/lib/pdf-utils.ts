/**
 * PDF export utilities with DebtWise logo for reports and repayment plans
 * Clean layout with proper alignment and jspdf-autotable for tables
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LOGO_URL = "/logo-debtwise-transparent.png";
const MARGIN = 20;
const LINE_HEIGHT = 6;
const SECTION_GAP = 10;

let logoBase64: string | null = null;

/** Load logo as base64 for embedding in PDFs */
async function getLogoBase64(): Promise<string | null> {
  if (logoBase64) return logoBase64;
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    logoBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return logoBase64;
  } catch {
    return null;
  }
}

/** Add DebtWise logo and header to a PDF document */
export async function addLogoToPdf(doc: jsPDF, pageWidth: number): Promise<void> {
  const logo = await getLogoBase64();
  if (logo) {
    doc.addImage(logo, "PNG", MARGIN, 12, 28, 28);
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("DebtWise AI", logo ? MARGIN + 34 : MARGIN, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("AI-Powered Debt Management", logo ? MARGIN + 34 : MARGIN, 35);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 42, pageWidth - MARGIN, 42);
  doc.setTextColor(0, 0, 0);
}

/** Export Monthly Insight report as PDF */
export async function exportInsightPdf(
  title: string,
  dateLabel: string,
  summary: string
): Promise<void> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 55;

  await addLogoToPdf(doc, pageWidth);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(title, MARGIN, y);
  y += LINE_HEIGHT + 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(dateLabel, MARGIN, y);
  y += SECTION_GAP + LINE_HEIGHT;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += SECTION_GAP;

  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(summary, pageWidth - MARGIN * 2);
  doc.text(lines, MARGIN, y);

  doc.save(`DebtWise-Report-${dateLabel.replace(/\s/g, "-")}.pdf`);
}

/** Export Repayment Plan as PDF */
export async function exportRepaymentPlanPdf(
  plan: {
    strategy: string;
    months_to_payoff: number;
    debt_free_date: string;
    monthly_payment: number;
    total_interest_paid: number;
    interest_saved: number;
    repayment_order: string[];
    explanation: string;
    schedule: Array<{
      month: number;
      debts: Array<{ provider: string; payment: number; interest: number; remaining: number }>;
    }>;
  },
  debtorCompany?: string,
  debtorEmail?: string
): Promise<void> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 55;

  await addLogoToPdf(doc, pageWidth);

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const strategyLabel = plan.strategy.charAt(0).toUpperCase() + plan.strategy.slice(1);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${strategyLabel} Repayment Plan`, MARGIN, y);
  y += LINE_HEIGHT + 6;

  if (debtorCompany || debtorEmail) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Prepared for:", MARGIN, y);
    y += LINE_HEIGHT;
    if (debtorCompany) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(debtorCompany, MARGIN, y);
      y += LINE_HEIGHT;
    }
    if (debtorEmail) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Contact: ${debtorEmail}`, MARGIN, y);
      y += LINE_HEIGHT + 4;
    }
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += SECTION_GAP;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const summaryLines = [
    `Debt-free in ${plan.months_to_payoff} months`,
    `Target date: ${new Date(plan.debt_free_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    `Monthly payment: ${fmt(plan.monthly_payment)}`,
    `Total interest: ${fmt(plan.total_interest_paid)}`,
    `Interest saved: ${fmt(plan.interest_saved)}`,
  ];
  summaryLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  });
  y += SECTION_GAP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Repayment order", MARGIN, y);
  y += LINE_HEIGHT;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const orderText = plan.repayment_order.map((p, i) => `${i + 1}. ${p}`).join("  →  ");
  const orderLines = doc.splitTextToSize(orderText, pageWidth - MARGIN * 2);
  doc.text(orderLines, MARGIN, y);
  y += orderLines.length * LINE_HEIGHT + SECTION_GAP;

  if (plan.explanation) {
    doc.setFont("helvetica", "bold");
    doc.text("AI Explanation", MARGIN, y);
    y += LINE_HEIGHT;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const expLines = doc.splitTextToSize(plan.explanation, pageWidth - MARGIN * 2);
    doc.text(expLines, MARGIN, y);
    y += expLines.length * LINE_HEIGHT + SECTION_GAP;
  }

  if (plan.schedule.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("First 12-Month Schedule", MARGIN, y);
    y += LINE_HEIGHT + 4;

    const tableData = plan.schedule.slice(0, 12).map((m) => {
      const totalPayment = m.debts.reduce((s, d) => s + d.payment, 0);
      const totalInterest = m.debts.reduce((s, d) => s + d.interest, 0);
      const totalRemaining = m.debts.reduce((s, d) => s + d.remaining, 0);
      return [`Month ${m.month}`, fmt(totalPayment), fmt(totalInterest), fmt(totalRemaining)];
    });

    autoTable(doc, {
      startY: y,
      head: [["Month", "Payment", "Interest", "Remaining"]],
      body: tableData,
      margin: { left: MARGIN, right: MARGIN },
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40, halign: "right" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 45, halign: "right" },
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + SECTION_GAP;
  }

  doc.save(`DebtWise-Repayment-Plan-${plan.strategy}.pdf`);
}

/** Open mailto for sending plan to debtor company */
export function openMailtoForDebtor(
  debtorEmail: string,
  debtorCompany: string,
  fileName: string
): void {
  const subject = encodeURIComponent(`Debt Repayment Plan - ${debtorCompany}`);
  const body = encodeURIComponent(
    `Please find attached the DebtWise AI Repayment Plan.\n\nFile: ${fileName}\n\nPlease download the PDF from DebtWise AI and attach it to this email before sending.`
  );
  window.location.href = `mailto:${debtorEmail}?subject=${subject}&body=${body}`;
}
