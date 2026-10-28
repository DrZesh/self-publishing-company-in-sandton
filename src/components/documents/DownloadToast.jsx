import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export default function DownloadToast({ title, onDismiss }) {
  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-5 py-3.5 max-w-[92vw]"
          style={{
            background: 'rgba(15,20,34,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(184,149,91,0.4)',
            boxShadow: '0 16px 44px rgba(0,0,0,0.5), 0 0 30px rgba(184,149,91,0.15)',
            borderRadius: '14px',
          }}
        >
          <CheckCircle2 className="w-5 h-5 text-[#D4AF72] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Your download has started</p>
            <p className="text-xs text-white/45 truncate">{title}</p>
          </div>
          <button onClick={onDismiss} className="ml-1 text-white/40 hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}