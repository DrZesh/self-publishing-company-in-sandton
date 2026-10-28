import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav({ tabs, activeTab, onTabChange, unreadCount }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeTabData = tabs.find(t => t.key === activeTab);

  return (
    <>
      {/* Mobile Tab Selector Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#B87333]/10">
        <div className="px-4 py-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1A1A2E] to-[#16213E] rounded-xl border border-[#B87333]/20"
          >
            <div className="flex items-center gap-3">
              {activeTabData && (
                <>
                  <activeTabData.icon className="w-5 h-5 text-[#D4A574]" />
                  <span className="font-semibold text-white">{activeTabData.label}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#B87333] text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
              {isOpen ? (
                <X className="w-5 h-5 text-[#D4A574]" />
              ) : (
                <Menu className="w-5 h-5 text-[#D4A574]" />
              )}
            </div>
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      onTabChange(tab.key);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white shadow-lg shadow-[#B87333]/30"
                        : "bg-[#1A1A2E]/50 text-gray-400 hover:bg-[#1A1A2E] hover:text-white border border-[#B87333]/10"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.urgent && (
                      <span className="w-2 h-2 bg-red-500 rounded-full ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}