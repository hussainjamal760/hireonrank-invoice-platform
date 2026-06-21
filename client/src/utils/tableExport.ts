import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Helper to draw Voicy Logo in PDF
 */
const drawVoicyLogo = (doc: jsPDF, x: number, y: number, isDarkBackground = false) => {
  doc.setFillColor(isDarkBackground ? 255 : 15, isDarkBackground ? 255 : 23, isDarkBackground ? 255 : 42);
  doc.rect(x, y, 14, 14, "F");
  doc.setFillColor(250, 204, 21); // #FACC15
  doc.triangle(x + 3, y + 3, x + 11, y + 3, x + 7, y + 11, "F");
  doc.setTextColor(isDarkBackground ? 255 : 15, isDarkBackground ? 255 : 23, isDarkBackground ? 255 : 42);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bolditalic");
  doc.text("VOICY", x + 18, y + 11);
};

export const exportTableToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: "csv" });
};

export const exportTableToPDF = (
  title: string,
  headers: string[],
  data: (string | number)[][],
  filename: string
) => {
  const doc = new jsPDF();

  // Premium Neo-Brutalism Header
  doc.setFillColor(250, 204, 21); // #FACC15
  doc.rect(0, 0, 210, 8, "F");
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 8, 210, 36, "F");

  // Logo
  drawVoicyLogo(doc, 15, 18, true);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), 195, 30, { align: "right" });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 195, 38, { align: "right" });

  // Render Table
  autoTable(doc, {
    startY: 55,
    head: [headers],
    body: data,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 55;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, Math.min(finalY + 20, 280), 195, Math.min(finalY + 20, 280));

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Confidential Information | Powered by Voicy Platform", 105, Math.min(finalY + 27, 287), {
    align: "center",
  });

  doc.save(`${filename}.pdf`);
};
