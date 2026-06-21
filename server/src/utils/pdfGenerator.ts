import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const getCurrencySymbol = (currencyCode: string) => {
  switch(currencyCode?.toUpperCase()) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    case 'PKR': return 'Rs ';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    case 'USD': default: return '$';
  }
};

const drawVoicyLogo = (doc: jsPDF, x: number, y: number, isDarkBackground = false) => {
  // A sleek black box with a yellow "V" triangle/lightning shape
  doc.setFillColor(isDarkBackground ? 255 : 15, isDarkBackground ? 255 : 23, isDarkBackground ? 255 : 42);
  doc.rect(x, y, 14, 14, 'F');
  
  // The V Shape (Yellow)
  doc.setFillColor(250, 204, 21); // #FACC15
  doc.triangle(x + 3, y + 3, x + 11, y + 3, x + 7, y + 11, 'F');
  
  // Voicy Wordmark
  doc.setTextColor(isDarkBackground ? 255 : 15, isDarkBackground ? 255 : 23, isDarkBackground ? 255 : 42);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('VOICY', x + 18, y + 11);
};

export const generateSalarySlipPDF = async (record: any, company: any) => {
  const doc = new jsPDF();

  // Premium Neo-Brutalism Header for Salary Slip
  // Deep Slate / Navy Header Block
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Yellow Accent Bar
  doc.setFillColor(250, 204, 21);
  doc.rect(0, 50, 210, 4, 'F');

  // Voicy Logo in Header (Dark background version)
  drawVoicyLogo(doc, 15, 15, true);

  // Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY SLIP', 195, 28, { align: 'right' });
  
  doc.setFillColor(250, 204, 21);
  doc.rect(145, 34, 50, 6, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(record.period?.toUpperCase() || 'CURRENT PERIOD', 170, 38.5, { align: 'center' });

  // Employer Info
  let currentY = 70;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text((company?.name || 'Company').toUpperCase(), 15, currentY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let addrY = currentY + 6;
  if (company?.address) { doc.text(company.address, 15, addrY); addrY += 5; }
  if (company?.country) { doc.text(company.country, 15, addrY); addrY += 5; }
  if (company?.contactNumber) { doc.text(`Phone: ${company.contactNumber}`, 15, addrY); addrY += 5; }
  if (company?.website) { doc.text(`Web: ${company.website}`, 15, addrY); addrY += 5; }


  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EMPLOYEE DETAILS', 120, currentY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Name:', 120, currentY + 7);
  doc.text('Email:', 120, currentY + 13);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(record.employeeName?.toUpperCase() || '', 140, currentY + 7);
  doc.text(record.employeeEmail || '', 140, currentY + 13);

  // Earnings & Deductions Tables (Side by Side illusion using autoTable)
  currentY += 30;
  
  const sym = getCurrencySymbol(record.currency || 'USD');

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Earnings', 'Deductions']],
    body: [
      ['Base Salary', `${sym}${record.baseSalary?.toLocaleString()}`, ''],
      ['Bonuses & Allowances', `${sym}${record.bonuses?.toLocaleString()}`, ''],
      ['Adjustments / Taxes', '', `${sym}${record.deductions?.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { textColor: [15, 23, 42] },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', textColor: [0, 138, 0] }, // Green for earnings
      2: { halign: 'right', textColor: [211, 47, 47] } // Red for deductions
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Premium Net Pay Box
  doc.setFillColor(248, 250, 252); // Light slate bg
  doc.rect(110, finalY, 85, 30, 'F');
  
  // Left Yellow Accent
  doc.setFillColor(250, 204, 21);
  doc.rect(110, finalY, 4, 30, 'F');

  doc.setDrawColor(226, 232, 240); // slate-200 border
  doc.rect(110, finalY, 85, 30, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('NET TAKE HOME', 122, finalY + 10);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${sym}${record.netPay?.toLocaleString()}`, 122, finalY + 22);

  // Footer / Watermark
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 275, 195, 275);
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('This is an electronically generated salary slip and does not require a physical signature.', 105, 282, { align: 'center' });
  doc.text(`Generated by Voicy Platform | ${new Date().toLocaleDateString()}`, 105, 287, { align: 'center' });

  return doc.output('arraybuffer');
};

export const generateCustomInvoicePDF = async (invoice: any, company: any) => {
  const doc = new jsPDF();

  // Premium Neo-Brutalism Header for Invoice
  // Top Yellow Accent Line
  doc.setFillColor(250, 204, 21); // #FACC15
  doc.rect(0, 0, 210, 8, 'F');

  // Deep Slate / Navy Header Block
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 8, 210, 42, 'F');
  
  // Voicy Logo in Header (Dark background version)
  drawVoicyLogo(doc, 15, 22, true);
  
  // Invoice Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 195, 30, { align: 'right' });
  
  // Invoice Number Badge
  doc.setFillColor(250, 204, 21); // #FACC15
  doc.rect(145, 36, 50, 7, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber || 'INV-0000', 170, 41, { align: 'center' });

  let currentY = 70;

  // Sender Details (Company)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text((company?.name || 'Company').toUpperCase(), 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  let cY = currentY + 6;
  if (company?.address) { doc.text(company.address, 15, cY); cY += 5; }
  if (company?.country) { doc.text(company.country, 15, cY); cY += 5; }
  if (company?.contactNumber) { doc.text(`Phone: ${company.contactNumber}`, 15, cY); cY += 5; }
  if (company?.website) { doc.text(`Web: ${company.website}`, 15, cY); cY += 5; }

  // Recipient Details (Client)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILL TO:', 120, currentY);
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text((invoice?.clientName || 'Client').toUpperCase(), 120, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  if (invoice?.clientEmail) doc.text(invoice.clientEmail, 120, currentY + 12);
  if (invoice?.clientAddress) doc.text(invoice.clientAddress, 120, currentY + 17);

  currentY += 35;

  // Invoice Meta Info (Dates)
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 15, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 15, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DATE ISSUED:', 25, currentY + 9);
  doc.text('DUE DATE:', 110, currentY + 9);
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '', 55, currentY + 9);
  doc.text(invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '', 135, currentY + 9);

  currentY += 25;

  // Custom Fields (if any)
  if (invoice.customFields && invoice.customFields.length > 0) {
    invoice.customFields.forEach((field: any) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`${field.label.toUpperCase()}:`, 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(field.value, 50, currentY);
      currentY += 7;
    });
    currentY += 5;
  }

  // Items Table
  const items = invoice?.items || [];
  const body = items.map((item: any) => [
    item.description || '',
    (item.quantity || 0).toString(),
    `Rs ${(item.unitPrice || 0).toLocaleString()}`,
    `Rs ${(item.amount || 0).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: body,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42] },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
    }
  });

  let finalY = ((doc as any).lastAutoTable?.finalY || 130) + 15;

  // Check for page overflow
  if (finalY + 45 > 270) {
    doc.addPage();
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 0, 210, 8, 'F');
    finalY = 25;
  }
  
  // Totals Summary Box (Aligned Right)
  doc.setFillColor(248, 250, 252);
  doc.rect(120, finalY, 75, 40, 'F');
  
  // Right Yellow Accent
  doc.setFillColor(250, 204, 21);
  doc.rect(191, finalY, 4, 40, 'F');

  doc.setDrawColor(226, 232, 240);
  doc.rect(120, finalY, 75, 40, 'S');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('SUBTOTAL:', 125, finalY + 10);
  doc.text(`TAX (${invoice?.taxRate || 0}%):`, 125, finalY + 18);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(125, finalY + 23, 185, finalY + 23);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT:', 125, finalY + 32);

  // Totals Values
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Rs ${(invoice?.subtotal || 0).toLocaleString()}`, 185, finalY + 10, { align: 'right' });
  doc.text(`Rs ${(invoice?.taxAmount || 0).toLocaleString()}`, 185, finalY + 18, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs ${(invoice?.totalAmount || 0).toLocaleString()}`, 185, finalY + 32, { align: 'right' });

  // Status Stamp
  if (invoice?.status && invoice.status.toUpperCase() === 'PAID') {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 138, 0); // Green
    // Rotate and stamp
    doc.text('PAID', 50, finalY + 25, { angle: 25 });
  }

  // Notes Box
  if (invoice.notes) {
    doc.setFillColor(254, 252, 232); // amber-50 light yellow
    doc.rect(15, finalY, 95, 40, 'F');
    doc.setDrawColor(250, 204, 21); // amber accent
    doc.rect(15, finalY, 95, 40, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14); // amber-800
    doc.text('NOTES / MEMO:', 20, finalY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 63, 18);
    doc.text(invoice.notes, 20, finalY + 15, { maxWidth: 85 });
  }

  // Footer separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 275, 195, 275);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Thank you for your business. For any questions, please contact the issuer.', 105, 282, { align: 'center' });
  doc.text(`Powered by Voicy Platform`, 105, 287, { align: 'center' });

  return doc.output('arraybuffer');
};
