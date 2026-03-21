import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const HeaderMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalClients: 0,
    roas: 7.4
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes_onboarding')
          .select('valor_investimento, status');
        
        if (error) throw error;

        const totalClients = data?.length || 0;
        const totalRevenue = data?.reduce((acc, client: any) => {
          if (client.status === 'Ativo' && client.valor_investimento) {
            return acc + (typeof client.valor_investimento === 'number' ? client.valor_investimento : 0);
          }
          return acc;
        }, 0) || 0;

        setMetrics(prev => ({ ...prev, totalRevenue, totalClients }));
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Subscribe to changes
    const channel = supabase
      .channel('metrics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="aura-glass p-8 rounded-xl min-h-[180px] animate-pulse bg-white/5" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="aura-glass p-8 rounded-xl flex flex-col justify-between min-h-[180px] group hover:border-[#A3FF47]/30 transition-all duration-500">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Faturamento (Ativos)</span>
        <div className="mt-4">
          <h2 className="text-display-md font-extrabold tracking-tighter text-white font-plus-jakarta text-4xl">{formatCurrency(metrics.totalRevenue)}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="material-symbols-outlined text-[#A3FF47] text-sm">trending_up</span>
            <span className="text-[#A3FF47] text-xs font-bold">Dados Reais</span>
          </div>
        </div>
      </div>
      <div className="aura-glass p-8 rounded-xl flex flex-col justify-between min-h-[180px] group hover:border-[#00f2fe]/30 transition-all duration-500">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Total de Clientes</span>
        <div className="mt-4">
          <h2 className="text-display-md font-extrabold tracking-tighter text-white font-plus-jakarta text-4xl">{metrics.totalClients}</h2>
          <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
            <span className="material-symbols-outlined text-sm text-[#00f2fe]">group</span>
            <span>Base Supabase</span>
          </div>
        </div>
      </div>
      <div className="aura-glass p-8 rounded-xl flex flex-col justify-between min-h-[180px] border-l-2 border-l-[#A3FF47]/20 group hover:border-[#A3FF47]/50 transition-all duration-500">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Performance ROAS</span>
        <div className="mt-4">
          <h2 className="text-display-md font-extrabold tracking-tighter text-[#A3FF47] font-plus-jakarta text-4xl">{metrics.roas}x</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="material-symbols-outlined text-[#A3FF47] text-sm">insights</span>
            <span className="text-[#A3FF47] text-xs font-bold">Inteligência Aura</span>
          </div>
        </div>
      </div>
    </section>
  );
};
