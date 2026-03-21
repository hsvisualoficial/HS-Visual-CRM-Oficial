import React from 'react';
import { mockData } from '../data/mockData';

export const AIInsights: React.FC = () => {
  const { insights } = mockData;
  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="aura-glass rounded-xl overflow-hidden p-8 border-t border-t-primary/20 glow-primary">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em]">{insights.title}</h3>
        </div>
        <p className="text-white/80 leading-relaxed text-sm">
          Detectamos uma queda de <span className="text-primary font-bold">{insights.dropPercentage}</span> {insights.description}
        </p>
        <button className="mt-8 w-full py-4 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all">
          {insights.action}
        </button>
      </div>
    </div>
  );
};
