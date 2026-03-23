import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const Topbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const [hasUpcoming, setHasUpcoming] = useState(false);
  const [count, setCount] = useState(0);
  const { settings } = useAppContext();

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

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Iniciais do nome como fallback do avatar
  const initials = settings.agency_name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'HS';

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-1">{title}</h1>
        {subtitle && <p className="text-white/40 font-medium uppercase text-[10px] tracking-widest">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-6">
        {/* Sino de Notificação (Sentinela) */}
        <div className="relative group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#ff00ff]/40 transition-all">
            <span className={`material-symbols-outlined text-2xl ${hasUpcoming ? 'text-[#ff00ff] animate-swing' : 'text-white/20'}`}>
              notifications
            </span>
          </div>
          {hasUpcoming && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff00ff] border-2 border-[#050505] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-white">{count}</span>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-white/5 hidden md:block"></div>
        
        <div className="flex items-center gap-4">
          {/* Nome da agência do Supabase */}
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">
              {settings.agency_name}
            </p>
            <p className="text-[8px] font-bold text-[#B9FF66] uppercase tracking-widest mt-1">
              {settings.user_email || 'Administrador'}
            </p>
          </div>
          {/* Avatar do Supabase ou iniciais */}
          <div className="w-12 h-12 rounded-full border-2 border-[#B9FF66]/30 overflow-hidden flex items-center justify-center bg-black">
            {settings.admin_avatar_url ? (
              <img
                src={settings.admin_avatar_url}
                className="w-full h-full object-cover rounded-full"
                alt="Admin"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full bg-[#B9FF66]/10 flex items-center justify-center">
                <span className="text-[11px] font-black text-[#B9FF66]">{initials}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
