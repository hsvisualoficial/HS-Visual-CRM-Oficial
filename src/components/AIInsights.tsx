import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Insight {
  tipo: 'vencimento' | 'novo_cliente' | 'lucro' | 'vazio';
  titulo: string;
  mensagem: string;
  cor: string;
  icon: string;
}

export const AIInsights: React.FC = () => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildInsight = async () => {
      try {
        // 1. Verifica vencimentos próximos (próximos 3 dias)
        const hoje = new Date();
        const em3dias = new Date();
        em3dias.setDate(hoje.getDate() + 3);

        const { data: vencimentos } = await supabase
          .from('financeiro')
          .select('descricao, valor, data_vencimento')
          .eq('status', 'Pendente')
          .gte('data_vencimento', hoje.toISOString().split('T')[0])
          .lte('data_vencimento', em3dias.toISOString().split('T')[0])
          .order('data_vencimento', { ascending: true })
          .limit(1);

        if (vencimentos && vencimentos.length > 0) {
          const v = vencimentos[0];
          const dataFmt = new Date(v.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR');
          const valorFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valor);
          setInsight({
            tipo: 'vencimento',
            titulo: '⚠️ Vencimento Próximo',
            mensagem: `"${v.descricao || 'Lançamento'}" vence em ${dataFmt} — ${valorFmt}. Acesse o Financeiro para registrar o recebimento.`,
            cor: '#ffcc00',
            icon: 'schedule',
          });
          return;
        }

        // 2. Novo cliente recente
        const { data: novos } = await supabase
          .from('clientes_onboarding')
          .select('razao_social, created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        if (novos && novos.length > 0) {
          const horasAtras = Math.floor(
            (Date.now() - new Date(novos[0].created_at).getTime()) / (1000 * 60 * 60)
          );
          setInsight({
            tipo: 'novo_cliente',
            titulo: '✅ Novo Onboarding',
            mensagem: `${novos[0].razao_social} ingressou no sistema ${horasAtras < 24 ? `há ${horasAtras}h` : `há ${Math.floor(horasAtras / 24)} dia(s)`}. Confira os dados na aba Clientes.`,
            cor: '#B9FF66',
            icon: 'person_add',
          });
          return;
        }

        // 3. Sem dados — estado vazio
        setInsight({
          tipo: 'vazio',
          titulo: '🚀 Sistema Pronto',
          mensagem: 'Nenhum alerta ativo no momento. Cadastre clientes e lançamentos financeiros para que o sistema gere insights automáticos.',
          cor: '#ffffff33',
          icon: 'auto_awesome',
        });
      } catch (err) {
        console.error('Erro ao carregar insights:', err);
      } finally {
        setLoading(false);
      }
    };

    buildInsight();

    const channel = supabase
      .channel('ai_insights')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, buildInsight)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, buildInsight)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="lg:col-span-4 space-y-8">
      <div
        className="aura-glass rounded-xl overflow-hidden p-8 border-t-2 transition-all"
        style={{ borderColor: insight?.cor || '#B9FF66' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined" style={{ color: insight?.cor || '#B9FF66' }}>
            {loading ? 'hourglass_empty' : (insight?.icon || 'auto_awesome')}
          </span>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
            {loading ? 'Analisando...' : (insight?.titulo || 'Inteligência Aura')}
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-white/70 leading-relaxed text-sm">
            {insight?.mensagem}
          </p>
        )}

        <a
          href="/financeiro"
          className="mt-8 w-full py-4 rounded-full border text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all flex items-center justify-center gap-2"
          style={{ borderColor: `${insight?.cor}44`, color: insight?.cor || '#B9FF66' }}
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Ver Financeiro
        </a>
      </div>
    </div>
  );
};
