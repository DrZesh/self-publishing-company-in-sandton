import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { ChevronLeft, ChevronRight, Calendar, Settings, Plus, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const EVENT_TYPES = {
  project_deadline: { label: 'Project Deadline', color: 'bg-blue-500', textColor: 'text-blue-300', bgLight: 'bg-blue-500/20 border-blue-400/30' },
  payment_due: { label: 'Payment Due', color: 'bg-red-500', textColor: 'text-red-300', bgLight: 'bg-red-500/20 border-red-400/30' },
  task_due: { label: 'Task Due', color: 'bg-orange-500', textColor: 'text-orange-300', bgLight: 'bg-orange-500/20 border-orange-400/30' },
  contract_expiry: { label: 'Contract Expiry', color: 'bg-yellow-500', textColor: 'text-yellow-300', bgLight: 'bg-yellow-500/20 border-yellow-400/30' },
  collection_ready: { label: 'Ready for Collection', color: 'bg-green-500', textColor: 'text-green-300', bgLight: 'bg-green-500/20 border-green-400/30' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['M','T','W','T','F','S','S'];
const DAYS_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function AdminCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [typeFilter, setTypeFilter] = useState('');

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => platform.entities.Project.list('-created_date', 200) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => platform.entities.Invoice.list('-created_date', 200) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => platform.entities.Task.list('-due_date', 200) });
  const { data: contracts = [] } = useQuery({ queryKey: ['contracts'], queryFn: () => platform.entities.Contract.list('-created_date', 200) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => platform.entities.Contact.list('-created_date', 500) });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const allEvents = useMemo(() => {
    const events = [];
    projects.forEach(p => {
      if (p.deadline) events.push({ date: p.deadline, type: 'project_deadline', label: `${p.book_title}`, sub: contactMap[p.contact_id]?.full_name });
      if (p.stage === 'Ready for Collection') events.push({ date: p.stage_changed_at?.split('T')[0] || p.updated_date?.split('T')[0], type: 'collection_ready', label: `${p.book_title} — Ready`, sub: contactMap[p.contact_id]?.full_name });
    });
    invoices.forEach(inv => {
      if (inv.due_date && !['Paid', 'Cancelled'].includes(inv.status))
        events.push({ date: inv.due_date, type: 'payment_due', label: `${inv.invoice_number}`, sub: contactMap[inv.contact_id]?.full_name });
    });
    tasks.forEach(t => {
      if (t.due_date && t.status !== 'Done')
        events.push({ date: t.due_date.split('T')[0], type: 'task_due', label: t.title, sub: contactMap[t.contact_id]?.full_name || t.task_type });
    });
    contracts.forEach(c => {
      if (c.expiry_date && !['Signed', 'Cancelled', 'Expired'].includes(c.status))
        events.push({ date: c.expiry_date, type: 'contract_expiry', label: c.title, sub: contactMap[c.contact_id]?.full_name });
    });
    return events.filter(e => e.date);
  }, [projects, invoices, tasks, contracts, contacts]);

  const filteredEvents = typeFilter ? allEvents.filter(e => e.type === typeFilter) : allEvents;

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      const key = e.date.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [filteredEvents]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  const upcoming = allEvents
    .filter(e => { const d = new Date(e.date); const now = new Date(); return d >= now && d <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  // All days for the horizontal scroller
  const allMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <AdminLayout>
      {/* Full-page gradient background */}
      <div
        className="min-h-screen -m-6 p-6 relative"
        style={{
          background: 'linear-gradient(135deg, #b8c8e8 0%, #c5b8e8 25%, #e8b8d8 50%, #d4b8e8 75%, #b8d4f0 100%)',
          backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Production Calendar</h1>
              <p className="text-sm text-white/70 mt-0.5">Deadlines, payments, tasks, and contracts in one view</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(EVENT_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors backdrop-blur-sm ${typeFilter === key ? `${val.bgLight} border-white/30 ${val.textColor}` : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${val.color}`} />
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── Glass Calendar Card ── */}
            <div className="xl:col-span-2">
              <div
                className="rounded-3xl p-6 overflow-hidden text-white"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top row: Weekly/Monthly tabs + Settings */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1 rounded-lg bg-black/20 p-1">
                    <button className="rounded-md bg-white px-4 py-1 text-xs font-bold text-black shadow-md">
                      Weekly
                    </button>
                    <button className="rounded-md px-4 py-1 text-xs font-semibold text-white/60 hover:text-white transition-colors">
                      Monthly
                    </button>
                  </div>
                  <button className="p-2 text-white/70 hover:bg-black/20 rounded-full transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>

                {/* Month name + nav */}
                <div className="flex items-center justify-between mb-6">
                  <motion.p
                    key={MONTHS[currentMonth]}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold tracking-tight"
                  >
                    {MONTHS[currentMonth]}
                  </motion.p>
                  <div className="flex items-center space-x-2">
                    <button onClick={prevMonth} className="p-1.5 rounded-full text-white/70 hover:bg-black/20 transition-colors">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 rounded-full text-white/70 hover:bg-black/20 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable horizontal day strip */}
                <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 mb-6">
                  <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
                  <div className="flex space-x-3 min-w-max">
                    {allMonthDays.map((day) => {
                      const date = new Date(currentYear, currentMonth, day);
                      const dayLetter = ['S','M','T','W','T','F','S'][date.getDay()];
                      const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                      const isSelected = selectedDay === day;
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const hasEvents = (eventsByDate[dateStr] || []).length > 0;
                      return (
                        <div key={day} className="flex flex-col items-center space-y-2 flex-shrink-0">
                          <span className="text-xs font-bold text-white/50">{dayLetter}</span>
                          <button
                            onClick={() => setSelectedDay(day)}
                            className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                              ${isSelected ? 'text-white shadow-lg' : 'hover:bg-white/20 text-white'}
                            `}
                            style={isSelected ? { background: 'linear-gradient(135deg, #ec4899, #f97316)' } : {}}
                          >
                            {isToday && !isSelected && (
                              <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-pink-400"></span>
                            )}
                            {day}
                          </button>
                          {hasEvents && (
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/20 mb-4" />

                {/* Footer actions */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                    <Edit2 className="h-4 w-4" />
                    <span>Add a note...</span>
                  </button>
                  <button className="flex items-center space-x-2 rounded-lg bg-black/20 px-3 py-2 text-xs font-bold text-white hover:bg-black/30 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>New Event</span>
                  </button>
                </div>

                {/* Selected day events */}
                {selectedDay && (
                  <div className="mt-6 pt-5 border-t border-white/15">
                    <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-widest text-xs">
                      {selectedDay} {MONTHS[currentMonth]} {currentYear}
                    </h3>
                    {selectedEvents.length === 0 ? (
                      <p className="text-sm text-white/30 italic">No events on this day</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedEvents.map((ev, i) => {
                          const type = EVENT_TYPES[ev.type];
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${type?.color || 'bg-white'}`} style={{ boxShadow: '0 0 6px currentColor' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{ev.label}</p>
                                {ev.sub && <p className="text-xs text-white/40 truncate">{ev.sub}</p>}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>{type?.label?.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="space-y-4">
              {/* Upcoming 14 Days + Legend combined */}
              <div
                className="rounded-3xl p-5 text-white space-y-5"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-300" />
                  <h3 className="font-semibold text-white text-sm">Next 14 Days</h3>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-white/30 italic">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcoming.map((ev, i) => {
                      const type = EVENT_TYPES[ev.type];
                      const d = new Date(ev.date);
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="text-center w-9 flex-shrink-0 rounded-xl py-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div className="text-[9px] text-white/40 uppercase tracking-wide leading-tight">{MONTHS[d.getMonth()].slice(0,3)}</div>
                            <div className="text-sm font-bold text-white leading-tight">{d.getDate()}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{ev.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${type?.color}`} />
                              <span className="text-xs text-white/40">{type?.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Legend inline */}
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.values(EVENT_TYPES).map(type => (
                    <div key={type.label} className="flex items-center gap-2 text-xs text-white/50">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${type.color}`} />
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}