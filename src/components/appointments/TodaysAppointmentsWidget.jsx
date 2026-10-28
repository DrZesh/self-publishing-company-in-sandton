import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Calendar, Clock, MapPin, Video, ChevronRight } from 'lucide-react';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function TodaysAppointmentsWidget() {
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments-today'],
    queryFn: () => platform.entities.Appointment.filter({ date: today, status: 'approved' }),
    refetchInterval: 60000,
  });

  const sorted = [...appointments].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#B87333]" /> Today's Appointments
          {appointments.length > 0 && (
            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{appointments.length}</span>
          )}
        </p>
        <Link to="/admin/appointments" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
          All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 py-3 text-center">No appointments today</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(appt => (
            <div key={appt.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-center min-w-[48px]">
                <p className="text-xs font-bold text-[#B87333]">{formatTime(appt.start_time)}</p>
                <p className="text-[10px] text-gray-400">{appt.service_duration_minutes}m</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{appt.client_name}</p>
                <p className="text-[10px] text-gray-500 truncate">{appt.service_name}</p>
              </div>
              {appt.mode === 'zoom'
                ? <Video className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                : <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}