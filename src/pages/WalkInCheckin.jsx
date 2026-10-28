import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

export default function WalkInCheckin() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', service_interest: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) return;
    setSubmitting(true);
    try {
      // Create or find contact
      const existing = await platform.entities.Contact.filter({ email: form.email }).catch(() => []);
      let contactId;
      if (existing.length > 0) {
        contactId = existing[0].id;
        await platform.entities.Contact.update(contactId, { last_contact_date: new Date().toISOString() });
      } else {
        const contact = await platform.entities.Contact.create({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          lifecycle_stage: 'lead',
          pipeline_stage: 'New Enquiry',
          first_contact_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
        });
        contactId = contact.id;
      }

      // Create walk-in submission
      await platform.entities.Submission.create({
        form_type: 'contact',
        source_page: '/walk-in',
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        message: `Walk-in client check-in. Service interest: ${form.service_interest}. Notes: ${form.notes}`,
        status: 'new',
        contact_id: contactId,
      });

      // Log activity note
      if (form.notes || form.service_interest) {
        await platform.entities.Note.create({
          contact_id: contactId,
          content: `📍 Walk-in visit on ${new Date().toLocaleDateString('en-ZA')}.\nService interest: ${form.service_interest || 'Not specified'}\nNotes: ${form.notes || 'None'}`,
          note_type: 'visit',
        }).catch(() => {});
      }

      setDone(true);
    } catch (err) {
      alert('Check-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-[#1A1208] flex items-center justify-center p-6">
      <NoIndexMeta title="Check In | Creative Books SA" />
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
        <p className="text-gray-600">Thank you for visiting Creative Books SA. A member of our team will be with you shortly.</p>
        <button onClick={() => { setDone(false); setForm({ full_name: '', email: '', phone: '', service_interest: '', notes: '' }); }}
          className="mt-6 w-full py-3 bg-[#B87333] text-white rounded-xl font-semibold">
          Check In Another Guest
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1208] flex items-center justify-center p-6">
      <NoIndexMeta title="Check In | Creative Books SA" />
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B87333] to-[#D4A574] p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Creative Books SA</h1>
          <p className="text-white/80 mt-1">Please check in below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input required value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
              placeholder="+27..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What brings you in today?</label>
            <select value={form.service_interest} onChange={e => setForm(p => ({...p, service_interest: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333] bg-white">
              <option value="">Select a service...</option>
              <option>Book Publishing</option>
              <option>Book Printing</option>
              <option>Book Editing</option>
              <option>Book Cover Design</option>
              <option>Typesetting / Layout</option>
              <option>eBook Publishing</option>
              <option>Collect my books</option>
              <option>Discuss my project</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
              placeholder="Any extra details..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333] resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-[#B87333] hover:bg-[#A06828] disabled:opacity-60 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {submitting ? 'Checking In...' : 'Check In'}
          </button>
        </form>
      </div>
    </div>
  );
}