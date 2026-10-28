import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function AppointmentsTab({ appointments = [], contact = {}, portalToken }) {
  const [selectedType, setSelectedType] = React.useState('Discovery Call');
  const [selectedMode, setSelectedMode] = React.useState('zoom');
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('09:00');
  const [note, setNote] = React.useState('');
  const [requesting, setRequesting] = React.useState(false);

  const appointmentTypes = [
    'Discovery Call',
    'Quote Discussion',
    'Project Update Call',
    'Cover Design Review',
    'Proof Approval Call',
    'Final Collection/Delivery Call',
  ];

  const handleRequestAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }
    
    setRequesting(true);
    try {
      const result = await platform.functions.invoke('portalAppointments', {
        action: 'create_appointment',
        contact_id: contact.id,
        service_name: selectedType,
        mode: selectedMode,
        date: selectedDate,
        start_time: selectedTime,
        client_note: note,
        portal_token: portalToken,
      });
      
      if (result.data.error) {
        alert('Failed to book: ' + result.data.error);
      } else {
        alert('Appointment request sent! We will confirm shortly.');
        setSelectedDate('');
        setSelectedTime('09:00');
        setNote('');
      }
    } catch (error) {
      console.error('Appointment booking error:', error);
      alert('Failed to book appointment: ' + (error.response?.data?.error || error.message));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Book New Appointment - Compact & Responsive */}
      <div className="rounded-2xl border p-5 transition-all bg-white shadow-lg" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Book Appointment
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-300"
            >
              {appointmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Mode</label>
            <select 
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-300"
            >
              <option value="zoom">Video Call</option>
              <option value="on_site">In-Person</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-300"
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Time</label>
            <select 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-300"
            >
              <option>09:00</option>
              <option>10:00</option>
              <option>11:00</option>
              <option>14:00</option>
              <option>15:00</option>
              <option>16:00</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3">
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Notes (optional)</label>
          <textarea 
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-300 resize-none"
            placeholder="Brief description..."
          />
        </div>
        
        <button 
          onClick={handleRequestAppointment}
          disabled={requesting}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 text-sm"
        >
          {requesting ? 'Sending...' : 'Request Appointment'}
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-lg" style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Your Appointments
        </h3>
        
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No appointments scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-md" style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{apt.service_name}</h4>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(apt.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.start_time}
                      </span>
                      <span className="flex items-center gap-1">
                        {apt.mode === 'zoom' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {apt.mode === 'zoom' ? 'Video Call' : 'In-Person'}
                      </span>
                    </div>
                    {apt.client_note && (
                      <p className="text-xs text-gray-600 mt-2 italic">"{apt.client_note}"</p>
                    )}
                  </div>
                  
                  {apt.status === 'approved' && apt.zoom_link && (
                    <a
                      href={apt.zoom_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Join Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    'pending': { icon: Clock, color: 'bg-yellow-500/20 text-yellow-400' },
    'approved': { icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
    'declined': { icon: XCircle, color: 'bg-red-500/20 text-red-400' },
    'cancelled': { icon: XCircle, color: 'bg-gray-500/20 text-gray-400' },
    'completed': { icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
  };
  
  const { icon: Icon, color } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}