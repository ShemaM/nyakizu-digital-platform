import jsPDF from "jspdf";
import { type Order, SELLERS, formatKES, formatDateTime } from "./dummy-data";

export function downloadReceipt(order: Order): void {
  const seller = SELLERS.find((s) => s.id === order.sellerId);
  const doc    = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  let y = 0;

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("NYAKIZU DIGITAL MARKETPLACE", W / 2, 17, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Digital Receipt", W / 2, 26, { align: "center" });
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, W / 2, 33, { align: "center" });

  y = 48;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const section = (title: string) => {
    y += 3;
    doc.setFillColor(239, 246, 255);
    doc.rect(14, y - 4, W - 28, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235);
    doc.text(title.toUpperCase(), 18, y + 1);
    y += 9;
    doc.setTextColor(0, 0, 0);
  };

  const row = (label: string, value: string, labelColor = [100, 100, 100] as [number, number, number]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...labelColor);
    doc.text(label, 18, y);
    doc.setTextColor(30, 30, 30);
    doc.text(value, 75, y);
    y += 6;
  };

  const hr = (dashed = false) => {
    doc.setDrawColor(220, 220, 220);
    if (dashed) doc.setLineDashPattern([2, 2], 0);
    doc.line(14, y, W - 14, y);
    doc.setLineDashPattern([], 0);
    y += 4;
  };

  // ── Order meta ────────────────────────────────────────────────────────────────
  section("Order Details");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(order.slug.toUpperCase(), 18, y);
  y += 6;
  const statusLabels: Record<string, string> = {
    submitted: "Submitted — awaiting packing",
    sourcing: "Being sourced & packed",
    locked: "Invoice confirmed",
    debt_active: "Invoice confirmed — balance owed",
    cleared: "Fully paid & settled",
    cancelled: "Cancelled",
  };
  row("Status:", statusLabels[order.status] ?? order.status);

  // ── Parties ───────────────────────────────────────────────────────────────────
  y += 2;
  const partyY = y;
  // Buyer column
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("BUYER", 18, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(order.buyerName, 18, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(order.buyerLocation, 18, y);
  const afterBuyerY = y + 8;

  // Seller column
  y = partyY;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("SELLER", W / 2 + 5, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(seller?.storeName ?? "", W / 2 + 5, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(seller?.location ?? "", W / 2 + 5, y);
  if (seller?.mpesa) {
    y += 5;
    doc.text(`M-Pesa: ${seller.mpesa}`, W / 2 + 5, y);
  }

  y = Math.max(afterBuyerY, y + 8);

  // ── Timeline ──────────────────────────────────────────────────────────────────
  const timeline = [
    { label: "Order created:",    ts: order.createdAt         },
    { label: "Submitted:",        ts: order.submittedAt       },
    { label: "Sourcing started:", ts: order.sourcingStartedAt },
    { label: "Invoice finalised:",ts: order.lockedAt          },
  ].filter((x) => x.ts);

  if (timeline.length) {
    section("Timeline");
    for (const { label, ts } of timeline) row(label, formatDateTime(ts!));
  }

  // ── Items ─────────────────────────────────────────────────────────────────────
  y += 2;
  section("Items Ordered");

  // Column headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("DESCRIPTION",  18,  y);
  doc.text("QTY",         130,  y);
  doc.text("UNIT PRICE",  148,  y);
  doc.text("SUBTOTAL",    182,  y, { align: "right" });
  y += 3;
  hr();

  doc.setFontSize(8.5);
  for (const item of order.items) {
    if (item.isSourcing) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(160, 120, 0);
      const lines = doc.splitTextToSize(item.name, 105);
      doc.text(lines, 18, y);
      doc.text("(sourced)", 182, y, { align: "right" });
      y += 5.5 * lines.length;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(item.name, 105);
      doc.text(lines,                        18, y);
      doc.text(`×${item.quantity}`,         130, y);
      doc.text(formatKES(item.unitPrice),   148, y);
      doc.setFont("helvetica", "bold");
      doc.text(formatKES(item.subtotal),    182, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 5.5 * lines.length;
    }
  }

  y += 3;
  hr(true);

  // Totals
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Estimate total:", 135, y);
  doc.setTextColor(30, 30, 30);
  doc.text(formatKES(order.draftTotal), 182, y, { align: "right" });
  y += 6;

  if (order.finalTotal) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("FINAL INVOICE TOTAL:", 120, y);
    doc.text(formatKES(order.finalTotal), 182, y, { align: "right" });
    y += 8;
  }

  // ── Payment records ───────────────────────────────────────────────────────────
  if (order.ledgerEntries.length > 0) {
    section("Payment Records");

    let totalPaid = 0;
    for (const entry of order.ledgerEntries) {
      const method = entry.method === "mpesa" ? "M-Pesa" : entry.method;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      doc.text(`${method}${entry.reference ? ` · ${entry.reference}` : ""}`, 18, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(formatKES(entry.amount), 182, y, { align: "right" });
      y += 5;
      if (entry.note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(entry.note, 18, y);
        y += 4.5;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(formatDateTime(entry.recordedAt), 18, y);
      y += 7;
      totalPaid += entry.amount;
    }

    hr(true);

    const balance = (order.finalTotal ?? 0) - totalPaid;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text("Total paid:", 140, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text(formatKES(totalPaid), 182, y, { align: "right" });
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    if (balance > 0) {
      doc.setTextColor(180, 100, 0);
      doc.text("Balance remaining:", 130, y);
      doc.text(formatKES(balance), 182, y, { align: "right" });
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text("FULLY SETTLED ✓", 140, y);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 282, W - 14, 282);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text("Nyakizu Digital Marketplace  ·  nyakizu.co.ke", W / 2, 287, { align: "center" });
  doc.text(`Generated ${formatDateTime(new Date().toISOString())}`, W / 2, 292, { align: "center" });

  doc.save(`receipt-${order.slug}.pdf`);
}
