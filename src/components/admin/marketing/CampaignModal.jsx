import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CAMPAIGN_TYPES = ['Newsletter', 'Promotion', 'Follow-up', 'Drip', 'Announcement', 'Re-engagement'];
const LIFECYCLE_STAGES = ['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'];

export default function CampaignModal({ campaign, onClose, onSaved }) {
  const isNew = !campaign?.id;
  const [form, setForm] = useState({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    preview_text: campaign?.preview_text || '',
    campaign_type: campaign?.campaign_type || 'Newsletter',
    body_html: campaign?.body_html || '',
    from_name: campaign?.from_name || '',
    from_email: campaign?.from_email || '',
    audience_filter: campaign?.audience_filter || { exclude_unsubscribed: true, lifecycle_stages: [] },
  });
  const [saving, setSaving] = useState(false);
  const [audienceCount, setAudienceCount] = useState(null);
  const [loadingAudience, setLoadingAudience] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkAudience = async () => {
    setLoadingAudience(true);
    const res = await platform.functions.invoke('campaignActions', { action: 'get_audience', audience_filter: form.audience_filter });
    setLoadingAudience(false);
    if (res.data?.success) setAudienceCount(res.data.count);
  };

  const handleSave = async () => {
    if (!form.name || !form.subject) { toast.error('Name and subject are required'); return; }
    setSaving(true);
    if (isNew) {
      await platform.entities.EmailCampaign.create(form);
    } else {
      await platform.entities.EmailCampaign.update(campaign.id, form);
    }
    setSaving(false);
    toast.success(isNew ? 'Campaign created' : 'Campaign saved');
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'New Campaign' : 'Edit Campaign'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Campaign Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. June Newsletter" />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.campaign_type} onValueChange={v => set('campaign_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CAMPAIGN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Subject Line *</Label>
            <Input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Your email subject..." />
          </div>

          <div className="space-y-1">
            <Label>Preview Text</Label>
            <Input value={form.preview_text} onChange={e => set('preview_text', e.target.value)} placeholder="Short text shown in inbox preview..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>From Name</Label>
              <Input value={form.from_name} onChange={e => set('from_name', e.target.value)} placeholder="Creative Books SA" />
            </div>
            <div className="space-y-1">
              <Label>From Email</Label>
              <Input value={form.from_email} onChange={e => set('from_email', e.target.value)} placeholder="info@creativebooks.co.za" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Email Body (HTML supported)</Label>
            <Textarea
              value={form.body_html}
              onChange={e => set('body_html', e.target.value)}
              rows={8}
              placeholder="Write your email content here. Use {{name}} to personalise."
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-400">Tip: Use <code>{'{{name}}'}</code> to personalise with the contact's name.</p>
          </div>

          <div className="space-y-2 bg-gray-50 rounded-xl p-4">
            <Label className="text-sm font-semibold">Audience Filter</Label>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Lifecycle Stages (leave empty for all)</Label>
              <div className="flex flex-wrap gap-2">
                {LIFECYCLE_STAGES.map(s => {
                  const active = form.audience_filter?.lifecycle_stages?.includes(s);
                  return (
                    <button key={s} type="button"
                      onClick={() => {
                        const cur = form.audience_filter?.lifecycle_stages || [];
                        set('audience_filter', {
                          ...form.audience_filter,
                          lifecycle_stages: active ? cur.filter(x => x !== s) : [...cur, s],
                        });
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-[#B87333] text-white border-[#B87333]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      {s.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Button variant="outline" size="sm" onClick={checkAudience} disabled={loadingAudience}>
                {loadingAudience ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Preview Audience
              </Button>
              {audienceCount !== null && (
                <span className="text-sm text-gray-600">
                  <strong className="text-[#B87333]">{audienceCount}</strong> contacts will receive this campaign
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#B87333] hover:bg-[#9a6128] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isNew ? 'Create Campaign' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}