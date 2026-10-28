// ISBN validation and EAN-13 barcode encoding utilities

export function sanitizeISBN(input) {
  return input.replace(/[\s-]/g, '').trim().toUpperCase();
}

export function isValidISBN10(isbn) {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  const last = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
  sum += last;
  return sum % 11 === 0;
}

export function isValidISBN13(isbn) {
  if (!/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(isbn[12]);
}

export function calculateISBN13CheckDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return ((10 - (sum % 10)) % 10).toString();
}

export function isbn10to13(isbn10) {
  const first12 = '978' + isbn10.substring(0, 9);
  const checkDigit = calculateISBN13CheckDigit(first12);
  return first12 + checkDigit;
}

export function processISBN(rawInput) {
  const clean = sanitizeISBN(rawInput);

  if (!clean) {
    return { valid: false, isbn13: null, displayISBN: null, message: 'Enter an ISBN number.' };
  }

  if (clean.length === 10) {
    if (isValidISBN10(clean)) {
      const isbn13 = isbn10to13(clean);
      return {
        valid: true,
        isbn13,
        displayISBN: rawInput.trim(),
        message: `Barcode ready.`
      };
    }
    if (/^\d{9}/.test(clean)) {
      return { valid: false, isbn13: null, displayISBN: null, message: 'Invalid ISBN-10 checksum.' };
    }
    return { valid: false, isbn13: null, displayISBN: null, message: 'Invalid ISBN.' };
  }

  if (clean.length === 13) {
    if (!/^\d{13}$/.test(clean)) {
      return { valid: false, isbn13: null, displayISBN: null, message: 'Invalid ISBN.' };
    }

    if (isValidISBN13(clean)) {
      return {
        valid: true,
        isbn13: clean,
        displayISBN: rawInput.trim(),
        message: 'Barcode ready.'
      };
    }

    const first12 = clean.substring(0, 12);
    const correctCheck = calculateISBN13CheckDigit(first12);
    const corrected = first12 + correctCheck;
    return {
      valid: true,
      isbn13: corrected,
      displayISBN: rawInput.trim(),
      message: `Corrected to ${corrected}.`
    };
  }

  return { valid: false, isbn13: null, displayISBN: null, message: 'Invalid ISBN.' };
}

const L_PATTERNS = [
  [0,0,0,1,1,0,1],[0,0,1,1,0,0,1],[0,0,1,0,0,1,1],[0,1,1,1,1,0,1],
  [0,1,0,0,0,1,1],[0,1,1,0,0,0,1],[0,1,0,1,1,1,1],[0,1,1,1,0,1,1],
  [0,1,1,0,1,1,1],[0,0,0,1,0,1,1],
];

const G_PATTERNS = [
  [0,1,0,0,1,1,1],[0,1,1,0,0,1,1],[0,0,1,1,0,1,1],[0,1,0,0,0,0,1],
  [0,0,1,1,1,0,1],[0,1,1,1,0,0,1],[0,0,0,0,1,0,1],[0,0,1,0,0,0,1],
  [0,0,0,1,0,0,1],[0,1,0,0,1,0,1],
];

const R_PATTERNS = [
  [1,1,1,0,0,1,0],[1,1,0,0,1,1,0],[1,1,0,1,1,0,0],[1,0,0,0,0,1,0],
  [1,0,1,1,1,0,0],[1,0,0,1,1,0,0],[1,0,1,0,0,0,0],[1,0,0,0,1,0,0],
  [1,0,0,1,0,0,0],[1,1,1,0,1,0,0],
];

const FIRST_DIGIT_PARITY = [
  'LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG',
  'LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL',
];

export function encodeEAN13(isbn13) {
  const digits = isbn13.split('').map(Number);
  const firstDigit = digits[0];
  const parity = FIRST_DIGIT_PARITY[firstDigit];

  const bars = [];
  bars.push({ v: 1, guard: true });
  bars.push({ v: 0, guard: true });
  bars.push({ v: 1, guard: true });

  for (let i = 0; i < 6; i++) {
    const digit = digits[i + 1];
    const pattern = parity[i] === 'L' ? L_PATTERNS[digit] : G_PATTERNS[digit];
    for (const bit of pattern) {
      bars.push({ v: bit, guard: false });
    }
  }

  bars.push({ v: 0, guard: true });
  bars.push({ v: 1, guard: true });
  bars.push({ v: 0, guard: true });
  bars.push({ v: 1, guard: true });
  bars.push({ v: 0, guard: true });

  for (let i = 0; i < 6; i++) {
    const digit = digits[i + 7];
    const pattern = R_PATTERNS[digit];
    for (const bit of pattern) {
      bars.push({ v: bit, guard: false });
    }
  }

  bars.push({ v: 1, guard: true });
  bars.push({ v: 0, guard: true });
  bars.push({ v: 1, guard: true });

  return bars;
}

export function drawBarcode(isbn13, displayISBN, options = {}) {
  const { size = 'standard', dpi = 300, transparentBg = false } = options;

  const scaleMap = { small: 0.7, standard: 1.0, large: 1.5 };
  const scale = scaleMap[size] || 1.0;
  const dpiScale = dpi / 300;
  const totalScale = scale * dpiScale;

  const barWidth = Math.max(1, Math.round(2 * totalScale));
  const barHeight = 90 * totalScale;
  const guardExtraHeight = 12 * totalScale;
  const quietZone = 14 * totalScale;
  const topTextHeight = 16 * totalScale;
  const bottomTextHeight = 16 * totalScale;
  const textGap = 4 * totalScale;
  const firstDigitOffset = 14 * totalScale;

  const bars = encodeEAN13(isbn13);
  const totalBars = bars.length;

  const barcodeWidth = totalBars * barWidth;
  const canvasWidth = barcodeWidth + quietZone * 2 + firstDigitOffset;
  const canvasHeight = quietZone * 0.5 + topTextHeight + textGap + barHeight + guardExtraHeight + textGap + bottomTextHeight + quietZone * 0.5;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(canvasWidth);
  canvas.height = Math.ceil(canvasHeight);
  const ctx = canvas.getContext('2d');

  if (!transparentBg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const startX = quietZone + firstDigitOffset;
  const topTextY = quietZone * 0.5;
  const startY = topTextY + topTextHeight + textGap;

  const topFontSize = Math.max(10, 12 * totalScale);
  ctx.font = `${topFontSize}px 'Inter', 'Arial', sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const topText = `ISBN ${displayISBN}`;
  const baseTopWidth = ctx.measureText(topText).width;
  const targetTopWidth = barcodeWidth;

  if (baseTopWidth < targetTopWidth && topText.length > 1) {
    const extraSpace = (targetTopWidth - baseTopWidth) / (topText.length - 1);
    let tx = startX;
    for (const ch of topText) {
      ctx.fillText(ch, tx, topTextY);
      tx += ctx.measureText(ch).width + extraSpace;
    }
  } else {
    ctx.fillText(topText, startX, topTextY);
  }

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    if (bar.v === 1) {
      const x = startX + i * barWidth;
      const h = bar.guard ? barHeight + guardExtraHeight : barHeight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, startY, barWidth, h);
    }
  }

  const digits = isbn13.split('');
  const bottomFontSize = Math.max(9, 11 * totalScale);
  ctx.font = `${bottomFontSize}px 'Inter', 'Arial', sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  const bottomY = startY + barHeight + guardExtraHeight + textGap * 0.5;

  ctx.textAlign = 'right';
  ctx.fillText(digits[0], startX - barWidth * 1, bottomY);

  ctx.textAlign = 'center';
  const leftGroupStart = startX + 3 * barWidth;
  for (let i = 0; i < 6; i++) {
    const digitCenterX = leftGroupStart + (i * 7 + 3.5) * barWidth;
    ctx.fillText(digits[i + 1], digitCenterX, bottomY);
  }

  const rightGroupStart = startX + 3 * barWidth + 42 * barWidth + 5 * barWidth;
  for (let i = 0; i < 6; i++) {
    const digitCenterX = rightGroupStart + (i * 7 + 3.5) * barWidth;
    ctx.fillText(digits[i + 7], digitCenterX, bottomY);
  }

  return canvas;
}

export function generateSVG(isbn13, displayISBN, options = {}) {
  const { size = 'standard' } = options;
  const scaleMap = { small: 0.7, standard: 1.0, large: 1.5 };
  const scale = scaleMap[size] || 1.0;

  const barWidth = 2 * scale;
  const barHeight = 90 * scale;
  const guardExtra = 12 * scale;
  const quietZone = 14 * scale;
  const topTextH = 16 * scale;
  const textGap = 4 * scale;
  const bottomTextH = 16 * scale;
  const firstDigitOff = 14 * scale;

  const bars = encodeEAN13(isbn13);
  const barcodeWidth = bars.length * barWidth;
  const w = barcodeWidth + quietZone * 2 + firstDigitOff;
  const h = quietZone * 0.5 + topTextH + textGap + barHeight + guardExtra + textGap + bottomTextH + quietZone * 0.5;

  const startX = quietZone + firstDigitOff;
  const topTextY = quietZone * 0.5;
  const startY = topTextY + topTextH + textGap;
  const bottomY = startY + barHeight + guardExtra + textGap * 0.5;

  const topFS = Math.max(8, 10 * scale);
  const bottomFS = Math.max(7, 9 * scale);
  const digits = isbn13.split('');

  let rects = '';
  for (let i = 0; i < bars.length; i++) {
    if (bars[i].v === 1) {
      const x = startX + i * barWidth;
      const bh = bars[i].guard ? barHeight + guardExtra : barHeight;
      rects += `<rect x="${x}" y="${startY}" width="${barWidth}" height="${bh}" fill="#000"/>`;
    }
  }

  const topText = `ISBN ${displayISBN}`;
  const avgCharW = topFS * 0.6;
  const baseW = topText.length * avgCharW;
  const spacing = baseW < barcodeWidth ? ((barcodeWidth - baseW) / (topText.length - 1)) : 0;
  let topTextSVG = '';
  let tx = startX;
  for (const ch of topText) {
    topTextSVG += `<text x="${tx}" y="${topTextY}" font-family="Inter, Arial, sans-serif" font-size="${topFS}" fill="#000" dominant-baseline="hanging">${ch === '&' ? '&amp;' : ch}</text>`;
    tx += avgCharW + spacing;
  }

  let bottomSVG = '';
  bottomSVG += `<text x="${startX - barWidth}" y="${bottomY}" font-family="Inter, Arial, sans-serif" font-size="${bottomFS}" fill="#000" text-anchor="end" dominant-baseline="hanging">${digits[0]}</text>`;

  const leftStart = startX + 3 * barWidth;
  for (let i = 0; i < 6; i++) {
    const cx = leftStart + (i * 7 + 3.5) * barWidth;
    bottomSVG += `<text x="${cx}" y="${bottomY}" font-family="Inter, Arial, sans-serif" font-size="${bottomFS}" fill="#000" text-anchor="middle" dominant-baseline="hanging">${digits[i + 1]}</text>`;
  }

  const rightStart = startX + 3 * barWidth + 42 * barWidth + 5 * barWidth;
  for (let i = 0; i < 6; i++) {
    const cx = rightStart + (i * 7 + 3.5) * barWidth;
    bottomSVG += `<text x="${cx}" y="${bottomY}" font-family="Inter, Arial, sans-serif" font-size="${bottomFS}" fill="#000" text-anchor="middle" dominant-baseline="hanging">${digits[i + 7]}</text>`;
  }

  const bgRect = options.transparentBg ? '' : `<rect width="${w}" height="${h}" fill="#fff"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${bgRect}
${topTextSVG}
${rects}
${bottomSVG}
</svg>`;
}

export function generateFilename(isbn13, ext) {
  const now = new Date();
  const ts = now.toISOString().replace(/:/g, '-').split('.')[0];
  return `creativebooks-isbn-${isbn13}-${ts}.${ext}`;
}

export function generateEPS(isbn13, displayISBN, options = {}) {
  const { size = 'standard' } = options;
  const scaleMap = { small: 0.7, standard: 1.0, large: 1.5 };
  const scale = scaleMap[size] || 1.0;

  const barWidth = 1.5 * scale;
  const barHeight = 65 * scale;
  const guardExtra = 8 * scale;
  const quietZone = 15 * scale;
  const firstDigitOff = 10 * scale;

  const bars = encodeEAN13(isbn13);
  const barcodeWidth = bars.length * barWidth;
  const w = barcodeWidth + quietZone * 2 + firstDigitOff;
  const h = barHeight + guardExtra + quietZone * 3 + 20 * scale;

  const startX = quietZone + firstDigitOff;
  const startY = quietZone + 12 * scale;

  let epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${Math.ceil(w)} ${Math.ceil(h)}
%%Title: ISBN Barcode ${isbn13}
%%Creator: CreativeBooks ISBN Barcode Generator
%%EndComments

`;

  if (!options.transparentBg) {
    epsContent += `1 1 1 setrgbcolor\n0 0 ${w} ${h} rectfill\n`;
  }

  epsContent += `0 0 0 setrgbcolor\n`;

  for (let i = 0; i < bars.length; i++) {
    if (bars[i].v === 1) {
      const x = startX + i * barWidth;
      const bh = bars[i].guard ? barHeight + guardExtra : barHeight;
      const y = h - startY - bh;
      epsContent += `${x} ${y} ${barWidth} ${bh} rectfill\n`;
    }
  }

  const topFS = Math.max(7, 8 * scale);
  epsContent += `/Helvetica findfont ${topFS} scalefont setfont\n`;
  epsContent += `${startX} ${h - quietZone * 0.6 - topFS * 0.3} moveto (ISBN ${displayISBN}) show\n`;

  const bottomFS = Math.max(6, 7 * scale);
  epsContent += `/Helvetica findfont ${bottomFS} scalefont setfont\n`;
  const bottomY = h - startY - barHeight - guardExtra - bottomFS - 2 * scale;

  const digits = isbn13.split('');
  epsContent += `${startX - barWidth * 2} ${bottomY} moveto (${digits[0]}) show\n`;

  const leftStart = startX + 3 * barWidth;
  for (let i = 0; i < 6; i++) {
    const cx = leftStart + (i * 7 + 3) * barWidth;
    epsContent += `${cx} ${bottomY} moveto (${digits[i + 1]}) show\n`;
  }

  const rightStart = startX + 3 * barWidth + 42 * barWidth + 5 * barWidth;
  for (let i = 0; i < 6; i++) {
    const cx = rightStart + (i * 7 + 3) * barWidth;
    epsContent += `${cx} ${bottomY} moveto (${digits[i + 7]}) show\n`;
  }

  epsContent += `showpage\n%%EOF\n`;
  return epsContent;
}