import React, { useEffect, useRef } from 'react';
import { Barcode } from 'lucide-react';
import { drawBarcode } from '@/lib/isbnUtils';

export default function BarcodePreview({ isbn13, displayISBN, size = 'standard', transparentBg = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';
    if (!isbn13) return;

    const canvas = drawBarcode(isbn13, displayISBN || isbn13, { size, dpi: 300, transparentBg });
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    container.appendChild(canvas);
  }, [isbn13, displayISBN, size, transparentBg]);

  if (!isbn13) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Barcode className="w-10 h-10 text-amber-900/20 mb-3" strokeWidth={1.2} />
        <p className="text-sm text-amber-900/40 font-body">Enter a valid ISBN to preview your barcode</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center py-4"
      style={transparentBg ? { backgroundImage: 'linear-gradient(45deg,#e8e0d4 25%,transparent 25%),linear-gradient(-45deg,#e8e0d4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e0d4 75%),linear-gradient(-45deg,transparent 75%,#e8e0d4 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0,0 8px,8px -8px,-8px 0', borderRadius: '8px' } : {}}
    />
  );
}