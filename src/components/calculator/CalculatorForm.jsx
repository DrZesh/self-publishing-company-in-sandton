import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { BOOK_SIZES, BINDING_TYPES, COVER_TYPES, COVER_BINDING_MATRIX, PAPER_CONFIG } from "@/lib/calculatorConfig";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, RotateCcw, AlertTriangle } from "lucide-react";

export default function CalculatorForm({ mode, formData, onChange, onDownloadPDF, onReset }) {
  const update = (key, value) => {
    const next = { ...formData, [key]: value };
    if (key === "coverType") {
      const allowed = COVER_BINDING_MATRIX[value] || [];
      if (!allowed.includes(formData.bindingType) && allowed.length > 0) next.bindingType = allowed[0];
    }
    onChange(next);
  };
  const isDesigner = mode === "designer";
  const allowedBindings = COVER_BINDING_MATRIX[formData.coverType] || Object.keys(BINDING_TYPES);
  const binding = BINDING_TYPES[formData.bindingType];
  const isCustomSize = formData.bookSize === "custom";
  const pageTooLow = binding && formData.pageCount < binding.minPages;
  const pageTooHigh = binding && formData.pageCount > binding.maxPages;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">1. Trim size</Label>
        <Select value={formData.bookSize} onValueChange={(v) => update("bookSize", v)}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(BOOK_SIZES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {isCustomSize && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Trim width (mm)</Label>
                <Input type="number" step="0.01" value={formData.customWidth} onChange={(e) => update("customWidth", Number(e.target.value))} className="h-9 text-sm border-gray-300 bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Trim height (mm)</Label>
                <Input type="number" step="0.01" value={formData.customHeight} onChange={(e) => update("customHeight", Number(e.target.value))} className="h-9 text-sm border-gray-300 bg-white" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">2. Interior paper type</Label>
        <Select value={formData.paperType} onValueChange={(v) => update("paperType", v)}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(PAPER_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">3. Page count</Label>
        <Input type="number" min={binding ? binding.minPages : 24} max={binding ? binding.maxPages : 800}
          value={formData.pageCount} onChange={(e) => update("pageCount", Number(e.target.value))}
          className={`h-9 text-sm bg-white ${pageTooLow ? "border-red-400 focus-visible:ring-red-400" : "border-gray-300"}`}
          placeholder="Number of pages at your formatted trim size" />
        {pageTooLow && (
          <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />Minimum {binding.minPages} pages for {binding.label}. Your count is too low.
          </p>
        )}
        {!pageTooLow && binding && (
          <p className="text-[11px] text-gray-400">
            {binding.label}: {binding.minPages}–{binding.maxPages} pages
            {binding.pageMultiple > 1 && ` · must be ÷ ${binding.pageMultiple}`}
          </p>
        )}
        {pageTooHigh && (
          <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />Maximum {binding.maxPages} pages for {binding.label}.
          </p>
        )}
        {formData.bindingType === "saddle" && formData.pageCount % 4 !== 0 && !pageTooLow && (
          <p className="text-[11px] text-amber-600 font-medium">Saddle stitch page count must be divisible by 4.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">4. Binding type</Label>
        <Select value={formData.bindingType} onValueChange={(v) => update("bindingType", v)}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(BINDING_TYPES).map(([k, v]) => <SelectItem key={k} value={k} disabled={!allowedBindings.includes(k)}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">5. Cover finish</Label>
        <Select value={formData.coverType} onValueChange={(v) => update("coverType", v)}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(COVER_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">6. Reading direction</Label>
        <Select value={formData.readingDirection} onValueChange={(v) => update("readingDirection", v)}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ltr">Left to Right</SelectItem>
            <SelectItem value="rtl">Right to Left</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-3 space-y-2">
        <Button className="w-full h-10 bg-[#ffc72c] hover:bg-[#e8b422] text-black font-semibold text-sm rounded">
          Calculate dimensions
        </Button>
        <Button variant="outline" className="w-full h-10 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm rounded" onClick={onDownloadPDF}>
          <FileDown className="w-4 h-4 mr-2" />Download Template
        </Button>
        <button type="button" onClick={onReset} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline py-1 flex items-center justify-center gap-1">
          <RotateCcw className="w-3 h-3" />Reset book information
        </button>
      </div>

      <Separator className="my-2" />
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-700">Bleed setting</Label>
        <Select value={String(formData.bleed)} onValueChange={(v) => update("bleed", Number(v))}>
          <SelectTrigger className="h-9 text-sm border-gray-300 bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3.175">0.125″ (3.175 mm) — Standard</SelectItem>
            <SelectItem value="5">5 mm — Extra safe</SelectItem>
            <SelectItem value="0">No bleed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {isDesigner && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
            <Separator />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced Print Settings</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Safe Margin (mm)</Label>
              <Input type="number" step="0.5" value={formData.safeMargin} onChange={(e) => update("safeMargin", Number(e.target.value))} className="h-9 text-sm border-gray-300 bg-white" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Switch checked={formData.customBleed != null} onCheckedChange={(v) => update("customBleed", v ? 3 : null)} className="scale-75" />
                <Label className="text-xs text-gray-500">Custom Bleed Override (mm)</Label>
              </div>
              {formData.customBleed != null && (
                <Input type="number" step="0.1" min="0" value={formData.customBleed} onChange={(e) => update("customBleed", Number(e.target.value))} className="h-9 text-sm border-gray-300 bg-white font-mono" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Switch checked={formData.useManualSpine} onCheckedChange={(v) => update("useManualSpine", v)} className="scale-75" />
                <Label className="text-xs text-gray-500">Manual Spine Override</Label>
              </div>
              {formData.useManualSpine && (
                <Input type="number" step="0.1" value={formData.manualSpine || ""} onChange={(e) => update("manualSpine", Number(e.target.value))} placeholder="Spine width in mm" className="h-9 text-sm border-gray-300 bg-white" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.showBarcode} onCheckedChange={(v) => update("showBarcode", v)} className="scale-75" />
              <Label className="text-xs text-gray-500">Show Barcode Guide</Label>
            </div>
            <AnimatePresence>
              {formData.coverType === "hardcover" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700">Hardcover Wraparound</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-gray-500">Wrap / Turn-in (mm)</Label>
                      <Input type="number" step="0.1" value={formData.wrap} onChange={(e) => update("wrap", Number(e.target.value))} className="h-8 text-sm border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-gray-500">Hinge (mm)</Label>
                      <Input type="number" step="0.1" value={formData.hinge} onChange={(e) => update("hinge", Number(e.target.value))} className="h-8 text-sm border-gray-300 bg-white" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {formData.coverType === "dustjacket" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Flap Width (mm)</Label>
                  <Input type="number" value={formData.customFlapWidth} onChange={(e) => update("customFlapWidth", Number(e.target.value))} className="h-9 text-sm border-gray-300 bg-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}