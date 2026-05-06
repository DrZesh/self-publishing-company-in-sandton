import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/27000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
      whileHover={{ scale: 1.12, boxShadow: '0 12px 40px rgba(37, 211, 102, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.div>
      
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-green-400"
        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
    </motion.a>
  );
}