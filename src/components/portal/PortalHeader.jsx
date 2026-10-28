import React, { useState } from 'react';
import { Bell, Calendar, Upload, Star, MessageSquare, User, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';

export default function PortalHeader({ contact, notifications, onNavigate, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-gradient-to-r from-[#0F0F0F]/95 via-[#1A1A2E]/90 to-[#16213E]/95 border-b border-[#B87333]/20 shadow-2xl shadow-[#B87333]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('overview')}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B87333] to-[#D4A574] rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#B87333] via-[#D4A574] to-[#B87333] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#B87333]/40 transform group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">Creative Books SA</h1>
              <p className="text-xs text-[#D4A574]/80 font-medium uppercase tracking-wider">Client Portal</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-[#B87333]/20 hover:to-[#D4A574]/20 rounded-xl border border-gray-700/50 hover:border-[#B87333]/40 transition-all duration-300 group"
              >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#D4A574] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 shadow-lg shadow-[#B87333]/40">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl border border-[#B87333]/20 shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-800/50">
                    <h3 className="font-bold text-white text-sm">Notifications</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-800/30 hover:bg-[#B87333]/5 transition-colors ${!notif.read ? 'bg-[#B87333]/5' : ''}`}
                        >
                          <p className="text-xs text-white font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-gray-500 mt-2">{new Date(notif.created_at).toLocaleDateString('en-ZA')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => onNavigate('appointments')}
              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-[#B87333]/20 hover:to-[#D4A574]/20 rounded-xl border border-gray-700/50 hover:border-[#B87333]/40 transition-all duration-300 group"
              title="Book Appointment"
            >
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-[#D4A574] transition-colors" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-2 pr-3 bg-gradient-to-br from-[#B87333]/10 to-[#D4A574]/10 hover:from-[#B87333]/20 hover:to-[#D4A574]/20 rounded-xl border border-[#B87333]/20 hover:border-[#B87333]/40 transition-all duration-300"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#B87333] to-[#D4A574] rounded-full flex items-center justify-center shadow-lg shadow-[#B87333]/30">
                  <span className="text-sm font-bold text-white">
                    {contact?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white">{contact?.full_name || 'Client'}</p>
                  <p className="text-[10px] text-gray-400">{contact?.email || 'client@email.com'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl border border-[#B87333]/20 shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-800/50">
                    <p className="text-sm font-bold text-white">{contact?.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{contact?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { onNavigate('profile'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#B87333]/10 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('settings'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#B87333]/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}