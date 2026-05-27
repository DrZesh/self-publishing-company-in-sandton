import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, FolderKanban, FileText, CreditCard, CheckSquare, FileSignature } from 'lucide-react';

const EVENT_TYPES = {
  project_deadline: { label: 'Project Deadline', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50 border-blue-200' },
  payment_due: { label: 'Payment Due', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 border-red-200' },
  task_due: { label: 'Task Due', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 border-orange-200' },
  contract_expiry: { label: 'Contract Expiry', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50 border-yellow-200' },
  collection_ready: { label: 'Ready for Collection', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50 border-green-200' },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AdminCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list('-created_date', 200) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date', 200) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list('-due_date', 200) });
  const { data: contracts = [] } = useQuery({ queryKey: ['contracts'], queryFn: () => base44.entities.Contract.list('-created_date', 200) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date', 500) });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  // Build all calendar events
  const allEvents = useMemo(() => {
    const events = [];

    projects.forEach(p => {
      if (p.deadline) events.push({ date: p.deadline, type: 'project_deadline', label: `${p.book_title}`, sub: contactMap[p.contact_id]?.full_name });
      if (p.stage === 'Ready for Collection') events.push({ date: p.stage_changed_at?.split('T')[0] || p.updated_date?.split('T')[0], type: 'collection_ready', label: `${p.book_title} — Ready`, sub: contactMap[p.contact_id]?.full_name });
    });

    invoices.forEach(inv => {
      if (inv.due_date && !['Paid', 'Cancelled'].includes(inv.status)) {
        events.push({ date: inv.due_date, type: 'payment_due', label: `${inv.invoice_number}`, sub: contactMap[inv.contact_id]?.full_name });
      }
    });

    tasks.forEach(t => {
      if (t.due_date && t.status !== 'Done') {
        events.push({ date: t.due_date.split('T')[0], type: 'task_due', label: t.title, sub: contactMap[t.contact_id]?.full_name || t.task_type });
      }
    });

    contracts.forEach(c => {
      if (c.expiry_date && !['Signed', 'Cancelled', 'Expired'].includes(c.status)) {
        events.push({ date: c.expiry_date, type: 'contract_expiry', label: c.title, sub: contactMap[c.contact_id]?.full_name });
      }
    });

    return events.filter(e => e.date);
  }, [projects, invoices, tasks, contracts, contacts]);

  const filteredEvents = typeFilter ? allEvents.filter(e => e.type === typeFilter) : allEvents;

  // Group events by date string
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

  const selectedDateStr = selectedDay ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  // Upcoming events (next 14 days)
  const upcoming = allEvents
    .filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d >= now && d <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Calendar</h1>
            <p className="text-sm text-gray-500 mt-0.5">Deadlines, payments, tasks, and contracts in one view</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${typeFilter === key ? `${val.bgLight} border-current ${val.textColor}` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={`w-2 h-2 rounded-full ${val.color}`} />
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Month Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-50" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[80px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors ${isSelected ? 'bg-[#B87333]/5 border-[#B87333]/20' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${isToday ? 'bg-[#B87333] text-white' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev, idx) => {
                        const type = EVENT_TYPES[ev.type];
                        return (
                          <div key={idx} className={`text-xs px-1 py-0.5 rounded truncate ${type?.textColor || 'text-gray-600'} ${type?.bgLight || 'bg-gray-50'} border text-[10px] leading-tight`}>
                            {ev.label}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Selected Day Events */}
            {selectedDay && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {selectedDay} {MONTHS[currentMonth]} {currentYear}
                </h3>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-gray-400">No events on this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((ev, i) => {
                      const type = EVENT_TYPES[ev.type];
                      return (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${type?.bgLight || 'bg-gray-50 border-gray-200'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${type?.color || 'bg-gray-400'}`} />
                          <div>
                            <p className={`text-sm font-medium ${type?.textColor || 'text-gray-700'}`}>{ev.label}</p>
                            {ev.sub && <p className="text-xs text-gray-500">{ev.sub}</p>}
                            <p className="text-xs text-gray-400">{type?.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming 14 Days */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B87333]" />
                Next 14 Days
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((ev, i) => {
                    const type = EVENT_TYPES[ev.type];
                    const d = new Date(ev.date);
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="text-center w-10 flex-shrink-0">
                          <div className="text-xs text-gray-400">{MONTHS[d.getMonth()].slice(0,3)}</div>
                          <div className="text-sm font-bold text-gray-900">{d.getDate()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.label}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${type?.color}`} />
                            <span className="text-xs text-gray-400">{type?.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Legend</h3>
              <div className="space-y-2">
                {Object.values(EVENT_TYPES).map(type => (
                  <div key={type.label} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${type.color}`} />
                    {type.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}