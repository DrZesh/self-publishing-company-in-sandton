import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { platform } from "@/api/platformClient";
import { toast } from "sonner";
import { generateCoverPDFFromSpecs } from "@/lib/generateCoverPDF";

export default function SaveSpecsModal({ open, onClose, specs }) {
  const [form, setForm] = useState({ name: "", email: "", bookTitle: "" });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.email || !form.name) { toast.error("Please fill in your name and email."); return; }
    setSending(true);
    try {
      const pdfBlob = await generateCoverPDFFromSpecs(specs);
      const pdfFile = new File([pdfBlob], `creativebooks-cover-template-${specs.fullWidth}x${specs.fullHeight}mm.pdf`, { type: "application/pdf" });
      const uploaded = await platform.integrations.Core.UploadFile({ file: pdfFile });
      const pdfLink = uploaded.file_url;

      const body = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
  <div style="background:#f59e0b;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">Creative Books SA</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:13px;opacity:0.9;">Book Cover Design &amp; Print</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 8px;font-size:18px;color:#1e293b;">Your Cover Specifications</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;">Hi ${form.name}, here are your specs for <strong>${form.bookTitle || "your book"}</strong>:</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#0369a1;">📄 Print-Ready PDF Template Attached</p>
      <a href="${pdfLink}" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Download PDF Template</a>
      <p style="margin:6px 0 0;font-size:11px;color:#64748b;">${specs.fullWidth} × ${specs.fullHeight} mm — ready for your printer or designer</p>
    </div>
    <table style="border-collapse:collapse;font-family:monospace;font-size:14px;width:100%;">
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Full Cover Size</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${specs.fullWidth} × ${specs.fullHeight} mm</td></tr>
    <tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Spine Width</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.spineWidth} mm</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Front Cover</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.frontCoverWidth} × ${specs.trimHeight} mm</td></tr>
    <tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Back Cover</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.backCoverWidth} × ${specs.trimHeight} mm</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Bleed</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.bleed} mm</td></tr>
    <tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Safe Margin</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.safeMargin} mm</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Paper Type</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.paperLabel}</td></tr>
    <tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Binding</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.bindingLabel}</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">Cover Type</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${specs.coverLabel}</td></tr>
    <tr><td style="padding:6px 12px;">Page Count</td><td style="padding:6px 12px;">${specs.pageCount}</td></tr>
    </table>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      <p style="margin:0 0 4px;"><strong style="color:#475569;">Creative Books SA</strong></p>
      <p style="margin:0;">creativebooks.co.za · info@creativebooks.co.za · 010 500 3331</p>
    </div>
  </div>
</div>
      `.trim();

      await platform.integrations.Core.SendEmail({
        to: form.email,
        subject: `Your Cover Specs for ${form.bookTitle || "Your Book"} — Creative Books SA`,
        body
      });

      toast.success("Specs and PDF template sent to your email!");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-primary" />Save My Specs
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Your Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Email Address</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Book Title</Label>
            <Input value={form.bookTitle} onChange={(e) => setForm({ ...form, bookTitle: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" placeholder="My Book Title" />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full h-11 bg-primary hover:bg-primary/90">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            {sending ? "Sending..." : "Email My Specs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}