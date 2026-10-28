import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

function getHealthStatus(project) {
  if (project.is_at_risk) return { level: 'critical', label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/15' };
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !['Completed', 'Delivered'].includes(project.stage);
  if (isOverdue) return { level: 'overdue', label: 'Overdue', color: 'text-orange-400', bg: 'bg-orange-500/15' };
  if (project.payment_status === 'Overdue') return { level: 'payment', label: 'Payment Due', color: 'text-amber-400', bg: 'bg-amber-500/15' };
  if (['Client Approval', 'Changes Requested'].includes(project.stage)) return { level: 'waiting', label: 'Awaiting Client', color: 'text-blue-400', bg: 'bg-blue-500/15' };
  return { level: 'ok', label: 'On Track', color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
}

export default function ProjectHealthBoard() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-health'],
    queryFn: () => platform.entities.Project.list('-updated_date', 100),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const active = projects.filter(p => !['Completed', 'Delivered'].includes(p.stage));
  const withHealth = active.map(p => ({ ...p, health: getHealthStatus(p) }));
  const sorted = [
    ...withHealth.filter(p => p.health.level === 'critical'),
    ...withHealth.filter(p => p.health.level === 'overdue'),
    ...withHealth.filter(p => p.health.level === 'payment'),
    ...withHealth.filter(p => p.health.level === 'waiting'),
    ...withHealth.filter(p => p.health.level === 'ok'),
  ].slice(0, 12);

  const critCount = withHealth.filter(p => p.health.level === 'critical').length;
  const overdueCount = withHealth.filter(p => p.health.level === 'overdue').length;
  const okCount = withHealth.filter(p => p.health.level === 'ok').length;

  return (
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Project Health Board</h3>
          <p className="text-xs text-white/50 mt-0.5">{active.length} active projects</p>
        </div>
        <div className="flex items-center gap-2">
          {critCount > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">{critCount} critical</span>}
          {overdueCount > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">{overdueCount} overdue</span>}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{okCount} ok</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-white/30">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-white/60">All projects are healthy</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {sorted.map(project => {
            const contact = contactMap[project.contact_id];
            const health = project.health;
            const dotColor =
              health.level === 'critical' ? 'bg-red-400' :
              health.level === 'overdue' ? 'bg-orange-400' :
              health.level === 'payment' ? 'bg-amber-400' :
              health.level === 'waiting' ? 'bg-blue-400' : 'bg-emerald-400';
            return (
              <div key={project.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{project.book_title || 'Untitled'}</p>
                    {project.is_vip && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 rounded font-bold">VIP</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-white/40 truncate">{contact?.full_name || '—'}</p>
                    <span className="text-white/20">·</span>
                    <p className="text-xs text-white/40">{project.stage}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${health.bg} ${health.color}`}>{health.label}</span>
                  {project.deadline && (
                    <p className="text-[10px] text-white/30">
                      {new Date(project.deadline) < new Date() ? '⚠ ' : ''}
                      {new Date(project.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-5 py-3 border-t border-white/5">
        <Link to="/admin/projects" className="text-xs text-[#D4A574] hover:underline flex items-center gap-1">
          View all projects <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}