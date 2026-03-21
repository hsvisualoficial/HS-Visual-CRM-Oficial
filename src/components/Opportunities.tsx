import React from 'react';
import { mockData } from '../data/mockData';

export const Opportunities: React.FC = () => {
  return (
    <div className="lg:col-span-8 space-y-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-2xl font-bold tracking-tight">Oportunidades</h3>
        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Ver Todos</button>
      </div>
      <div className="space-y-4">
        {mockData.opportunities.map((opt) => (
          <div key={opt.id} className={`aura-glass p-6 rounded-xl flex items-center justify-between ${opt.borderClass}`}>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5">
                <span className={`material-symbols-outlined text-2xl ${opt.iconColor}`}>{opt.icon}</span>
              </div>
              <div>
                <h4 className="text-lg font-bold">{opt.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60 font-bold tracking-widest uppercase">{opt.tag1}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${opt.tag2Icon ? 'text-tertiary' : 'text-white/40'}`}>
                    {opt.tag2Icon && <span className="material-symbols-outlined text-[12px]">{opt.tag2Icon}</span>}
                    {opt.tag2}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{opt.value}</p>
              <p className={`text-[10px] font-medium mt-1 ${opt.statusColor}`}>{opt.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
