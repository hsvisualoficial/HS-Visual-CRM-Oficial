import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FinancialMetrics {
  faturamento: number;
  despesas: number;
  lucro: number;
  totalClientes: number;
}

type Periodo = 'mensal' | 'anual';

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const HeaderMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    faturamento: 0, despesas: 0, lucro: 0, totalClientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('mensal');

  const fetchMetrics = async (p: Periodo) => {
    setLoading(true);
    try {
      const now = new Date();
      const from = p === 'mensal'
        ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        : new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const to = now.toISOString().split('T')[0];

      const [{ data: entradas }, { data: saidas }, { count }] = await Promise.all([
        supabase.from('financeiro').select('valor').eq('tipo', 'Entrada').eq('status', 'Pago')
          .gte('data_vencimento', from).lte('data_vencimento', to),
        supabase.from('financeiro').select('valor').eq('tipo', 'Saída')
          .gte('data_vencimento', from).lte('data_vencimento', to),
        supabase.from('clientes_onboarding').select('id', { count: 'exact', head: true }),
      ]);

      const faturamento = entradas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;
      const despesas = saidas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;
      setMetrics({ faturamento, despesas, lucro: faturamento - despesas, totalClientes: count ?? 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(periodo);
    const ch = supabase.channel('dashboard_metrics_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, () => fetchMetrics(periodo))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, () => fetchMetrics(periodo))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [periodo]);

  const cards = [
    { label: 'Faturamento', value: metrics.faturamento, color: '#20C2AE', icon: 'trending_up',
      empty: 'Sem entradas pagas no período' },
    { label: 'Despesas',    value: metrics.despesas,    color: '#E01183', icon: 'trending_down',
      empty: 'Sem despesas no período' },
    { label: 'Lucro Líquido', value: metrics.lucro,
      color: metrics.lucro >= 0 ? '#20C2AE' : '#E01183',
      icon: metrics.lucro >= 0 ? 'savings' : 'warning',
      empty: `${metrics.totalClientes} cliente${metrics.totalClientes !== 1 ? 's' : ''} na base` },
  ];

  return (
    <section className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-2">
        {(['mensal', 'anual'] as Periodo[]).map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
            style={{
              background: periodo === p ? '#E01183' : '#141414',
              color:      periodo === p ? '#fff'    : '#6B7280',
              border:     `1px solid ${periodo === p ? '#E01183' : '#1F1F1F'}`,
              fontFamily: 'Space Grotesk, sans-serif',
              boxShadow:  periodo === p ? '0 0 14px rgba(224,17,131,0.2)' : 'none',
            }}>
            {p === 'mensal' ? 'Este Mês' : 'Este Ano'}
          </button>
        ))}
        <span className="text-[10px] ml-2 uppercase tracking-widest" style={{ color: '#4B5563' }}>
          {periodo === 'mensal'
            ? new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
            : `Ano ${new Date().getFullYear()}`}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="p-7 rounded-2xl flex flex-col gap-3 transition-all"
            style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#6B7280' }}>
                {card.label}
              </span>
              <span className="material-symbols-outlined text-sm" style={{ color: card.color }}>{card.icon}</span>
            </div>
            {loading ? (
              <div className="h-10 rounded-lg animate-pulse" style={{ background: '#1F1F1F' }} />
            ) : (
              <p className="text-3xl md:text-4xl font-extrabold tracking-tighter"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FFFFFF' }}>
                {fmt(card.value)}
              </p>
            )}
            <p className="text-xs font-medium" style={{ color: card.color }}>
              {card.value === 0 ? card.empty : `Últimos dados — ${periodo === 'mensal' ? 'mês atual' : 'ano atual'}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
