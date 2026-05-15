import jsPDF from 'jspdf';

export function generateEstimatePDF(clientInfo, breakdown, total) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Header with logo area and company info
  doc.setFillColor(184, 115, 51); // Copper color
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(24);
  doc.text('Creative Books SA', margin, 20);

  doc.setFont('Inter', 'normal');
  doc.setFontSize(10);
  doc.text('Publishing & Printing Solutions', margin, 28);

  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Title
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(18);
  doc.text('Publishing Estimate', margin, yPosition);
  yPosition += 10;

  // Date and reference
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date: ${dateStr}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Reference: EST-${Date.now().toString().slice(-8)}`, margin, yPosition);
  yPosition += 10;

  // Client info section
  doc.setFont('Inter', 'bold');
  doc.setFontSize(11);
  doc.text('Client Information', margin, yPosition);
  yPosition += 6;

  doc.setFont('Inter', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${clientInfo.name}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${clientInfo.email}`, margin, yPosition);
  yPosition += 5;
  if (clientInfo.phone) {
    doc.text(`Phone: ${clientInfo.phone}`, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  // Service breakdown table
  doc.setFont('Inter', 'bold');
  doc.setFontSize(11);
  doc.text('Service Breakdown', margin, yPosition);
  yPosition += 8;

  // Table headers
  doc.setFont('Inter', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(184, 115, 51);
  doc.text('Service', margin, yPosition);
  doc.text('Details', margin + 60, yPosition);
  doc.text('Amount', pageWidth - margin - 30, yPosition, { align: 'right' });
  yPosition += 7;

  // Table divider
  doc.setDrawColor(184, 115, 51);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Table rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);

  breakdown.forEach((item) => {
    const serviceText = doc.splitTextToSize(item.name, 55);
    const detailsText = doc.splitTextToSize(item.description, 50);
    const maxLines = Math.max(serviceText.length, detailsText.length);

    // Draw row
    serviceText.forEach((line, idx) => {
      if (idx === 0) {
        doc.text(line, margin, yPosition);
      } else {
        doc.text(line, margin, yPosition);
      }
      if (idx < serviceText.length - 1) yPosition += 4;
    });

    // Reset Y for details column
    let tempY = yPosition - (serviceText.length > 0 ? 4 * (serviceText.length - 1) : 0);
    detailsText.forEach((line, idx) => {
      doc.text(line, margin + 60, tempY);
      tempY += 4;
    });

    // Amount (right-aligned)
    doc.text(`R${item.amount.toLocaleString()}`, pageWidth - margin - 5, yPosition, {
      align: 'right',
    });

    yPosition += maxLines * 4 + 3;

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
  });

  // Total section
  yPosition += 3;
  doc.setDrawColor(184, 115, 51);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(184, 115, 51);
  doc.text('Estimated Total', margin, yPosition);
  doc.text(`R${total.toLocaleString()}`, pageWidth - margin - 5, yPosition, {
    align: 'right',
  });
  yPosition += 10;

  // Footer disclaimer
  doc.setTextColor(100, 100, 100);
  doc.setFont('Inter', 'italic');
  doc.setFontSize(8);
  const disclaimerText = doc.splitTextToSize(
    'This is an automated estimate based on our published pricing. Final quotation will be confirmed after Creative Books SA reviews your files and specific requirements within 24 hours. Prices are subject to change based on detailed file review.',
    contentWidth
  );
  doc.text(disclaimerText, margin, pageHeight - 15);

  // Save PDF
  const filename = `estimate-${clientInfo.name.replace(/\s+/g, '-').toLowerCase()}-${today.getTime()}.pdf`;
  doc.save(filename);
}