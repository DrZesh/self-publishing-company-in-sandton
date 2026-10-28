import { useState, useMemo, useEffect } from "react";
import { calculateSpecs, DEFAULT_SETTINGS } from "@/lib/calculatorConfig";
import { toast } from "sonner";
import ModeToggle from "@/components/calculator/ModeToggle";
import UnitToggle from "@/components/calculator/UnitToggle";
import CalculatorForm from "@/components/calculator/CalculatorForm";
import CoverWireframe from "@/components/calculator/CoverWireframe";
import DimensionsTable from "@/components/calculator/DimensionsTable";
import SaveSpecsModal from "@/components/calculator/SaveSpecsModal";
import RequestDesignModal from "@/components/calculator/RequestDesignModal";
import CreativeBooksLogo from "@/components/calculator/CreativeBooksLogo";
import CreativeBooksFooter from "@/components/calculator/CreativeBooksFooter";
import CoverErrorChecker from "@/components/calculator/CoverErrorChecker";
import { generateCoverPDFFromSpecs } from "@/lib/generateCoverPDF";
import { buildCoverSpec, saveCoverSpec } from "@/lib/coverSpec";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import PageMeta from "@/components/shared/PageMeta";

const INITIAL_FORM = {
  coverType: "paperback", bookSize: "6x9", pageCount: 200, paperType: "cream_78",
  bindingType: "perfect", bleed: DEFAULT_SETTINGS.bleed, safeMargin: DEFAULT_SETTINGS.safeMargin,
  customBleed: null, customWidth: 152.4, customHeight: 228.6, customSpineFactor: null,
  useManualSpine: false, manualSpine: null, showBarcode: true,
  customFlapWidth: DEFAULT_SETTINGS.defaultFlapWidth, wrap: DEFAULT_SETTINGS.wrap,
  hinge: DEFAULT_SETTINGS.hinge, readingDirection: "ltr"
};

export default function Calculator() {
  const [mode, setMode] = useState("author");
  const [unit, setUnit] = useState("mm");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [preflightResult, setPreflightResult] = useState(null);
  const [savedSpec, setSavedSpec] = useState(null);

  const specs = useMemo(() => {
    if (!formData.pageCount || formData.pageCount < 1) return null;
    return calculateSpecs({
      bookSize: formData.bookSize, pageCount: formData.pageCount, paperType: formData.paperType,
      bindingType: formData.bindingType, coverType: formData.coverType, bleed: formData.bleed,
      safeMargin: formData.safeMargin, customBleed: formData.customBleed, customWidth: formData.customWidth,
      customHeight: formData.customHeight,
      customSpineFactor: formData.paperType === "custom" ? formData.customSpineFactor : null,
      manualSpine: formData.useManualSpine ? formData.manualSpine : null,
      customFlapWidth: formData.customFlapWidth, wrap: formData.wrap, hinge: formData.hinge,
      readingDirection: formData.readingDirection
    });
  }, [formData]);

  useEffect(() => {
    if (!formData.pageCount || formData.pageCount < 1) { setSavedSpec(null); return; }
    const { coverSpec } = buildCoverSpec(formData);
    saveCoverSpec(coverSpec)
      .then(saved => setSavedSpec({ specId: saved.specId, checksum: saved.checksum, id: saved.id }))
      .catch(() => setSavedSpec(null));
  }, [formData]);

  const handleReset = () => setFormData(INITIAL_FORM);

  const handleDownloadPDF = async () => {
    if (!specs) { toast.error("Enter your book details first"); return; }
    toast.info("Generating PDF template...", { duration: 1500 });
    const blob = await generateCoverPDFFromSpecs(specs, savedSpec?.specId, savedSpec?.checksum);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `creativebooks-cover-template-${specs.fullWidth}x${specs.fullHeight}mm.pdf`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(savedSpec ? `PDF downloaded — Spec ID: ${savedSpec.specId}` : "PDF template downloaded!");
  };

  const handleDownloadCorrectedPDF = async () => {
    if (!specs || !preflightResult) { toast.error("Run preflight check first"); return; }
    toast.info("Generating corrected PDF...", { duration: 1500 });
    const blob = await generateCoverPDFFromSpecs(specs, savedSpec?.specId, savedSpec?.checksum);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `creativebooks-cover-corrected-${specs.fullWidth}x${specs.fullHeight}mm.pdf`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Corrected PDF downloaded!");
  };

  const handlePreflightComplete = (result) => setPreflightResult(result);

  return (
    <div className="min-h-screen font-body bg-[#f8f9fa]">
      <PageMeta
        title="Book Cover Calculator"
        description="To find out the exact dimensions of your cover, use the calculator. You can also download a template (PDF and PNG) to be used as a guide layer in your image"
        canonical="https://creativebooks.co.za/covercalculator"
      />
      <div className="pt-16 bg-gradient-to-r from-[#1a365d] to-[#0f2440]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">Book Cover Calculator</h1>
          <p className="mt-2 text-sm text-white/70 max-w-2xl mx-auto">
            Find the exact dimensions of your cover, then download a print-ready template (PDF &amp; PNG) to use as a guide layer in your design.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CreativeBooksLogo size="sm" />
            <div className="flex items-center gap-3">
              <UnitToggle unit={unit} onChange={setUnit} />
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Enter Your Book Information</h2>
              </div>
              <div className="p-5">
                <CalculatorForm mode={mode} formData={formData} onChange={setFormData}
                  onDownloadPDF={handleDownloadPDF} onReset={handleReset} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={() => specs && setShowSaveModal(true)} disabled={!specs}
                className="w-full text-left text-xs text-gray-500 hover:text-gray-700 border border-gray-200 bg-white rounded px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                Email My Specs to Myself
              </button>
              <button onClick={() => specs && setShowDesignModal(true)} disabled={!specs}
                className="w-full text-left text-xs text-white bg-gray-800 hover:bg-gray-900 rounded px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                Request a Cover Design &rarr;
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            {specs ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-800">Cover Dimensions &amp; Template</h2>
                  {savedSpec?.specId && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                      {savedSpec.specId}
                    </span>
                  )}
                </div>
                <div className="p-4 pb-1">
                  <DimensionsTable specs={specs} unit={unit} />
                </div>
                <div className="border-t border-gray-100" />
                <div className="px-3 pb-3 pt-1">
                  <CoverWireframe specs={specs} mode={mode} showBarcode={formData.showBarcode} />
                </div>
                <div className="border-t border-gray-100" />
                <div className="px-5 py-4 space-y-3">
                  <CoverErrorChecker specs={specs} specId={savedSpec?.specId} onCheckComplete={handlePreflightComplete} />
                  {preflightResult && (
                    <Button onClick={handleDownloadCorrectedPDF}
                      className="w-full h-10 bg-[#1a365d] hover:bg-[#0f2440] text-white text-sm gap-2">
                      <Download className="w-4 h-4" />
                      Download Corrected Cover PDF
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex items-center justify-center">
                <p className="text-sm text-gray-400">Enter your book details and click "Calculate dimensions" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveSpecsModal open={showSaveModal} onClose={() => setShowSaveModal(false)} specs={specs} />
      {specs && <RequestDesignModal open={showDesignModal} onClose={() => setShowDesignModal(false)} specs={specs} />}
      <CreativeBooksFooter />
    </div>
  );
}