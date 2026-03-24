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
    faturamento: 0,
    despesas: 0,
    lucro: 0,
    totalClientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('mensal');

  const fetchMetrics = async (p: Periodo) => {
    setLoading(true);
    try {
      const now = new Date();
      const from = p === 'mensal'
        ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        : new Date(now.getFullYear(), 0, 1).toISOString();
      const to = now.toISOString();

      // Faturamento (Entradas pagas)
      const { data: entradas } = await supabase
        .from('financeiro')
        .select('valor')
        .eq('tipo', 'Entrada')
        .eq('status', 'Pago')
        .gte('data_vencimento', from.split('T')[0])
        .lte('data_vencimento', to.split('T')[0]);

      // Despesas (Saídas)
      const { data: saidas } = await supabase
        .from('financeiro')
        .select('valor')
        .eq('tipo', 'Saída')
        .gte('data_vencimento', from.split('T')[0])
        .lte('data_vencimento', to.split('T')[0]);

      // Total de clientes
      const { count: totalClientes } = await supabase
        .from('clientes_onboarding')
        .select('id', { count: 'exact', head: true });

      const faturamento = entradas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;
      const despesas = saidas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;

      setMetrics({
        faturamento,
        despesas,
        lucro: faturamento - despesas,
        totalClientes: totalClientes ?? 0,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(periodo);

    // Realtime: atualiza ao lançar no Financeiro
    const channel = supabase
      .channel('dashboard_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, () => fetchMetrics(periodo))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, () => fetchMetrics(periodo))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [periodo]);

  const cards = [
    {
      label: 'Faturamento',
      value: fmt(metrics.faturamento),
      icon: 'trending_up',
      color: '#B9FF66',
      sub: metrics.faturamento === 0 ? 'Sem entradas no período' : 'Entradas pagas',
    },
    {
      label: 'Despesas',
      value: fmt(metrics.despesas),
      icon: 'trending_down',
      color: '#ff4444',
      sub: metrics.despesas === 0 ? 'Sem despesas no período' : 'Saídas registradas',
    },
    {
      label: 'Lucro Líquido',
      value: fmt(metrics.lucro),
      icon: metrics.lucro >= 0 ? 'savings' : 'warning',
      color: metrics.lucro >= 0 ? '#B9FF66' : '#ff4444',
      sub: `${metrics.totalClientes} cliente${metrics.totalClientes !== 1 ? 's' : ''} na base`,
    },
  ];

  return (
    <section className="space-y-4">
      {/* Filtro de Período */}
      <div className="flex items-center gap-2">
        {(['mensal', 'anual'] as Periodo[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              periodo === p
                ? 'bg-[#B9FF66] text-black'
                : 'bg-white/5 text-white/40 hover:text-white/70'
            }`}
          >
            {p === 'mensal' ? 'Este Mês' : 'Este Ano'}
          </button>
        ))}
        <span className="text-white/20 text-[10px] ml-2 uppercase tracking-widest">
          {periodo === 'mensal'
            ? new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
            : `Ano ${new Date().getFullYear()}`}
        </span>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="aura-glass p-8 rounded-xl flex flex-col justify-between min-h-[160px] group transition-all duration-500">
            <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">{card.label}</span>
            <div className="mt-4">
              {loading ? (
                <div className="h-10 bg-white/5 rounded-lg animate-pulse w-32" />
              ) : (
                <h2 className="text-4xl font-extrabold tracking-tighter text-white font-plus-jakarta" style={{ color: card.label === 'Despesas' ? '#ff6666' : 'white' }}>
                  {card.value}
                </h2>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-sm" style={{ color: card.color }}>{card.icon}</span>
                <span className="text-xs font-bold" style={{ color: card.color }}>{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
