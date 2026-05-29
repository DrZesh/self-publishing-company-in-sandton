import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Video, User, AlertTriangle, Check, X, ArrowRight, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
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
function parseHHMM(s) { const [h, m] = s.split(':').map(Number); return h * 60 + m; }
function overlaps(s1, e1, s2, e2) {
  return parseHHMM(s1) < parseHHMM(e2) && parseHHMM(e1) > parseHHMM(s2);
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
            <span className="w-2 h-2 rounded-full bg-[#B87333]" />
            {appt.service_name}
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
            {appt.mode === 'zoom'
              ? <><Video className="w-3.5 h-3.5 text-blue-500" /> Zoom</>
              : <><MapPin className="w-3.5 h-3.5 text-green-600" /> On-site</>}
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
function CalendarView({ appointments }) {
  const approved = appointments.filter(a => a.status === 'approved');
  const today = new Date();
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const { year, month } = calMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const byDate = {};
  approved.forEach(a => {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
        <h3 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
        <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAppts = byDate[dateStr] || [];
          const isToday = dateStr === today.toISOString().split('T')[0];
          return (
            <div key={day} className={`min-h-[52px] rounded-lg p-1 ${isToday ? 'bg-[#B87333]/10 border border-[#B87333]/30' : dayAppts.length ? 'bg-green-50 border border-green-100' : 'border border-transparent'}`}>
              <p className={`text-xs font-medium mb-1 ${isToday ? 'text-[#B87333]' : 'text-gray-600'}`}>{day}</p>
              {dayAppts.map((a, idx) => (
                <div key={idx} className="text-[10px] bg-green-600 text-white rounded px-1 py-0.5 mb-0.5 truncate">
                  {formatTime(a.start_time)} {a.client_name?.split(' ')[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ['Pending', 'Upcoming', 'All', 'Calendar'];

export default function AdminAppointments() {
  const [activeTab, setActiveTab] = useState('Pending');
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateAppt = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const today = new Date().toISOString().split('T')[0];
  const approvedAppts = appointments.filter(a => a.status === 'approved');

  const pending  = appointments.filter(a => a.status === 'pending');
  const upcoming = appointments.filter(a => a.status === 'approved' && a.date >= today);
  const allAppts = appointments;

  async function handleApprove(appt) {
    try {
      await base44.functions.invoke('appointmentActions', { action: 'approve', appointmentId: appt.id });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`✅ Approved & confirmation email sent to ${appt.client_email}`);
    } catch { toast.error('Failed to approve'); }
  }
  async function handleDecline(appt, reason) {
    try {
      await base44.functions.invoke('appointmentActions', { action: 'decline', appointmentId: appt.id, declineReason: reason });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Declined — client notified by email');
    } catch { toast.error('Failed to decline'); }
  }
  async function handlePropose(appt, date, time) {
    try {
      await base44.functions.invoke('appointmentActions', { action: 'propose', appointmentId: appt.id, proposeDate: date, proposeTime: time });
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
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
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
            </button>
          ))}
        </div>

        {/* Calendar view */}
        {activeTab === 'Calendar' && <CalendarView appointments={appointments} />}

        {/* List views */}
        {activeTab !== 'Calendar' && (
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