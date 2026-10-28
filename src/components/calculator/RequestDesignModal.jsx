import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Palette, Loader2, Upload } from "lucide-react";
import { platform } from "@/api/platformClient";
import { toast } from "sonner";

export default function RequestDesignModal({ open, onClose, specs }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", bookTitle: "", notes: "" });
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.bookTitle) { toast.error("Please fill in name, email, and book title."); return; }
    setSending(true);
    try {
      let manuscriptUrl = "";
      if (file) {
        const uploaded = await platform.integrations.Core.UploadFile({ file });
        manuscriptUrl = uploaded.file_url;
      }

      await platform.entities.CoverDesignEnquiry.create({
        name: form.name, email: form.email, phone: form.phone, book_title: form.bookTitle,
        cover_notes: form.notes, manuscript_url: manuscriptUrl,
        full_cover_width: specs.fullWidth, full_cover_height: specs.fullHeight,
        spine_width: specs.spineWidth, trim_width: specs.trimWidth, trim_height: specs.trimHeight,
        page_count: specs.pageCount, paper_type: specs.paperLabel, binding_type: specs.bindingLabel,
        cover_type: specs.coverLabel, bleed: specs.bleed, safe_margin: specs.safeMargin,
        flap_sizes: specs.flapWidth > 0 ? `${specs.flapWidth} mm each` : "",
        hardcover_allowances: specs.wrap > 0 ? `Wrap: ${specs.wrap}mm, Hinge: ${specs.hinge}mm` : "",
        status: "new"
      });

      const specsTable = `Full Cover: ${specs.fullWidth}×${specs.fullHeight}mm | Spine: ${specs.spineWidth}mm | Trim: ${specs.trimWidth}×${specs.trimHeight}mm | Pages: ${specs.pageCount} | Paper: ${specs.paperLabel} | Binding: ${specs.bindingLabel} | Cover: ${specs.coverLabel} | Bleed: ${specs.bleed}mm | Safe: ${specs.safeMargin}mm`;

      await platform.integrations.Core.SendEmail({
        to: "info@creativebooks.co.za",
        subject: `New Cover Design Request: ${form.bookTitle}`,
        body: `<div style="font-family:system-ui,sans-serif;max-width:560px;">
  <div style="background:#f59e0b;padding:20px;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:20px;">New Design Enquiry</h1>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
    <p><strong>Name:</strong> ${form.name}<br/><strong>Email:</strong> ${form.email}<br/><strong>Phone:</strong> ${form.phone || "—"}<br/><strong>Book:</strong> ${form.bookTitle}</p>
    <p><strong>Notes:</strong> ${form.notes || "None"}</p>
    <p style="background:#f8fafc;padding:12px;border-radius:8px;font-size:13px;"><strong>Specs:</strong> ${specsTable}</p>
    ${manuscriptUrl ? `<p><strong>Manuscript:</strong> <a href="${manuscriptUrl}">Download</a></p>` : ""}
  </div>
</div>`
      });

      await platform.integrations.Core.SendEmail({
        to: form.email,
        subject: `Cover Design Request Received — ${form.bookTitle}`,
        body: `<div style="font-family:system-ui,sans-serif;max-width:560px;">
  <div style="background:#f59e0b;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">Creative Books SA</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:13px;opacity:0.9;">Book Cover Design &amp; Print</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="margin:0 0 12px;font-size:18px;color:#1e293b;">Thank you, ${form.name}!</h2>
    <p style="font-size:14px;color:#475569;">We've received your cover design request for <strong>${form.bookTitle}</strong>. Our team will review your specs and get back to you within 2–3 business days.</p>
    <div style="background:#f8fafc;padding:12px;border-radius:8px;margin:16px 0;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#475569;">Your Specs:</p>
      <p style="margin:0;font-size:12px;color:#64748b;">${specsTable}</p>
    </div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      <p style="margin:0 0 4px;"><strong style="color:#475569;">Creative Books SA</strong></p>
      <p style="margin:0;">creativebooks.co.za · info@creativebooks.co.za · 010 500 3331</p>
    </div>
  </div>
</div>`
      });

      toast.success("Design request submitted! Check your email for confirmation.");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-primary" />Design My Cover Using These Specs
          </DialogTitle>
        </DialogHeader>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs font-mono space-y-0.5">
          <p>Full Cover: {specs?.fullWidth} × {specs?.fullHeight} mm</p>
          <p>Spine: {specs?.spineWidth} mm | Bleed: {specs?.bleed} mm | Pages: {specs?.pageCount}</p>
          <p>{specs?.paperLabel} | {specs?.bindingLabel} | {specs?.coverLabel}</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Book Title *</Label>
              <Input value={form.bookTitle} onChange={(e) => setForm({ ...form, bookTitle: e.target.value })} className="h-11 bg-white/50 backdrop-blur-sm border-white/40" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cover Design Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/50 backdrop-blur-sm border-white/40 min-h-[80px]" placeholder="Describe your vision for the cover..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Upload Manuscript or Brief</Label>
            <label className="flex items-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Choose file..."}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
          <Button onClick={handleSubmit} disabled={sending} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Palette className="w-4 h-4 mr-2" />}
            {sending ? "Submitting..." : "Submit Design Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}