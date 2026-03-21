import React from 'react';
import { motion } from 'framer-motion';

export interface FinancialStatCardProps {
  title: string;
  value: string;
  percentage?: string;
  isRevenue?: boolean;
}

export const FinancialStatCard: React.FC<FinancialStatCardProps> = ({ title, value, percentage, isRevenue }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`aura-glass p-8 rounded-xl border transition-all duration-500 hover:scale-[1.02] bg-black/40 ${isRevenue ? 'border-[#ffd700]/30 glow-gold' : 'border-primary/20 glow-primary'}`}
    >
      <span className="text-white/50 text-[10px] uppercase tracking-[0.25em] font-bold">{title}</span>
      <div className="mt-4 flex items-end justify-between">
        <h2 className={`text-5xl font-extrabold tracking-tighter font-plus-jakarta ${isRevenue ? 'text-[#ffd700]' : 'text-white'}`}>
          {value}
        </h2>
        {percentage && (
          <div className="flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            <span className="text-primary text-sm font-bold tracking-widest text-[#B9FF66]">{percentage}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
