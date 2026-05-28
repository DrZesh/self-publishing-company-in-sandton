import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, PenTool, Type } from 'lucide-react';

const TYPED_FONTS = [
  { name: 'Signature', style: "font-family: 'Dancing Script', cursive; font-size: 36px;" },
  { name: 'Script', style: "font-family: 'Pacifico', cursive; font-size: 30px;" },
  { name: 'Print', style: "font-family: Georgia, serif; font-size: 28px; font-weight: bold;" },
];

export default function SignatureCanvas({ onChange, label = 'Signature' }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('draw'); // 'draw' | 'type'
  const [typedText, setTypedText] = useState('');
  const [typedFont, setTypedFont] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasDrawing(true);
  };

  const stopDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    emitChange();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    onChange(null);
  };

  const emitChange = () => {
    const canvas = canvasRef.current;
    if (!hasDrawing && mode === 'draw') { onChange(null); return; }
    onChange({ dataUrl: canvas.toDataURL('image/png'), method: 'drawn' });
  };

  // Render typed signature to canvas for export
  const renderTyped = () => {
    if (!typedText.trim()) { onChange(null); return; }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const font = TYPED_FONTS[typedFont];
    ctx.font = font.style.match(/font-size:\s*(\d+)px/)?.[1]
      ? `${font.style.includes('bold') ? 'bold ' : ''}${font.style.match(/font-size:\s*(\d+)px/)[1]}px ${font.style.match(/font-family:\s*([^;]+)/)?.[1]?.trim() || 'serif'}`
      : '32px serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText, 20, canvas.height / 2);
    onChange({ dataUrl: canvas.toDataURL('image/png'), method: 'typed' });
  };

  useEffect(() => {
    if (mode === 'type') renderTyped();
  }, [typedText, typedFont, mode]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setMode('draw')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'draw' ? 'bg-[#B87333] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <PenTool className="w-3 h-3" /> Draw
          </button>
          <button onClick={() => setMode('type')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'type' ? 'bg-[#B87333] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <Type className="w-3 h-3" /> Type
          </button>
        </div>
      </div>

      {mode === 'type' && (
        <div className="space-y-2">
          <input
            type="text"
            value={typedText}
            onChange={e => setTypedText(e.target.value)}
            placeholder="Type your full name..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            {TYPED_FONTS.map((f, i) => (
              <button key={i} onClick={() => setTypedFont(i)} className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${typedFont === i ? 'border-[#B87333] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                style={{ fontFamily: f.style.match(/font-family:\s*([^;]+)/)?.[1]?.trim() || 'serif' }}>
                {typedText || 'Signature'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full cursor-crosshair"
          onMouseDown={mode === 'draw' ? startDraw : undefined}
          onMouseMove={mode === 'draw' ? draw : undefined}
          onMouseUp={mode === 'draw' ? stopDraw : undefined}
          onMouseLeave={mode === 'draw' ? stopDraw : undefined}
          onTouchStart={mode === 'draw' ? startDraw : undefined}
          onTouchMove={mode === 'draw' ? draw : undefined}
          onTouchEnd={mode === 'draw' ? stopDraw : undefined}
        />
        {mode === 'draw' && !hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Draw your signature here</p>
          </div>
        )}
        <div className="absolute bottom-1 right-2">
          <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}