import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { CheckCircle, XCircle, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function formatDate(s) {
  const d = new Date(s + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function AppointmentCancel() {
  const { token } = useParams();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    platform.functions.invoke('appointmentActions', { action: 'get_by_cancel_token', cancel_token: token })
      .then(res => {
        if (res.data?.appointment) setAppt(res.data.appointment);
        else setError('Appointment not found. The link may have already been used or has expired.');
      })
      .catch(() => setError('Unable to load appointment details.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await platform.functions.invoke('appointmentActions', { action: 'cancel_by_client', cancel_token: token });
      if (res.data?.success) {
        setCancelled(true);
      } else {
        setError(res.data?.error || 'Could not cancel the appointment. Please call us on 084 230 5393.');
      }
    } catch {
      setError('Something went wrong. Please call us on 084 230 5393.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] flex flex-col items-center justify-center px-4 py-16">
      <NoIndexMeta title="Cancel Appointment | Creative Books SA" />
      {/* Logo */}
      <div className="mb-8">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" className="h-10" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a0806] px-8 py-6 text-center">
          <h1 className="text-white font-heading text-2xl font-bold">Cancel Appointment</h1>
          <p className="text-white/60 text-sm mt-1">Creative Books SA</p>
        </div>

        <div className="p-8">
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 text-[#B87333] animate-spin" />
              <p className="text-gray-500 text-sm">Loading your appointment…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-gray-700 font-medium">{error}</p>
              <Link to="/book" className="text-[#B87333] text-sm underline">Book a new appointment</Link>
            </div>
          )}

          {!loading && cancelled && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800">Appointment Cancelled</h2>
              <p className="text-gray-500 text-sm">You'll receive a confirmation email shortly.</p>
              <Link
                to="/book"
                className="mt-2 inline-block bg-[#B87333] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#a06828] transition-colors"
              >
                Book a New Appointment
              </Link>
            </div>
          )}

          {!loading && !error && !cancelled && appt && (
            <>
              {appt.status === 'cancelled' ? (
                <div className="flex flex-col items-center py-6 gap-3 text-center">
                  <XCircle className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-600">This appointment has already been cancelled.</p>
                  <Link to="/book" className="text-[#B87333] text-sm underline">Book a new appointment</Link>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-5">
                    Are you sure you want to cancel the following appointment?
                  </p>

                  <div className="bg-[#f8f5f0] border-l-4 border-[#B87333] rounded-lg p-4 mb-6 space-y-2">
                    <p className="font-semibold text-gray-800">{appt.service_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                      {formatDate(appt.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                      {formatTime(appt.start_time)}{appt.end_time ? ` – ${formatTime(appt.end_time)}` : ''} SAST
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      Mode: {appt.mode === 'zoom' ? 'Zoom' : 'On-site'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/"
                      className="flex-1 text-center border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Keep Appointment
                    </Link>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                      {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    Want to reschedule instead?{' '}
                    <Link to="/book" className="text-[#B87333] underline">Book a new time</Link>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Questions? Call us on{' '}
        <a href="tel:0842305393" className="text-[#B87333]">084 230 5393</a>
      </p>
    </div>
  );
}