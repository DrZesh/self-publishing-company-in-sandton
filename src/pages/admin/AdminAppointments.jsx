import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Video, User, AlertTriangle, Check, X, ArrowRight, ChevronLeft, ChevronRight, Bell, RefreshCw, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function parseHHMM(s) { 
  if (!s) return 0; 
  const [h, m] = s.split(':').map(Number); 
  return h * 60 + m; 
}
function overlaps(s1, e1, s2, e2) {
  if (!s1 || !s2) return false;
  const start1 = parseHHMM(s1);
  const end1 = e1 ? parseHHMM(e1) : start1 + 30;
  const start2 = parseHHMM(s2);
  const end2 = e2 ? parseHHMM(e2) : start2 + 30;
  return start1 < end2 && end1 > start2;
}

const STATUS_COLORS = {
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  approved:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  declined:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  cancelled: { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200'   },
  completed: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  no_show:   { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'   },
};

// ── Appointment Card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, approvedAppts, onApprove, onDecline, onPropose, onNoShow, onComplete, showActions }) {
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [proposing, setProposing] = useState(false);
  const [proposeDate, setProposeDate] = useState('');
  const [proposeTime, setProposeTime] = useState('');

  // Conflict detection: pending appt vs approved ones on same date
  const hasConflict = appt.status === 'pending' && approvedAppts.some(a =>
    a.id !== appt.id && a.date === appt.date &&
    overlaps(appt.start_time, appt.end_time, a.start_time, a.end_time)
  );

  const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.pending;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm ${hasConflict ? 'border-amber-300' : 'border-gray-100'}`}>
      {hasConflict && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Conflict — overlaps an approved appointment on this date
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B87333]/15 flex items-center justify-center text-[#B87333] font-bold text-sm flex-shrink-0">
              {initials(appt.client_name)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{appt.client_name}</p>
              <p className="text-xs text-gray-500">{appt.client_email}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
            {appt.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2 h-2 rounded-full ${DOT[tone(appt)]}`} />
            {appt.service_name}
            {bookingKind(appt) !== 'meeting' && <span className="ml-1 text-[10px] uppercase tracking-wide font-semibold text-emerald-700">{bookingKind(appt)}</span>}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {formatDate(appt.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {formatTime(appt.start_time)} · {appt.service_duration_minutes} min
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            {bookingKind(appt) === 'delivery'
              ? <><MapPin className="w-3.5 h-3.5 text-green-600" /> Courier to client</>
              : appt.mode === 'zoom'
                ? <><Video className="w-3.5 h-3.5 text-blue-500" /> Zoom</>
                : <><MapPin className="w-3.5 h-3.5 text-green-600" /> {bookingKind(appt) === 'collection' ? 'Collect at office' : 'On-site'}</>}
          </span>
        </div>

        {appt.client_note && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-gray-500 mb-0.5 font-medium">Client note</p>
            <p className="text-xs text-gray-700">{appt.client_note}</p>
          </div>
        )}

        {showActions && appt.status === 'pending' && !declining && !proposing && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs" onClick={() => onApprove(appt)}>
              <Check className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 text-xs" onClick={() => setDeclining(true)}>
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setProposing(true)}>
              <ArrowRight className="w-3.5 h-3.5" /> Propose new time
            </Button>
          </div>
        )}

        {showActions && appt.status === 'approved' && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-1.5 text-xs" onClick={() => onComplete(appt)}>
              <Check className="w-3.5 h-3.5" /> Mark completed
            </Button>
            <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5 text-xs" onClick={() => onNoShow(appt)}>
              <User className="w-3.5 h-3.5" /> No-show
            </Button>
          </div>
        )}

        {/* Decline form */}
        {declining && (
          <div className="mt-3 space-y-2">
            <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={2} placeholder="Reason for declining (optional — will be sent to client)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-red-300" />
            <div className="flex gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs" onClick={() => { onDecline(appt, declineReason); setDeclining(false); }}>Confirm Decline</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setDeclining(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Propose form */}
        {proposing && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <input type="date" value={proposeDate} onChange={e => setProposeDate(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#B87333]" />
              <input type="time" value={proposeTime} onChange={e => setProposeTime(e.target.value)} className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#B87333]" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-[#B87333] hover:bg-[#9a6030] text-white text-xs" disabled={!proposeDate || !proposeTime}
                onClick={() => { onPropose(appt, proposeDate, proposeTime); setProposing(false); }}>Send Proposal</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setProposing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────
// Kind of booking, from the service name
function bookingKind(a) {
  const n = (a?.service_name || '').toLowerCase();
  if (n.includes('collect')) return 'collection';
  if (n.includes('deliver')) return 'delivery';
  return 'meeting';
}
const DOT = { pending: 'bg-amber-400', collection: 'bg-emerald-500', delivery: 'bg-emerald-500', meeting: 'bg-blue-500' };
const CHIP = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  collection: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  delivery: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  meeting: 'bg-blue-50 text-blue-800 border-blue-200',
};
const tone = (a) => (a.status === 'pending' ? 'pending' : bookingKind(a));
const sastToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' });

// Shared calendar: every pending and approved booking (meetings, collections, deliveries).
// Click a day to see its bookings and approve, decline or move them without leaving the calendar.
function CalendarView({ appointments, approvedAppts, actions }) {
  const today = sastToday();
  const [calMonth, setCalMonth] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);
  const { year, month } = calMonth;
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // weeks start on Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const shown = appointments.filter(a => ['pending', 'approved', 'completed'].includes(a.status) && a.date);
  const byDate = {};
  shown.forEach(a => { (byDate[a.date] = byDate[a.date] || []).push(a); });
  Object.values(byDate).forEach(l => l.sort((x, y) => (x.start_time || '').localeCompare(y.start_time || '')));
  const move = (d) => { setCalMonth(m => { const x = new Date(m.year, m.month + d); return { year: x.getFullYear(), month: x.getMonth() }; }); };
  const goToday = () => { setCalMonth({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }); setSelected(today); };
  const dayList = byDate[selected] || [];
  const monthPending = shown.filter(a => a.status === 'pending' && a.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1">
            <button aria-label="Previous month" onClick={() => move(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="font-semibold text-gray-900 min-w-[150px] text-center">{MONTHS[month]} {year}</h3>
            <button aria-label="Next month" onClick={() => move(1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={goToday} className="ml-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">Today</button>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Needs approval{monthPending ? ` (${monthPending})` : ''}</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Collection / delivery</span>
            <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Meeting</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const list = byDate[dateStr] || [];
            const isToday = dateStr === today, isSel = dateStr === selected;
            return (
              <button key={day} type="button" onClick={() => setSelected(dateStr)} aria-pressed={isSel}
                aria-label={`${day} ${MONTHS[month]}${list.length ? `, ${list.length} booking${list.length > 1 ? 's' : ''}` : ''}`}
                className={`min-h-[58px] sm:min-h-[84px] rounded-lg p-1 text-left align-top transition-colors border ${isSel ? 'border-[#B87333] ring-1 ring-[#B87333]/40 bg-[#B87333]/5' : isToday ? 'border-[#B87333]/30 bg-[#B87333]/5' : 'border-gray-100 hover:bg-gray-50'} ${dateStr < today ? 'opacity-60' : ''}`}>
                <span className={`block text-xs font-semibold mb-1 ${isToday ? 'text-[#B87333]' : 'text-gray-700'}`}>{day}</span>
                <span className="hidden sm:block space-y-0.5">
                  {list.slice(0, 3).map(a => (
                    <span key={a.id} className={`block text-[10px] leading-tight border rounded px-1 py-0.5 truncate ${CHIP[tone(a)]}`}>
                      {formatTime(a.start_time)} {a.client_name?.split(' ')[0]}
                    </span>
                  ))}
                  {list.length > 3 && <span className="block text-[10px] text-gray-500">+{list.length - 3} more</span>}
                </span>
                <span className="flex sm:hidden gap-0.5 flex-wrap">
                  {list.slice(0, 4).map(a => <i key={a.id} className={`w-1.5 h-1.5 rounded-full ${DOT[tone(a)]}`} />)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">Selected day</p>
          <p className="font-semibold text-gray-900">{formatDate(selected)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{dayList.length ? `${dayList.length} booking${dayList.length > 1 ? 's' : ''}` : 'Nothing booked'}</p>
        </div>
        {dayList.map(a => (
          <AppointmentCard key={a.id} appt={a} approvedAppts={approvedAppts} showActions
            onApprove={actions.onApprove} onDecline={actions.onDecline} onPropose={actions.onPropose}
            onComplete={actions.onComplete} onNoShow={actions.onNoShow} />
        ))}
      </div>
    </div>
  );
}

// ── Reminders Tab ─────────────────────────────────────────────────────────────
function RemindersTab({ appointments }) {
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => a.status === 'approved' && a.date >= today)
    .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

  const [resending, setResending] = useState(null);

  async function handleResend(appt) {
    setResending(appt.id);
    try {
      await platform.functions.invoke('appointmentActions', { action: 'resend_reminder', appointmentId: appt.id });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`✅ Reminder resent to ${appt.client_email}`);
    } catch {
      toast.error('Failed to resend reminder');
    } finally {
      setResending(null);
    }
  }

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm bg-white border border-gray-100 rounded-xl">
        <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        No upcoming approved appointments
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>The system automatically sends a reminder email to clients <strong>5 hours before</strong> their scheduled appointment. You can manually resend a reminder at any time.</span>
      </div>

      {/* Table header — desktop */}
      <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <span>Client</span>
        <span>Service</span>
        <span>Date</span>
        <span>Time</span>
        <span>Location</span>
        <span>Reminder</span>
        <span></span>
      </div>

      {upcoming.map(appt => {
        const reminderSent = appt.reminder_5h_sent;
        const sentAt = appt.reminder_5h_sent_at
          ? new Date(appt.reminder_5h_sent_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : null;
        const locationLabel = appt.mode === 'zoom' ? 'Zoom' : 'On-site';

        return (
          <div key={appt.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            {/* Mobile layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#B87333]/15 flex items-center justify-center text-[#B87333] font-bold text-xs flex-shrink-0">
                    {initials(appt.client_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{appt.client_name}</p>
                    <p className="text-xs text-gray-500">{appt.service_name}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${reminderSent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  {reminderSent ? 'Sent' : 'Pending'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{appt.client_email}</span>
                {appt.client_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{appt.client_phone}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />{formatDate(appt.date)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />{formatTime(appt.start_time)}</span>
                <span className="flex items-center gap-1">
                  {appt.mode === 'zoom' ? <Video className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-green-600" />}
                  {locationLabel}
                </span>
                {sentAt && <span className="text-gray-400 col-span-2">Sent: {sentAt}</span>}
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-[#B87333] border-[#B87333]/30 hover:bg-[#B87333]/5"
                onClick={() => handleResend(appt)} disabled={resending === appt.id}>
                {resending === appt.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><RefreshCw className="w-3.5 h-3.5" /> Resend Reminder</>}
              </Button>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{appt.client_name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{appt.client_email}</p>
                {appt.client_phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{appt.client_phone}</p>}
              </div>
              <div>
                <p className="text-sm text-gray-800">{appt.service_name}</p>
              </div>
              <div className="text-sm text-gray-700">{formatDate(appt.date)}</div>
              <div className="text-sm text-gray-700">{formatTime(appt.start_time)}</div>
              <div className="flex items-center gap-1 text-sm text-gray-700">
                {appt.mode === 'zoom' ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-green-600" />}
                {locationLabel}
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${reminderSent ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  {reminderSent ? '✓ Sent' : '⏳ Pending'}
                </span>
                {sentAt && <p className="text-[10px] text-gray-400 mt-1">{sentAt}</p>}
              </div>
              <Button size="sm" variant="outline" className="text-xs gap-1.5 text-[#B87333] border-[#B87333]/30 hover:bg-[#B87333]/5 whitespace-nowrap"
                onClick={() => handleResend(appt)} disabled={resending === appt.id}>
                {resending === appt.id ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><RefreshCw className="w-3.5 h-3.5" /> Resend</>}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ['Pending', 'Calendar', 'Upcoming', 'All', 'Reminders'];

export default function AdminAppointments() {
  const [activeTab, setActiveTab] = useState('Pending');
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => platform.entities.Appointment.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateAppt = useMutation({
    mutationFn: ({ id, data }) => platform.entities.Appointment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const today = new Date().toISOString().split('T')[0];
  const approvedAppts = appointments.filter(a => a.status === 'approved');

  const pending  = appointments.filter(a => a.status === 'pending');
  const upcoming = appointments.filter(a => a.status === 'approved' && a.date >= today);
  const allAppts = appointments;

  async function handleApprove(appt) {
    try {
      await platform.functions.invoke('appointmentActions', { action: 'approve', appointmentId: appt.id });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`✅ Approved & confirmation email sent to ${appt.client_email}`);
    } catch { toast.error('Failed to approve'); }
  }
  async function handleDecline(appt, reason) {
    try {
      await platform.functions.invoke('appointmentActions', { action: 'decline', appointmentId: appt.id, declineReason: reason });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Declined — client notified by email');
    } catch { toast.error('Failed to decline'); }
  }
  async function handlePropose(appt, date, time) {
    try {
      await platform.functions.invoke('appointmentActions', { action: 'propose', appointmentId: appt.id, proposeDate: date, proposeTime: time });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Proposal sent — client notified by email');
    } catch { toast.error('Failed to send proposal'); }
  }
  function handleComplete(appt) {
    updateAppt.mutate({ id: appt.id, data: { status: 'completed' } });
    toast.success('Marked as completed');
  }
  function handleNoShow(appt) {
    updateAppt.mutate({ id: appt.id, data: { status: 'no_show' } });
    toast.success('Marked as no-show');
  }

  const listForTab = activeTab === 'Pending' ? pending : activeTab === 'Upcoming' ? upcoming : allAppts;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage booking requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit max-w-full overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
              {tab === 'Pending' && pending.length > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pending.length}
                </span>
              )}
              {tab === 'Upcoming' && upcoming.length > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {upcoming.length}
                </span>
              )}
              {tab === 'Reminders' && upcoming.length > 0 && (
                <span className="bg-[#B87333] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {upcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Calendar view */}
        {activeTab === 'Calendar' && <CalendarView appointments={appointments} approvedAppts={approvedAppts} actions={{ onApprove: handleApprove, onDecline: handleDecline, onPropose: handlePropose, onComplete: handleComplete, onNoShow: handleNoShow }} />}

        {/* Reminders view */}
        {activeTab === 'Reminders' && <RemindersTab appointments={appointments} />}

        {/* List views */}
        {activeTab !== 'Calendar' && activeTab !== 'Reminders' && (
          <div className="space-y-4">
            {isLoading && <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>}
            {!isLoading && listForTab.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white border border-gray-100 rounded-xl">
                {activeTab === 'Pending' ? 'No pending requests 🎉' : 'No appointments found'}
              </div>
            )}
            {listForTab.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} approvedAppts={approvedAppts}
                showActions={true}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onPropose={handlePropose}
                onComplete={handleComplete}
                onNoShow={handleNoShow}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}