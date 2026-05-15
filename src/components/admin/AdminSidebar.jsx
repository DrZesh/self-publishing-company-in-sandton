import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, BookOpen, Users, Settings, X } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Inbox', icon: Inbox, path: '/admin/submissions' },
  { label: 'Leads', icon: BookOpen, path: '/admin/leads' },
  { label: 'Contacts', icon: Users, path: '/admin/contacts' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: open ? 0 : '-100%',
        }}
        transition={{ duration: 0.2 }}
        className="fixed lg:static w-64 h-screen bg-white border-r border-[#ddd]/30 flex flex-col z-40 lg:z-auto"
      >
        {/* Logo */}
        <div className="h-16 border-b border-[#ddd]/30 flex items-center px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3 font-bold text-[#0B1220]">
            <div className="w-8 h-8 rounded-lg bg-[#B8955B]" />
            <span className="hidden sm:inline">Creative Books</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 hover:bg-[#f0f0f0] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#B8955B] text-white'
                    : 'text-[#2B2B2B] hover:bg-[#f5f5f5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#ddd]/30 p-4">
          <div className="text-xs text-[#2B2B2B]/60">
            <p className="font-medium">Owner</p>
            <p className="text-[#2B2B2B]/40 mt-1">admin@example.com</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}