import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, RefreshCw, Loader2, TrendingUp, Users, Flame, Snowflake, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const GLASS = { background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' };

const GRADE_CONFIG = {
  Qualified: { color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', bar: '#10b981', Icon: Target },
  Hot:       { color: 'text-red-300',     bg: 'bg-red-500/20',     border: 'border-red-500/30',     bar: '#ef4444', Icon: Flame },
  Warm:      { color: 'text-amber-300',   bg: 'bg-amber-500/20',   border: 'border-amber-500/30',   bar: '#f59e0b', Icon: TrendingUp },
  Cold:      { color: 'text-blue-300',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30',    bar: '#3b82f6', Icon: Snowflake },
};

export default function AdminLeadScoring() {
  const qc = useQueryClient();
  const [scoring, setScoring] = useState(false);
  const [filterGrade, setFilterGrade] = useState('all');
  const [search, setSearch] = useState('');

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['lead-scores'],
    queryFn: () => platform.entities.LeadScore.list('-score', 500),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const runScoring = async () => {
    setScoring(true);
    try {
      const res = await platform.functions.invoke('scoreLeads', {});
      toast.success(`Scored ${res.data?.scored} contacts`);
      qc.invalidateQueries(['lead-scores']);
    } catch (e) {
      toast.error('Scoring failed: ' + e.message);
    } finally {
      setScoring(false);
    }
  };

  const filtered = scores.filter(s => {
    const contact = contactMap[s.contact_id];
    if (!contact) return false;
    if (filterGrade !== 'all' && s.grade !== filterGrade) return false;
    if (search && !contact.full_name?.toLowerCase().includes(search.toLowerCase()) &&
        !contact.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const gradeCounts = Object.fromEntries(
    Object.keys(GRADE_CONFIG).map(g => [g, scores.filter(s => s.grade === g).length])
  );

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">AI Lead Scoring</h1>
              <p className="text-sm text-white/60 mt-0.5">Auto-scores contacts 0–100 based on engagement, recency & deal value</p>
            </div>
            <button onClick={runScoring} disabled={scoring}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#B87333,#D4A574)', boxShadow: '0 4px 20px rgba(184,115,51,0.4)' }}>
              {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {scoring ? 'Scoring…' : 'Run AI Scoring'}
            </button>
          </div>

          {/* Grade KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(GRADE_CONFIG).map(([grade, cfg]) => {
              const Icon = cfg.Icon;
              return (
                <button key={grade} onClick={() => setFilterGrade(filterGrade === grade ? 'all' : grade)}
                  className={`rounded-2xl p-4 text-left transition-all hover:scale-[1.02] border ${filterGrade === grade ? cfg.border : 'border-transparent'}`}
                  style={GLASS}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className={`text-sm font-bold ${cfg.color}`}>{grade}</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{gradeCounts[grade] || 0}</p>
                  <p className="text-xs text-white/40 mt-0.5">contacts</p>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="w-full pl-4 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          {/* Score list */}
          <div className="rounded-2xl overflow-hidden" style={GLASS}>
            {isLoading ? (
              <div className="p-8 text-center text-white/40">Loading scores…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Star className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No scores yet — click "Run AI Scoring" to get started</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Contact', 'Grade', 'Score', 'Breakdown', 'Last Updated', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const contact = contactMap[s.contact_id];
                    if (!contact) return null;
                    const cfg = GRADE_CONFIG[s.grade] || GRADE_CONFIG.Cold;
                    const Icon = cfg.Icon;
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: cfg.bar }}>
                              {contact.full_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{contact.full_name}</p>
                              <p className="text-xs text-white/40">{contact.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                            <Icon className="w-3 h-3" />{s.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">{s.score}</span>
                            <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: cfg.bar }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {s.score_breakdown && (
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(s.score_breakdown).map(([k, v]) => (
                                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                  {k.split('_')[0]}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/40">
                          {s.last_calculated_at ? new Date(s.last_calculated_at).toLocaleDateString('en-ZA') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/contacts/detail?id=${contact.id}`}
                            className="text-xs text-[#B87333] hover:underline font-semibold">View →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}