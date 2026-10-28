import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Clock, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MODES = ['on_site', 'zoom'];

export default function AdminBookingSettings() {
  const qc = useQueryClient();
  const [newService, setNewService] = useState({ name: '', description: '', duration_minutes: 30, buffer_minutes: 15, allowed_modes: ['on_site', 'zoom'], prep_tips: '', is_active: true });
  const [addingService, setAddingService] = useState(false);

  const { data: services = [] } = useQuery({ queryKey: ['booking-services'], queryFn: () => platform.entities.BookingService.list() });
  const { data: rules = [] } = useQuery({ queryKey: ['availability-rules'], queryFn: () => platform.entities.AvailabilityRule.list() });

  const ruleMap = {};
  rules.forEach(r => { ruleMap[r.weekday] = r; });

  const updateRule = useMutation({
    mutationFn: ({ id, data }) => platform.entities.AvailabilityRule.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability-rules'] }),
  });

  const createService = useMutation({
    mutationFn: (data) => platform.entities.BookingService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booking-services'] }); setAddingService(false); setNewService({ name: '', description: '', duration_minutes: 30, buffer_minutes: 15, allowed_modes: ['on_site', 'zoom'], prep_tips: '', is_active: true }); toast.success('Service added'); },
  });

  const toggleService = useMutation({
    mutationFn: ({ id, is_active }) => platform.entities.BookingService.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking-services'] }),
  });

  const deleteService = useMutation({
    mutationFn: (id) => platform.entities.BookingService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['booking-services'] }); toast.success('Service deleted'); },
  });

  const mondayRule = ruleMap['Monday'];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure services, working hours, and availability rules.</p>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#B87333]" />
            <h2 className="font-semibold text-lg text-gray-900">Working Hours (SAST)</h2>
          </div>
          <div className="space-y-2">
            {WEEKDAYS.map(day => {
              const rule = ruleMap[day];
              if (!rule) return (
                <div key={day} className="flex items-center gap-4 py-2 text-sm text-gray-400">
                  <span className="w-28">{day}</span>
                  <span>Loading…</span>
                </div>
              );
              return (
                <div key={day} className="flex items-center gap-4 py-2">
                  <span className="w-28 text-sm font-medium text-gray-700">{day}</span>
                  <button onClick={() => updateRule.mutate({ id: rule.id, data: { is_open: !rule.is_open } })} className="text-primary">
                    {rule.is_open ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                  {rule.is_open && (
                    <>
                      <Input type="time" defaultValue={rule.start_time || '09:00'} className="w-32 text-sm"
                        onBlur={e => updateRule.mutate({ id: rule.id, data: { start_time: e.target.value } })} />
                      <span className="text-muted-foreground text-sm">to</span>
                      <Input type="time" defaultValue={rule.end_time || '17:00'} className="w-32 text-sm"
                        onBlur={e => updateRule.mutate({ id: rule.id, data: { end_time: e.target.value } })} />
                    </>
                  )}
                  {!rule.is_open && <span className="text-sm text-gray-400">Closed</span>}
                </div>
              );
            })}
          </div>
          {mondayRule && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Minimum notice required</span>
              <Input type="number" defaultValue={mondayRule.min_notice_hours ?? 24} className="w-24 text-sm"
                onBlur={e => updateRule.mutate({ id: mondayRule.id, data: { min_notice_hours: Number(e.target.value) } })} />
              <span className="text-sm text-gray-500">hours</span>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#B87333]" />
              <h2 className="font-semibold text-lg text-gray-900">Bookable Services</h2>
            </div>
            <Button size="sm" onClick={() => setAddingService(true)} className="gap-1">
              <Plus className="w-4 h-4" /> Add service
            </Button>
          </div>

          <div className="space-y-3">
            {services.map(s => (
              <div key={s.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{s.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>⏱ {s.duration_minutes} min</span>
                    <span>+{s.buffer_minutes} min buffer</span>
                    <span>{(s.allowed_modes || []).join(' / ')}</span>
                  </div>
                  {s.prep_tips && <p className="text-xs text-primary mt-1">💡 {s.prep_tips}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={() => toggleService.mutate({ id: s.id, is_active: !s.is_active })}>
                    {s.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteService.mutate(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {addingService && (
            <div className="mt-4 p-4 rounded-lg space-y-3" style={{ border: '1px solid rgba(184,115,51,0.3)', background: 'rgba(184,115,51,0.08)' }}>
              <h3 className="text-sm font-semibold text-gray-900">New Service</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                  <Input value={newService.name} onChange={e => setNewService(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Consultation" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
                  <Input type="number" value={newService.duration_minutes} onChange={e => setNewService(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Buffer (min)</label>
                  <Input type="number" value={newService.buffer_minutes} onChange={e => setNewService(f => ({ ...f, buffer_minutes: Number(e.target.value) }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <Input value={newService.description} onChange={e => setNewService(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Prep tips (shown to client after booking)</label>
                  <Input value={newService.prep_tips} onChange={e => setNewService(f => ({ ...f, prep_tips: e.target.value }))} placeholder="e.g. Bring your manuscript" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Allowed modes</label>
                  <div className="flex gap-3">
                    {MODES.map(m => (
                      <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-700">
                        <input type="checkbox" checked={(newService.allowed_modes || []).includes(m)}
                          onChange={e => setNewService(f => ({ ...f, allowed_modes: e.target.checked ? [...(f.allowed_modes || []), m] : (f.allowed_modes || []).filter(x => x !== m) }))} />
                        {m === 'on_site' ? 'On-site' : 'Zoom'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddingService(false)}>Cancel</Button>
                <Button size="sm" disabled={!newService.name} onClick={() => createService.mutate(newService)}>Save Service</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}