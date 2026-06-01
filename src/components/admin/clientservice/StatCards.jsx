import { Printer, BookOpen, Palette, Clock, CheckCircle, XCircle, Mail, Activity } from 'lucide-react';

export default function StatCards({ projects, emailLogs }) {
  const active = projects.filter(p => p.status === 'active').length;
  const printing = projects.filter(p => p.service_type === 'Book Printing' && p.status === 'active').length;
  const editing = projects.filter(p => p.service_type === 'Book Editing' && p.status === 'active').length;
  const coverDesign = projects.filter(p => p.service_type === 'Book Cover Design' && p.status === 'active').length;
  const awaitingFeedback = projects.filter(p =>
    p.status === 'active' && p.current_stage_label && p.current_stage_label.toLowerCase().includes('feedback')
  ).length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const failedEmails = emailLogs.filter(e => e.status === 'failed').length;
  const thisMonth = new Date();
  const emailsThisMonth = emailLogs.filter(e => {
    const d = new Date(e.sent_at);
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear() && e.status !== 'failed';
  }).length;

  const cards = [
    { label: 'Active Projects', value: active, icon: Activity, gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', glow: '#6366f1' },
    { label: 'Printing', value: printing, icon: Printer, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', glow: '#8b5cf6' },
    { label: 'Editing', value: editing, icon: BookOpen, gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', glow: '#0ea5e9' },
    { label: 'Cover Design', value: coverDesign, icon: Palette, gradient: 'linear-gradient(135deg,#f43f5e,#fb7185)', glow: '#f43f5e' },
    { label: 'Awaiting Feedback', value: awaitingFeedback, icon: Clock, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', glow: '#f59e0b' },
    { label: 'Completed', value: completed, icon: CheckCircle, gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: '#10b981' },
    { label: 'Failed Emails', value: failedEmails, icon: XCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', glow: '#ef4444' },
    { label: 'Emails This Month', value: emailsThisMonth, icon: Mail, gradient: 'linear-gradient(135deg,#B87333,#d4944a)', glow: '#B87333' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label}
            className="relative rounded-2xl border border-white/60 p-4 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8), 0 0 20px ${card.glow}15`,
            }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ background: card.gradient }} />
            <div className="relative">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: card.gradient, boxShadow: `0 2px 8px ${card.glow}35` }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</p>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 leading-tight">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}