import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { platform } from '@/api/platformClient';
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, CheckCircle, Calendar, Loader2, User, Mail, Phone, MessageSquare } from 'lucide-react';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// SAST = UTC+2
function sastNow() {
  const d = new Date();
  d.setTime(d.getTime() + 2 * 3600 * 1000);
  return d;
}

function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const CLOSED_WEEKDAYS_DEFAULT = new Set([0, 6]); // Sun, Sat — will be updated from rules

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [availabilityRules, setAvailabilityRules] = useState({});
  const [minNoticeHours, setMinNoticeHours] = useState(24);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMode, setSelectedMode] = useState('on_site');
  const [calendarMonth, setCalendarMonth] = useState(() => { const n = sastNow(); return { year: n.getUTCFullYear(), month: n.getUTCMonth() }; });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    platform.entities.BookingService.filter({ is_active: true }).then(setServices).catch(() => {});
    platform.entities.AvailabilityRule.list().then(rules => {
      const map = {};
      rules.forEach(r => { map[r.weekday] = r; });
      setAvailabilityRules(map);
      const mon = rules.find(r => r.weekday === 'Monday');
      if (mon?.min_notice_hours) setMinNoticeHours(mon.min_notice_hours);
    }).catch(() => {});
  }, []);

  const isWorkingDay = useCallback((year, month, day) => {
    const d = new Date(year, month, day);
    const weekday = WEEKDAY_NAMES[d.getDay()];
    const rule = availabilityRules[weekday];
    return rule?.is_open ?? false;
  }, [availabilityRules]);

  const isPastOrTooSoon = useCallback((year, month, day) => {
    const now = sastNow();
    const cutoff = new Date(now.getTime() + minNoticeHours * 3600 * 1000);
    const dayEnd = new Date(year, month, day, 23, 59, 59);
    return dayEnd <= cutoff;
  }, [minNoticeHours]);

  const fetchSlots = useCallback(async (dateStr, serviceId) => {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await platform.functions.invoke('getAvailableSlots', { serviceId, date: dateStr });
      setSlots(res.data?.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleDayClick = (year, month, day) => {
    if (!isWorkingDay(year, month, day)) return;
    if (isPastOrTooSoon(year, month, day)) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    fetchSlots(dateStr, selectedService.id);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Please fill in your name and email.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const endTime = addMinutes(selectedSlot.start, selectedService.duration_minutes);
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 20000)
      );
      await Promise.race([
        platform.functions.invoke('createBookingRequest', {
          service_id: selectedService.id,
          service_name: selectedService.name,
          service_duration_minutes: selectedService.duration_minutes,
          mode: selectedMode,
          date: selectedDate,
          start_time: selectedSlot.start,
          end_time: endTime,
          client_name: form.name,
          client_email: form.email,
          client_phone: form.phone,
          client_note: form.note,
        }),
        timeout,
      ]);
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again or call us on 084 230 5393.');
    } finally {
      setSubmitting(false);
    }
  };

  function addMinutes(hhmm, mins) {
    const [h, m] = hhmm.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  // Calendar grid
  const { year, month } = calendarMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = sastNow();
  const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">Request Received!</h1>
          <p className="text-white/60 text-lg mb-2">Your request has been saved for our team to review.</p>
          <p className="text-white/40 text-sm mb-8">Your appointment is not confirmed yet. Contact us on 084 230 5393 to confirm.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left mb-8 space-y-2">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-semibold">Booking Summary</p>
            <p className="text-white text-sm"><span className="text-copper">Service:</span> {selectedService?.name}</p>
            <p className="text-white text-sm"><span className="text-copper">Date:</span> {selectedDate && formatDate(selectedDate)}</p>
            <p className="text-white text-sm"><span className="text-copper">Time:</span> {selectedSlot && formatTime(selectedSlot.start)} SAST</p>
            <p className="text-white text-sm"><span className="text-copper">Mode:</span> {selectedMode === 'on_site' ? 'On-site (Sandton)' : 'Zoom (details to be arranged)'}</p>
          </div>
          {selectedService?.prep_tips && (
            <div className="bg-copper/10 border border-copper/20 rounded-2xl p-5 text-left mb-8">
              <p className="text-copper text-xs uppercase tracking-wider font-semibold mb-2">💡 Preparation Tips</p>
              <p className="text-white/70 text-sm">{selectedService.prep_tips}</p>
            </div>
          )}
          <Link to="/" className="inline-block px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-copper to-[#9a6030] rounded-full hover:shadow-lg hover:shadow-copper/30 transition-all">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0806]">
      {/* Header */}
      <div className="relative pt-28 pb-12 px-4 text-center">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(184,115,51,0.12) 0%, transparent 60%)' }} />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-copper text-sm mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to site
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">Book a Consultation</h1>
          <p className="text-white/50 text-lg">Choose a service and a time that works for you.</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {['Service', 'Date & Time', 'Your Details'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-copper text-white' : 'bg-white/10 text-white/30'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'text-white' : 'text-white/30'}`}>{label}</span>
                {i < 2 && <div className="w-8 h-px bg-white/10 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Service ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid gap-4">
                {services.length === 0 && (
                  <div className="text-center py-16 text-white/40"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Loading services…</div>
                )}
                {services.map(s => (
                  <motion.button key={s.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => { setSelectedService(s); setSelectedMode(s.allowed_modes?.includes('on_site') ? 'on_site' : 'zoom'); setStep(2); }}
                    className="w-full text-left p-6 rounded-2xl border transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{s.name}</h3>
                        {s.description && <p className="text-white/50 text-sm mb-3">{s.description}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration_minutes} min</span>
                          {s.allowed_modes?.includes('on_site') && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> On-site</span>}
                          {s.allowed_modes?.includes('zoom') && <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Zoom</span>}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-copper" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Date & Time ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => { setStep(1); setSelectedDate(null); setSelectedSlot(null); }} className="flex items-center gap-1.5 text-white/40 hover:text-copper text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Change service
              </button>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-1 mb-1 inline-flex text-sm">
                <span className="text-white/60 px-3 py-1">{selectedService?.name}</span>
                <span className="text-white/30 px-3 py-1">·</span>
                <span className="text-copper px-3 py-1">{selectedService?.duration_minutes} min</span>
              </div>

              {/* Mode toggle (only if both modes allowed) */}
              {selectedService?.allowed_modes?.length > 1 && (
                <div className="flex gap-2 mt-4 mb-6">
                  {['on_site', 'zoom'].filter(m => selectedService.allowed_modes.includes(m)).map(m => (
                    <button key={m} onClick={() => setSelectedMode(m)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${selectedMode === m ? 'bg-copper text-white border-copper' : 'bg-white/5 text-white/50 border-white/10 hover:border-copper/40'}`}>
                      {m === 'on_site' ? <><MapPin className="w-4 h-4" /> On-site</> : <><Video className="w-4 h-4" /> Zoom</>}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-medium text-sm">{MONTH_NAMES[month]} {year}</span>
                    <button onClick={() => setCalendarMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isWorking = isWorkingDay(year, month, day);
                      const tooSoon = isPastOrTooSoon(year, month, day);
                      const isSelected = selectedDate === dateStr;
                      const isToday = dateStr === todayStr;
                      const disabled = !isWorking || tooSoon;
                      return (
                        <button key={day} onClick={() => handleDayClick(year, month, day)} disabled={disabled}
                          className={`aspect-square rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-copper text-white' : isToday && !disabled ? 'bg-copper/20 text-copper' : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/70 hover:bg-copper/20 hover:text-copper'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  {!selectedDate && (
                    <div className="flex items-center justify-center h-full text-white/30 text-sm py-12">
                      <span>← Select a date</span>
                    </div>
                  )}
                  {selectedDate && (
                    <>
                      <p className="text-white/60 text-sm mb-3">{formatDate(selectedDate)}</p>
                      {loadingSlots && <div className="flex items-center gap-2 text-white/40 text-sm py-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading slots…</div>}
                      {!loadingSlots && slots.length === 0 && (
                        <p className="text-white/30 text-sm py-8">No slots available for this day. Try another date.</p>
                      )}
                      {!loadingSlots && slots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {slots.map((slot, idx) => (
                            <motion.button key={slot.start} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-3 rounded-xl text-sm font-medium border transition-all relative ${selectedSlot?.start === slot.start ? 'bg-copper text-white border-copper' : 'bg-white/5 text-white/70 border-white/10 hover:border-copper/40 hover:text-copper'}`}>
                              {formatTime(slot.start)}
                              {idx === 0 && !selectedSlot && (
                                <span className="absolute -top-1.5 left-1 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">Soonest</span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedSlot}
                  className="px-8 py-3 bg-gradient-to-r from-copper to-[#9a6030] text-white rounded-full font-medium disabled:opacity-30 transition-all hover:shadow-lg hover:shadow-copper/30">
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Details ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-white/40 hover:text-copper text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {/* Summary */}
              <div className="bg-copper/10 border border-copper/20 rounded-2xl p-5 mb-6 text-sm space-y-1.5">
                <p className="text-copper font-semibold text-xs uppercase tracking-wider mb-2">Your appointment</p>
                <p className="text-white/80"><span className="text-white/40">Service: </span>{selectedService?.name}</p>
                <p className="text-white/80"><span className="text-white/40">Date: </span>{selectedDate && formatDate(selectedDate)}</p>
                <p className="text-white/80"><span className="text-white/40">Time: </span>{selectedSlot && formatTime(selectedSlot.start)} SAST</p>
                <p className="text-white/80"><span className="text-white/40">Mode: </span>{selectedMode === 'on_site' ? '📍 On-site (Sandton)' : '💻 Zoom (details to be arranged)'}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2"><User className="w-3.5 h-3.5" /> Full name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-copper/60 transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2"><Mail className="w-3.5 h-3.5" /> Email address *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-copper/60 transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2"><Phone className="w-3.5 h-3.5" /> Phone number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+27 __ ___ ____"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-copper/60 transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2"><MessageSquare className="w-3.5 h-3.5" /> What would you like to discuss?</label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} placeholder="Give us a brief overview of your book project and what you'd like help with…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-copper/60 transition-colors resize-none" />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

              <button onClick={handleSubmit} disabled={submitting || !form.name || !form.email}
                className="mt-6 w-full py-4 bg-gradient-to-r from-copper to-[#9a6030] text-white rounded-full font-medium text-base disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-copper/30 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Request Appointment →'}
              </button>
              <p className="text-center text-white/30 text-xs mt-3">Your request will be saved for review. This does not confirm your appointment.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}