import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Topbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const [hasUpcoming, setHasUpcoming] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const checkUpcoming = async () => {
      const today = new Date();
      const in3Days = new Date();
      in3Days.setDate(today.getDate() + 3);
      
      const { data } = await supabase
        .from('financeiro')
        .select('id')
        .eq('status', 'Pendente')
        .eq('tipo', 'Entrada')
        .gte('data_vencimento', today.toISOString().split('T')[0])
        .lte('data_vencimento', in3Days.toISOString().split('T')[0]);
      
      setCount(data?.length || 0);
      setHasUpcoming(!!data && data.length > 0);
    };

    checkUpcoming();

    const channel = supabase
      .channel('topbar_finance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, checkUpcoming)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-1">{title}</h1>
        {subtitle && <p className="text-white/40 font-medium uppercase text-[10px] tracking-widest">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-6">
        {/* Notification Bell (Sentinela) */}
        <div className="relative group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-magenta/40 transition-all">
            <span className={`material-symbols-outlined text-2xl ${hasUpcoming ? 'text-magenta animate-swing' : 'text-white/20'}`}>
              notifications
            </span>
          </div>
          {hasUpcoming && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-magenta border-2 border-[#050505] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-white">{count}</span>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-white/5 hidden md:block"></div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
             <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">Helder Silva</p>
             <p className="text-[8px] font-bold text-magenta uppercase tracking-widest mt-1">Founding Director</p>
           </div>
            <div className="w-12 h-12 rounded-full border-2 border-magenta/20 p-0.5 bg-black overflow-hidden flex items-center justify-center">
              <img 
                src="https://ppwaxkfpbnhdrwiholdw.supabase.co/storage/v1/object/public/brand_assets/admin_avatar.png" 
                className="w-full h-full object-cover rounded-full" 
                alt="Admin" 
              />
            </div>
        </div>
      </div>
    </header>
  );
};
