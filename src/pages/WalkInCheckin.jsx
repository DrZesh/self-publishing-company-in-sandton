import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  service_interest: '',
  notes: '',
};

export default function WalkInCheckin() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('walkin-checkin', {
        body: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          service_interest: form.service_interest,
          notes: form.notes,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDone(true);
    } catch (error) {
      setErrorMessage(error.message || 'Check-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#1A1208] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Thank you for visiting Creative Books SA. A member of our team will be with you shortly.</p>
          <button
            onClick={() => {
              setDone(false);
              setErrorMessage('');
              setForm(EMPTY_FORM);
            }}
            className="mt-6 w-full py-3 bg-[#B87333] text-white rounded-xl font-semibold"
          >
            Check In Another Guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1208] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#B87333] to-[#D4A574] p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Creative Books SA</h1>
          <p className="text-white/80 mt-1">Please check in below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              required
              value={form.full_name}
              onChange={event => setForm(previous => ({ ...previous, full_name: event.target.value }))}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              required
              value={form.phone}
              onChange={event => setForm(previous => ({ ...previous, phone: event.target.value }))}
              placeholder="+27..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What brings you in today?</label>
            <select
              value={form.service_interest}
              onChange={event => setForm(previous => ({ ...previous, service_interest: event.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333] bg-white"
            >
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
            <textarea
              value={form.notes}
              onChange={event => setForm(previous => ({ ...previous, notes: event.target.value }))}
              placeholder="Any extra details..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B87333] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#B87333] hover:bg-[#A06828] disabled:opacity-60 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {submitting ? 'Checking In...' : 'Check In'}
          </button>
        </form>
      </div>
    </div>
  );
}
