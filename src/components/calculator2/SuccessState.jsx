import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessState({ data, onReset }) {
  const { clientInfo, pricing } = data;
  const firstName = clientInfo?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, stiffness: 100 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="font-heading text-3xl font-bold text-[#1A1208] mb-3">Quote sent, {firstName}!</h2>

        <p className="text-[#2C2C2C]/60 mb-2">
          Check your inbox — quote sent to <strong className="text-copper">{clientInfo?.email}</strong>.
        </p>
        <p className="text-[#2C2C2C]/50 text-sm mb-8">
          We'll be in touch within 24 hours with a personalised response.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-8 py-3 bg-copper text-white rounded-full font-semibold hover:bg-copper/90 transition-all shadow-md">
            Back to homepage
          </Link>
          <Link to="/selfpublishingpackagesinsouthafrica" className="px-8 py-3 border-2 border-copper text-copper rounded-full font-semibold hover:bg-copper/5 transition-all">
            Browse our services
          </Link>
        </div>

        <p className="mt-8 text-xs text-black/30">
          Want to tweak something?{' '}
          <button onClick={onReset} className="text-copper underline hover:no-underline">Start a new estimate</button>
        </p>
      </motion.div>
    </div>
  );
}