/**
 * PDF export utilities with DebtWise logo for reports and repayment plans
 */

import { jsPDF } from "jspdf";

const LOGO_URL = "/logo-debtwise-transparent.png";

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
    doc.addImage(logo, "PNG", 14, 10, 24, 24);
  }
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("DebtWise AI", logo ? 42 : 14, 22);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 28, pageWidth - 14, 28);
  doc.setTextColor(0, 0, 0);
}

/** Export Monthly Insight report as PDF */
export async function exportInsightPdf(
  title: string,
  dateLabel: string,
  summary: string
): Promise<void> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.getPageWidth(1);
  const margin = 20;
  let y = 40;

  await addLogoToPdf(doc, pageWidth);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(dateLabel, margin, y);
  y += 12;

  doc.setFontSize(11);
  const lines = doc.splitTextToSize(summary, pageWidth - margin * 2);
  doc.text(lines, margin, y);

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
  const pageWidth = doc.getPageWidth(1);
  const margin = 20;
  let y = 40;

  await addLogoToPdf(doc, pageWidth);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${plan.strategy.charAt(0).toUpperCase() + plan.strategy.slice(1)} Repayment Plan`, margin, y);
  y += 8;

  if (debtorCompany || debtorEmail) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Prepared for:", margin, y);
    y += 6;
    if (debtorCompany) {
      doc.setFont("helvetica", "bold");
      doc.text(debtorCompany, margin, y);
      y += 6;
    }
    if (debtorEmail) {
      doc.setFont("helvetica", "normal");
      doc.text(`Contact: ${debtorEmail}`, margin, y);
      y += 8;
    }
    doc.setFont("helvetica", "normal");
  }

  doc.setFontSize(10);
  doc.text(`Debt-free in ${plan.months_to_payoff} months`, margin, y);
  y += 6;
  doc.text(`Target date: ${new Date(plan.debt_free_date).toLocaleDateString("en-US")}`, margin, y);
  y += 6;
  doc.text(`Monthly payment: $${plan.monthly_payment.toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Total interest: $${plan.total_interest_paid.toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Interest saved: $${plan.interest_saved.toLocaleString()}`, margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Repayment order:", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(plan.repayment_order.join(" → "), margin, y);
  y += 12;

  if (plan.explanation) {
    doc.setFont("helvetica", "bold");
    doc.text("AI Explanation", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const expLines = doc.splitTextToSize(plan.explanation, pageWidth - margin * 2);
    doc.text(expLines, margin, y);
    y += expLines.length * 5 + 10;
  }

  if (plan.schedule.length > 0) {
    const colWidths = [25, 35, 35, 45];
    const headers = ["Month", "Payment", "Interest", "Remaining"];
    const fmt = (n: number) => `$${n.toLocaleString()}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    let x = margin;
    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i];
    });
    y += 6;
    doc.setFont("helvetica", "normal");

    for (const m of plan.schedule.slice(0, 12)) {
      if (y > 260) {
        doc.addPage();
        y = 20;
        await addLogoToPdf(doc, pageWidth);
        y = 40;
      }

      const totalPayment = m.debts.reduce((s, d) => s + d.payment, 0);
      const totalInterest = m.debts.reduce((s, d) => s + d.interest, 0);
      const totalRemaining = m.debts.reduce((s, d) => s + d.remaining, 0);

      doc.setFontSize(8);
      doc.text(`Month ${m.month}`, margin, y);
      doc.text(fmt(totalPayment), margin + 25, y);
      doc.text(fmt(totalInterest), margin + 60, y);
      doc.text(fmt(totalRemaining), margin + 95, y);
      y += 5;
    }
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
