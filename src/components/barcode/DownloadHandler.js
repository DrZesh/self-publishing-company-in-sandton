import { jsPDF } from 'jspdf';
import { drawBarcode, generateSVG, generateEPS, generateFilename } from '@/lib/isbnUtils';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateBlob(isbn13, displayISBN, format, options = {}) {
  const fmt = format.toUpperCase();

  if (fmt === 'SVG') {
    const svg = generateSVG(isbn13, displayISBN, options);
    return { blob: new Blob([svg], { type: 'image/svg+xml' }), ext: 'svg' };
  }

  if (fmt === 'EPS') {
    const eps = generateEPS(isbn13, displayISBN, options);
    return { blob: new Blob([eps], { type: 'application/postscript' }), ext: 'eps' };
  }

  const canvas = drawBarcode(isbn13, displayISBN, options);

  if (fmt === 'PDF') {
    const imgData = canvas.toDataURL('image/png');
    const pxToMm = 25.4 / (options.dpi || 300);
    const wMm = canvas.width * pxToMm;
    const hMm = canvas.height * pxToMm;
    const pdf = new jsPDF({ orientation: wMm > hMm ? 'landscape' : 'portrait', unit: 'mm', format: [wMm, hMm] });
    pdf.addImage(imgData, 'PNG', 0, 0, wMm, hMm);
    return { blob: pdf.output('blob'), ext: 'pdf' };
  }

  const mime = fmt === 'JPG' ? 'image/jpeg' : fmt === 'WEBP' ? 'image/webp' : 'image/png';
  const ext = fmt === 'JPG' ? 'jpg' : fmt === 'WEBP' ? 'webp' : 'png';
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const byteString = atob(dataUrl.split(',')[1]);
  const arr = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
  return { blob: new Blob([arr], { type: mime }), ext };
}

export function downloadBarcode(isbn13, displayISBN, format, options = {}) {
  const { blob, ext } = generateBlob(isbn13, displayISBN, format, options);
  triggerDownload(blob, generateFilename(isbn13, ext));
}