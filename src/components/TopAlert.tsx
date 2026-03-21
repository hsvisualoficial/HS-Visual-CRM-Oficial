import React from 'react';
import { motion } from 'framer-motion';
import { mockData } from '../data/mockData';

export const TopAlert: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1 }}
      className="fixed bottom-6 right-6 z-[60] bg-[#0a0a0a]/80 backdrop-blur-2xl border border-[#ff4d4d]/30 rounded-2xl shadow-[0_10px_40px_rgba(255,77,77,0.15)] flex flex-col gap-3 p-5 w-80 group hover:border-[#ff4d4d]/50 transition-colors"
    >
      <div className="flex items-start gap-3 text-[#ff4d4d]">
        <div className="w-8 h-8 rounded-full bg-[#ff4d4d]/10 flex items-center justify-center shrink-0 border border-[#ff4d4d]/20 group-hover:bg-[#ff4d4d]/20 transition-colors">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
        </div>
        <div>
          <h4 className="text-[10px] font-extrabold tracking-widest uppercase mb-1">Atenção Necessária</h4>
          <p className="text-white/70 text-[11px] leading-tight font-medium">{mockData.alert.message}</p>
        </div>
      </div>
      <a 
        className="mt-2 bg-white/5 border border-white/10 hover:bg-[#ff4d4d]/20 hover:border-[#ff4d4d]/50 text-white px-4 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 w-full" 
        href={mockData.alert.actionUrl} 
        target="_blank" 
        rel="noreferrer"
      >
        <span className="material-symbols-outlined text-[16px]">task_alt</span>
        {mockData.alert.actionText}
      </a>
    </motion.div>
  );
};
