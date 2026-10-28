import { useState } from "react";
import { platform } from "@/api/platformClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { runPreflight } from "@/lib/preflight";
import { buildLayout } from "@/lib/coverLayout";
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const STATUS_STYLE = {
  pass: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  minor: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  fail: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

export default function CoverErrorChecker({ specs, specId, onCheckComplete }) {
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    if (!specs) return;
    setRunning(true);
    try {
      let fileUrl = "";
      if (file) {
        const { file_url } = await platform.integrations.Core.UploadFile({ file });
        fileUrl = file_url;
      }
      const layout = buildLayout(specs);
      const foldX = JSON.stringify((layout?.foldLines || []).map((f) => Math.round(f.x * 100) / 100));

      const res = await platform.functions.invoke("checkCoverErrors", {
        fileUrl,
        coverType: specs.coverType,
        fullWidth: specs.fullWidth,
        fullHeight: specs.fullHeight,
        bleed: specs.bleed,
        safe: specs.safeMargin,
        spine: specs.spineWidth,
        foldX,
        specId: specId || null,
      });

      const data = res?.data || {};
      const checks = (() => { try { return JSON.parse(data.checks || "[]"); } catch { return []; } })();
      const issues = (() => { try { return JSON.parse(data.issues || "[]"); } catch { return []; } })();
      const merged = { status: data.status || runPreflight(specs).status, summary: data.summary, checks, issues };
      setResult(merged);
      onCheckComplete?.(merged);
      toast.success("Preflight check complete");
    } catch (err) {
      // Fall back to local preflight if the server call fails.
      const local = runPreflight(specs);
      setResult(local);
      onCheckComplete?.(local);
      toast.message("Ran local preflight check");
    } finally {
      setRunning(false);
    }
  };

  const style = result ? STATUS_STYLE[result.status] || STATUS_STYLE.fail : null;
  const StatusIcon = style?.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
        <Button onClick={handleRun} disabled={running} variant="outline" className="shrink-0 gap-2 border-gray-300">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Preflight
        </Button>
      </div>

      {result && style && (
        <div className={`rounded-md border p-3 ${style.bg}`}>
          <div className={`flex items-center gap-2 font-medium text-sm ${style.color}`}>
            <StatusIcon className="w-4 h-4" />
            {result.summary}
          </div>
          {result.checks?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.checks.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  {c.ok ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}