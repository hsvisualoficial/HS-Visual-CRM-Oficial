import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageContainer } from '../components/PageContainer';
import { Topbar } from '../components/Topbar';
import { useAppContext } from '../context/AppContext';

interface Cliente {
  id: string;
  razao_social: string;
  telefone: string;
  email: string;
  valor_investimento: number | null;
  plataforma_anuncio: string | null;
}

interface FinancialSummary {
  faturamento: number;
  despesas: number;
  lucro: number;
}

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

import { DateFilterRack } from '../components/DateFilterRack';

export const PerformancePage: React.FC = () => {
  const { settings, startDate, endDate, quickFilter } = useAppContext();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary>({ faturamento: 0, despesas: 0, lucro: 0 });
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Carrega lista de clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('clientes_onboarding')
          .select('id, razao_social, telefone, email, valor_investimento, plataforma_anuncio')
          .order('created_at', { ascending: false });
        setClients(data || []);
        if (data && data.length > 0) setSelectedClient(data[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Carrega dados financeiros do cliente selecionado + período (v36 Mirroring)
  useEffect(() => {
    if (!selectedClient) { setSummary({ faturamento: 0, despesas: 0, lucro: 0 }); return; }

    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const { data: entradas } = await supabase
          .from('financeiro')
          .select('valor')
          .eq('tipo', 'Entrada')
          .gte('data_vencimento', startDate)
          .lte('data_vencimento', endDate);

        const { data: saidas } = await supabase
          .from('financeiro')
          .select('valor')
          .eq('tipo', 'Saída')
          .gte('data_vencimento', startDate)
          .lte('data_vencimento', endDate);

        const faturamento = entradas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;
        const despesas = saidas?.reduce((s, r) => s + (Number(r.valor) || 0), 0) ?? 0;
        setSummary({ faturamento, despesas, lucro: faturamento - despesas });
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, [selectedClient, startDate, endDate]);

  const handleWhatsApp = () => {
    const phone = selectedClient?.telefone?.replace(/\D/g, '') || '';
    const nome = selectedClient?.razao_social?.split(' ')[0] || 'Cliente';
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const agencia = settings.agency_name || 'HS Visual Intelligence';
    
    const periodoFormatado = `de ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`;
    
    const msg = `*${saudacao}, ${nome}! 🚀*\n\n*Relatório de Performance v36*\n📅 *Período:* ${periodoFormatado}\n\n📊 *Agência:* ${agencia}\n👤 *Consultor Responsável:* HELDER BEZERRA FERREIRA\n\n💰 *Faturamento:* ${fmt(summary.faturamento)}\n📉 *Despesas:* ${fmt(summary.despesas)}\n✅ *Lucro Líquido:* ${fmt(summary.lucro)}\n💼 *Investimento:* ${fmt(selectedClient?.valor_investimento || 0)}\n\n_Qualquer dúvida estamos à disposição!_ 🎯`;
    
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      alert('Selecione um cliente com telefone cadastrado para enviar o relatório.');
    }
  };



  return (
    <PageContainer>
      <Topbar title="Performance Master" subtitle="Relatório de Resultados por Cliente" />

      <div className="space-y-8">
        {/* Régua de Filtros v36 */}
        <DateFilterRack />

        {/* Seletor de Cliente */}
        <div className="aura-glass rounded-2xl p-6 border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Cliente</label>
              {loading ? (
                <div className="h-8 bg-white/5 rounded animate-pulse w-48" />
              ) : clients.length === 0 ? (
                <p className="text-white/30 text-sm">Nenhum cliente cadastrado</p>
              ) : (
                <select
                  value={selectedClient?.id || ''}
                  onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
                  className="bg-transparent text-white border-none outline-none text-lg font-semibold w-full cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0a0a0a' }}>
                      {c.razao_social || 'Sem Nome'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">Plataforma</label>
              <p className="text-lg font-semibold text-white">
                {selectedClient?.plataforma_anuncio || <span className="text-white/30">—</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Financeiras Reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Faturamento', value: summary.faturamento, icon: 'trending_up', color: '#B9FF66' },
            { label: 'Despesas', value: summary.despesas, icon: 'trending_down', color: '#ff4444' },
            { label: 'Lucro Líquido', value: summary.lucro, icon: 'savings', color: summary.lucro >= 0 ? '#B9FF66' : '#ff4444' },
          ].map(card => (
            <div
              key={card.label}
              className="aura-glass p-7 rounded-2xl border border-white/5 flex flex-col gap-4 transition-all hover:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{card.label}</span>
                <span className="material-symbols-outlined text-sm" style={{ color: card.color }}>{card.icon}</span>
              </div>
              {loadingSummary ? (
                <div className="h-10 bg-white/5 rounded animate-pulse" />
              ) : (
                <p className="text-3xl md:text-4xl font-extrabold tracking-tighter" style={{ color: card.label === 'Despesas' ? '#ff6666' : 'white' }}>
                  {fmt(card.value)}
                </p>
              )}
              <p className="text-xs" style={{ color: card.color }}>
                {card.value === 0 ? 'Sem lançamentos no período' : `${new Date(startDate).toLocaleDateString()} — ${new Date(endDate).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>

        {/* Investimento do Cliente */}
        {selectedClient && (
          <div className="aura-glass rounded-2xl p-6 border border-[#ff00ff]/20 flex items-center gap-6">
            <span className="material-symbols-outlined text-[#ff00ff] text-3xl">account_balance</span>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Investimento Mensal Contratado</p>
              <p className="text-3xl font-extrabold tracking-tighter text-white">
                {selectedClient.valor_investimento ? fmt(selectedClient.valor_investimento) : <span className="text-white/30">Não informado</span>}
              </p>
            </div>
          </div>
        )}

        {/* Análise Estratégica — Estática Premium */}
        <div className="aura-glass rounded-2xl p-8 border border-white/5 space-y-6">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Análise Estratégica IA</p>
          <div className="space-y-5">
            {[
              { icon: '✅', color: '#B9FF66', label: 'Saúde Financeira', text: summary.lucro > 0 ? `Resultado positivo de ${fmt(summary.lucro)} no período selecionado. Continue monitorando.` : summary.lucro === 0 ? 'Sem lançamentos no período. Cadastre entrada e saídas no Financeiro.' : `Resultado negativo de ${fmt(Math.abs(summary.lucro))}. Revise as despesas do período.` },
              { icon: '📈', color: '#66FFED', label: 'Próximos Passos', text: 'Cadastre os investimentos em mídia na aba Financeiro para que o sistema calcule o ROI automaticamente.' },
              { icon: '🚀', color: '#ff00ff', label: 'Meta de Crescimento', text: 'Acompanhe o crescimento mensal pela Home. O sistema atualiza em tempo real ao registrar novos lançamentos.' },
            ].map(a => (
              <div key={a.label} className="flex gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}
                >
                  {a.icon}
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: a.color }}>{a.label}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          <button
            onClick={handleWhatsApp}
            className="md:col-span-2 h-16 rounded-2xl font-extrabold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff00ff, #ff4d9d)', boxShadow: '0 10px 30px rgba(255,0,255,0.25)' }}
          >
            <span className="text-xl">📲</span>
            Enviar Relatório por WhatsApp
          </button>
          <button
            disabled
            className="h-14 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Exportar PDF (em breve)
          </button>
          <button
            disabled
            className="h-14 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Copiar Link (em breve)
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
