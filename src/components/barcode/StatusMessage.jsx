import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

const CONFIG = {
  success: { icon: CheckCircle2, color: '#3f7d3f', bg: 'rgba(63,125,63,0.1)', border: 'rgba(63,125,63,0.25)' },
  warning: { icon: AlertTriangle, color: '#9a6a1a', bg: 'rgba(180,130,40,0.1)', border: 'rgba(180,130,40,0.25)' },
  error: { icon: AlertCircle, color: '#a83232', bg: 'rgba(168,50,50,0.1)', border: 'rgba(168,50,50,0.25)' },
};

export default function StatusMessage({ message, type }) {
  if (!type || !message) return null;
  const cfg = CONFIG[type] || CONFIG.error;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {message}
    </motion.div>
  );
}