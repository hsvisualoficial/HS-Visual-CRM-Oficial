import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const DateFilterRack: React.FC = () => {
  const { startDate, endDate, quickFilter, setGlobalPeriod } = useAppContext();
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  // Sincroniza campos locais quando o estado global muda (espelhamento)
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  const applyQuickFilter = (type: 'week' | 'month' | 'year') => {
    const start = new Date();
    const end = new Date();

    if (type === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira
      start.setDate(diff);
      // Fim da semana (domingo)
      end.setDate(start.getDate() + 6);
    } else if (type === 'month') {
      start.setDate(1);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
    } else if (type === 'year') {
      start.setMonth(0, 1);
      end.setMonth(11, 31);
    }

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];
    setGlobalPeriod(sStr, eStr, type);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setTempStart(start);
    setTempEnd(end);
    if (start && end) {
      setGlobalPeriod(start, end, 'period');
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-[#141414] p-2 rounded-2xl border border-[#1F1F1F] shadow-2xl">
      {/* Quick Filters */}
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
        {[
          { id: 'week', label: 'ESTA SEMANA' },
          { id: 'month', label: 'ESTE MÊS' },
          { id: 'year', label: 'ESTE ANO' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => applyQuickFilter(btn.id as any)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              quickFilter === btn.id
                ? 'bg-[#E01183] text-white shadow-[0_0_20px_rgba(224,17,131,0.4)]'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-white/10" />

      {/* Custom Period */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <label className="absolute -top-2 left-3 bg-[#141414] px-1 text-[8px] font-bold text-white/30 uppercase tracking-widest z-10">Início</label>
          <div className="flex items-center gap-2 bg-black/40 border border-[#1F1F1F] rounded-xl px-3 py-2 focus-within:border-[#E01183]/50 transition-all">
            <Calendar size={14} className="text-white/20" />
            <input
              type="date"
              value={tempStart}
              onChange={(e) => handleCustomDateChange(e.target.value, tempEnd)}
              className="bg-transparent text-white text-[11px] font-bold outline-none uppercase"
            />
          </div>
        </div>

        <div className="text-white/20 select-none">
          <ChevronDown size={14} className="-rotate-90" />
        </div>

        <div className="relative flex-1 md:flex-none">
          <label className="absolute -top-2 left-3 bg-[#141414] px-1 text-[8px] font-bold text-white/30 uppercase tracking-widest z-10">Fim</label>
          <div className="flex items-center gap-2 bg-black/40 border border-[#1F1F1F] rounded-xl px-3 py-2 focus-within:border-[#E01183]/50 transition-all">
            <Calendar size={14} className="text-white/20" />
            <input
              type="date"
              value={tempEnd}
              onChange={(e) => handleCustomDateChange(tempStart, e.target.value)}
              className="bg-transparent text-white text-[11px] font-bold outline-none uppercase"
            />
          </div>
        </div>

        {quickFilter === 'period' && (
          <div className="w-2 h-2 rounded-full bg-[#E01183] animate-pulse shadow-[0_0_10px_#E01183]" title="Filtro por Período Ativo" />
        )}
      </div>
    </div>
  );
};
