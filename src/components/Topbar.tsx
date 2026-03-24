import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const Topbar: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const [hasUpcoming, setHasUpcoming] = useState(false);
  const [count, setCount] = useState(0);
  const { settings } = useAppContext();

  const initials = settings.agency_name
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'HS';

  useEffect(() => {
    const check = async () => {
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
    check();
    const ch = supabase.channel('topbar_fin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, check)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-10"
      style={{ borderBottom: '1px solid #1F1F1F' }}>
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FFFFFF' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="font-medium uppercase text-[10px] tracking-widest" style={{ color: '#6B7280' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Sino de Notificação */}
        <div className="relative group cursor-pointer">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
            style={{ background: '#141414', border: `1px solid ${hasUpcoming ? 'rgba(224,17,131,0.3)' : '#1F1F1F'}` }}>
            <span className="material-symbols-outlined text-xl"
              style={{ color: hasUpcoming ? '#E01183' : '#4B5563' }}>
              notifications
            </span>
          </div>
          {hasUpcoming && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#E01183', border: '2px solid #0B0B0B' }}>
              <span className="text-[9px] font-black text-white">{count}</span>
            </div>
          )}
        </div>

        <div className="w-px h-8 hidden md:block" style={{ background: '#1F1F1F' }} />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {settings.agency_name}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: '#20C2AE' }}>
              {settings.user_email || 'Administrador'}
            </p>
          </div>
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: '2px solid rgba(224,17,131,0.25)', background: '#141414' }}>
            {settings.admin_avatar_url ? (
              <img src={settings.admin_avatar_url} className="w-full h-full object-cover rounded-full" alt="Admin"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <span className="text-[11px] font-black" style={{ color: '#E01183', fontFamily: 'Space Grotesk, sans-serif' }}>
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
