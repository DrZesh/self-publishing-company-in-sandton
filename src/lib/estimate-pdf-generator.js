import jsPDF from 'jspdf';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/742d0fecb_creativelogo.png';
const COMPANY_INFO = {
  name: 'Creative Books SA',
  address: 'Prism Office Park, 1 Ruby Cl, Johannesburg, Gauteng 2191, South Africa',
  bankFNB: { name: 'FNB', account: 'Creative Books SA', number: '62848257673' },
  bankNedbank: { name: 'Nedbank', account: 'Creative Books SA', number: '1288581483', type: 'Cheque Account' },
};

export async function generateEstimatePDF(clientInfo, breakdown, total, quoteNumber) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 15;

  // Logo and quote number (top right)
  doc.setFont('Inter', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('QUOTE', pageWidth - margin - 30, yPosition);
  
  doc.setFontSize(11);
  doc.text(`# ${quoteNumber}`, pageWidth - margin - 30, yPosition + 8);

  // Company logo area placeholder
  yPosition = 35;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(10);
  doc.text('[CREATIVE LOGO]', margin, yPosition);

  // Company info
  yPosition = 50;
  doc.setFont('Inter', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(COMPANY_INFO.name, margin, yPosition);
  
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);
  yPosition += 5;
  doc.text('Prism Office Park', margin, yPosition);
  yPosition += 4;
  doc.text('1 Ruby Cl', margin, yPosition);
  yPosition += 4;
  doc.text('Johannesburg Gauteng 2191', margin, yPosition);
  yPosition += 4;
  doc.text('South Africa', margin, yPosition);

  // Estimate date (right side)
  doc.setTextColor(0, 0, 0);
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Estimate Date : ${dateStr}`, pageWidth - margin - 50, 50);

  // Bill To
  yPosition = 75;
  doc.setFont('Inter', 'bold');
  doc.setFontSize(11);
  doc.text('Bill To', margin, yPosition);
  
  doc.setFont('Inter', 'normal');
  doc.setFontSize(10);
  yPosition += 6;
  doc.text(clientInfo.name, margin, yPosition);

  // Table header
  yPosition += 12;
  doc.setFillColor(50, 50, 50);
  doc.rect(margin - 1, yPosition - 4, pageWidth - margin * 2 + 2, 6, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Inter', 'bold');
  doc.setFontSize(10);
  doc.text('#', margin + 2, yPosition);
  doc.text('Item & Description', margin + 10, yPosition);
  doc.text('Qty', pageWidth - margin - 90, yPosition);
  doc.text('Rate', pageWidth - margin - 55, yPosition);
  doc.text('Amount', pageWidth - margin - 5, yPosition, { align: 'right' });

  // Table rows
  yPosition += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);
  let itemNum = 1;

  breakdown.forEach((item) => {
    const startY = yPosition;
    
    // Item number
    doc.text(itemNum.toString(), margin + 2, yPosition);
    
    // Item name and description
    const descLines = doc.splitTextToSize(`${item.name}\n${item.description}`, 60);
    descLines.forEach((line, idx) => {
      doc.text(line, margin + 10, yPosition);
      if (idx < descLines.length - 1) yPosition += 4;
    });
    
    // Amount (simplified for now)
    const rowHeight = Math.max(descLines.length * 4, 4);
    doc.text(item.amount.toLocaleString(), pageWidth - margin - 5, startY + 2, { align: 'right' });

    yPosition += 6;
    itemNum++;

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Subtotal and Total
  yPosition += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  doc.setFont('Inter', 'bold');
  doc.setFontSize(10);
  doc.text('Sub Total', pageWidth - margin - 50, yPosition);
  doc.text(total.toLocaleString(), pageWidth - margin - 5, yPosition, { align: 'right' });

  yPosition += 8;
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - margin - 70, yPosition - 4, 70, 8, 'F');
  
  doc.setFont('Inter', 'bold');
  doc.setFontSize(11);
  doc.text('Total', pageWidth - margin - 50, yPosition);
  doc.text(`R${total.toLocaleString()}`, pageWidth - margin - 5, yPosition, { align: 'right' });

  // Notes section
  yPosition += 15;
  doc.setFont('Inter', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Notes', margin, yPosition);
  yPosition += 6;

  // Banking details
  doc.setFont('Inter', 'bold');
  doc.setFontSize(9);
  doc.text('Banking Details', margin, yPosition);
  yPosition += 5;

  doc.setFont('Inter', 'normal');
  doc.setFontSize(8);
  doc.text(COMPANY_INFO.bankFNB.name, margin, yPosition);
  yPosition += 4;
  doc.text(`Account Name: ${COMPANY_INFO.bankFNB.account}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Account Number: ${COMPANY_INFO.bankFNB.number}`, margin, yPosition);
  yPosition += 5;
  doc.text('OR', margin, yPosition);
  yPosition += 4;
  doc.text(COMPANY_INFO.bankNedbank.name, margin, yPosition);
  yPosition += 4;
  doc.text(`${COMPANY_INFO.bankNedbank.type}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Account Number: ${COMPANY_INFO.bankNedbank.number}`, margin, yPosition);

  // Return and save
  const filename = `Quote-${quoteNumber}.pdf`;
  return { doc, filename };
}

export function downloadEstimatePDF(clientInfo, breakdown, total, quoteNumber) {
  generateEstimatePDF(clientInfo, breakdown, total, quoteNumber).then(({ doc, filename }) => {
    doc.save(filename);
  });
}