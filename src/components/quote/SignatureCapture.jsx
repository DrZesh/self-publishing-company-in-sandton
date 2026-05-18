import React, { useState, useRef, useEffect } from 'react';
import { Signature, Type, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignatureCapture({ onSignatureComplete, signerEmail, signerName }) {
  const [method, setMethod] = useState(null); // 'drawn' or 'typed'
  const [signatureData, setSignatureData] = useState(null);
  const [typedName, setTypedName] = useState('');
  const [legalChecked, setLegalChecked] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1A1208';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [method]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
  };

  const saveTypedSignature = () => {
    if (typedName.trim()) {
      setSignatureData(typedName.trim());
    }
  };

  const handleSubmit = async () => {
    if (!signatureData || !legalChecked) return;
    onSignatureComplete({
      signature_image_url: signatureData,
      signature_method: method,
      signer_name: method === 'typed' ? typedName : signerName,
      signer_email: signerEmail,
      legal_acknowledgment_checked: legalChecked,
    });
  };

  if (!method) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#1A1208] mb-2">Sign Your Quote</h3>
          <p className="text-sm text-gray-500">Choose how you'd like to sign</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMethod('drawn')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#B87333] transition-colors flex flex-col items-center gap-3"
          >
            <Signature className="w-8 h-8 text-[#B87333]" />
            <span className="font-medium">Draw Signature</span>
          </button>
          <button
            onClick={() => setMethod('typed')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#B87333] transition-colors flex flex-col items-center gap-3"
          >
            <Type className="w-8 h-8 text-[#B87333]" />
            <span className="font-medium">Type Name</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A1208]">
          {method === 'drawn' ? 'Draw Your Signature' : 'Type Your Name'}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setMethod(null)}>
          Change Method
        </Button>
      </div>

      {method === 'drawn' ? (
        <div className="space-y-3">
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
            <Button onClick={saveDrawnSignature} disabled={!signatureData}>
              Use This Signature
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label>Type your full name</Label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter your name as you want it to appear"
              className="mt-1"
            />
          </div>
          <Button onClick={saveTypedSignature} disabled={!typedName.trim()}>
            Use This Signature
          </Button>
        </div>
      )}

      {signatureData && (
        <div className="border-t pt-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Your Signature:</div>
            {typeof signatureData === 'string' && signatureData.startsWith('data:') ? (
              <img src={signatureData} alt="Signature" className="h-16 bg-white border rounded px-4 py-2" />
            ) : (
              <div className="text-2xl font-script text-[#1A1208] bg-white border rounded px-4 py-3 inline-block">
                {signatureData}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="legal"
              checked={legalChecked}
              onCheckedChange={setLegalChecked}
            />
            <label htmlFor="legal" className="text-sm text-gray-600 leading-tight">
              I acknowledge that this electronic signature is legally binding and I agree to the terms and conditions of this quote.
            </label>
          </div>

          <Button onClick={handleSubmit} disabled={!legalChecked} className="w-full">
            <Check className="w-4 h-4 mr-2" /> Complete Signature
          </Button>
        </div>
      )}
    </div>
  );
}