import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../lib/supabase';

export const PerformancePage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes_onboarding')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
      if (data && data.length > 0) {
        setSelectedClient(data[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = selectedClient?.telefone?.replace(/\D/g, '') || '';
    const nome = selectedClient?.razao_social || 'Cliente';
    const msg = `*Relatório Semanal: ${nome}* 🚀\n\nOlá! Segue a performance consolidada das campanhas:\n\n*Campanha:* Performance Master\n💬 142 Conversas Totais\n💰 Custo médio R$ 4,50\n📈 R$ 639,00 Investidos\n\n_Quantas dessas conversas avançaram para o fechamento?_`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] font-['Manrope'] pb-32 md:pb-0 md:pl-20 selection:bg-[#FF0080] selection:text-white">
      <Sidebar />
      <main className="pt-24 md:pt-16 px-6 max-w-2xl mx-auto space-y-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-10 h-10 rounded-full border-2 border-[#FF0080] border-t-transparent animate-spin"></div>
            <span className="text-white/40 font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-[0.2em]">Sincronizando Meta Ads API...</span>
          </div>
        ) : (
          <>
        {/* Header Info */}
        <section className="space-y-2">
          <div className="flex flex-col">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.4em] text-[#FF0080] font-extrabold mb-3">Relatório Premium</span>
            <h2 className="font-['Space_Grotesk'] font-bold text-3xl tracking-tight text-white leading-tight">Performance Master</h2>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00FFD1] text-base">calendar_today</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.15em] text-[#8E8E93] font-bold">Últimos 7 Dias</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider text-[#8E8E93]/40">Powered by Meta Ads API</span>
          </div>
        </section>

        {/* Client & Campaign Selectors */}
        <section className="flex flex-col sm:flex-row gap-4 z-10 relative">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#8E8E93] font-bold mb-2">Empresa (Cliente)</p>
            <select 
              className="w-full bg-transparent text-white outline-none font-['Space_Grotesk'] text-lg cursor-pointer"
              value={selectedClient?.id || ''}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value))}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#121212]">{c.razao_social || c.nome_fantasia || 'Sem Nome'}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#8E8E93] font-bold mb-2">Campanha (Simulada)</p>
            <select className="w-full bg-transparent text-white outline-none font-['Space_Grotesk'] text-lg cursor-pointer">
              <option className="bg-[#121212]">Performance Master (Ativa)</option>
              <option className="bg-[#121212]">Remarketing Geral</option>
            </select>
          </div>
        </section>

        {/* Main Metrics Bento */}
        <section className="grid grid-cols-2 gap-4">
          {/* Featured Large Card */}
          <div className="col-span-2 glass-card rounded-3xl p-8 gradient-border-magenta-subtle overflow-hidden relative">
            <div className="absolute -right-8 -top-8 opacity-[0.02]">
              <span className="material-symbols-outlined text-[180px]">hub</span>
            </div>
            <div className="flex justify-between items-start mb-1">
              <p className="font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-[0.2em] text-[#FF0080]/80 font-black">Conversas Ativas</p>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#00FFD1]/10 rounded-full border border-[#00FFD1]/20">
                <span className="material-symbols-outlined text-[#00FFD1] text-xs">trending_up</span>
                <span className="text-[#00FFD1] font-['Plus_Jakarta_Sans'] text-[10px] font-black">+12%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-['Space_Grotesk'] text-7xl font-bold tracking-tighter text-white neon-glow-magenta-subtle">142</span>
            </div>
            <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8E8E93]/50">01 Set — 07 Set</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#00FFD1]/70 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] animate-pulse"></span> Sincronizado
              </span>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6 space-y-1">
            <p className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-widest text-[#8E8E93] font-black">Custo por Conv.</p>
            <p className="font-['Space_Grotesk'] text-2xl font-bold text-white">R$ 4,50</p>
          </div>
          <div className="glass-card rounded-3xl p-6 space-y-1">
            <p className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-widest text-[#8E8E93] font-black">Total Investido</p>
            <p className="font-['Space_Grotesk'] text-2xl font-bold text-white">R$ 639,00</p>
          </div>
          {/* Tertiary Row */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div className="bg-[#1A1A1A]/40 rounded-2xl p-4 border border-white/5">
              <p className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-tighter text-[#8E8E93]/60 font-bold mb-0.5">Alcance</p>
              <p className="font-['Space_Grotesk'] text-lg font-bold text-white">24.5k</p>
            </div>
            <div className="bg-[#1A1A1A]/40 rounded-2xl p-4 border border-white/5">
              <p className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-tighter text-[#8E8E93]/60 font-bold mb-0.5">Impressões</p>
              <p className="font-['Space_Grotesk'] text-lg font-bold text-white">45.2k</p>
            </div>
            <div className="bg-[#1A1A1A]/40 rounded-2xl p-4 border border-white/5">
              <p className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-tighter text-[#00FFD1]/60 font-bold mb-0.5">Saldo Disp.</p>
              <p className="font-['Space_Grotesk'] text-lg font-bold text-[#00FFD1]">R$ 1.250</p>
            </div>
          </div>
        </section>

        {/* Performance Score & Trend */}
        <section className="flex gap-4 items-stretch">
          <div className="flex-1 glass-card rounded-3xl p-7 flex items-center justify-between border border-white/10">
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.2em] text-[#8E8E93] font-black mb-4">Campanha Score</p>
              <div className="flex items-center gap-4">
                <span className="font-['Space_Grotesk'] text-6xl font-black text-[#FF0080] neon-glow-magenta-subtle">8.2</span>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-white">Executivo</p>
                  <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#8E8E93] uppercase">Benchmark</p>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A]/80 flex items-center justify-center relative border border-white/5">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full p-1">
                <circle className="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-[#FF0080]/60" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="32" strokeLinecap="round" strokeWidth="4"></circle>
              </svg>
              <span className="material-symbols-outlined text-[#FF0080] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="w-[35%] bg-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-center border border-white/5">
            <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.2em] text-[#00FFD1] font-black mb-1">Tendência</p>
            <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#00FFD1]">+8%</p>
            <div className="mt-4 p-2 bg-[#00FFD1]/5 border border-[#00FFD1]/20 rounded-xl w-fit">
              <span className="material-symbols-outlined text-[#00FFD1] text-xl leading-none">trending_up</span>
            </div>
          </div>
        </section>

        {/* Conversion Funnel */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white">Funil de Conversão</h3>
            <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-widest text-[#8E8E93]">Taxas de Eficiência</span>
          </div>
          <div className="space-y-4">
            <div className="funnel-step bg-[#1A1A1A]/50 rounded-2xl p-5 flex items-center justify-between border border-white/5">
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.15em] text-[#8E8E93]/80 font-black mb-0.5">Impressões</p>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-white">45.200</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-black text-[#FF0080] px-3 py-1 bg-[#FF0080]/10 rounded-full border border-[#FF0080]/20">54% Alcance</span>
              </div>
            </div>
            <div className="funnel-step bg-[#1A1A1A]/50 rounded-2xl p-5 flex items-center justify-between border border-white/5">
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.15em] text-[#8E8E93]/80 font-black mb-0.5">Alcance Único</p>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-white">24.500</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-black text-[#00FFD1] px-3 py-1 bg-[#00FFD1]/10 rounded-full border border-[#00FFD1]/20">0.58% CTR</span>
              </div>
            </div>
            <div className="funnel-step bg-[#FF0080]/10 rounded-2xl p-6 flex items-center justify-between border border-[#FF0080]/30 shadow-[0_10px_30px_-10px_rgba(255,0,128,0.2)]">
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.15em] text-[#FF0080] font-black mb-0.5">Conversas Geradas</p>
                <p className="font-['Space_Grotesk'] text-3xl font-black text-white">142</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FF0080] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Analysis */}
        <section className="glass-card rounded-3xl p-8 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="bg-[#1A1A1A] text-[#F2F2F2] border border-white/10 font-['Plus_Jakarta_Sans'] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Análise Estratégica AI</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FFD1]/10 flex items-center justify-center shrink-0 border border-[#00FFD1]/20">
                <span className="material-symbols-outlined text-[#00FFD1] text-base">check_circle</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] font-black text-[#00FFD1] uppercase tracking-widest mb-1">Pontos Fortes</p>
                <p className="text-[#F2F2F2]/80 text-sm leading-relaxed">Forte engajamento no criativo B; custo por clique 15% abaixo da média do setor.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF4D4D]/10 flex items-center justify-center shrink-0 border border-[#FF4D4D]/20">
                <span className="material-symbols-outlined text-[#FF4D4D] text-base">error</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] font-black text-[#FF4D4D] uppercase tracking-widest mb-1">Oportunidade</p>
                <p className="text-[#F2F2F2]/80 text-sm leading-relaxed">Otimizar conversão de alcance na quarta-feira via agendamento de orçamento.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF0080]/10 flex items-center justify-center shrink-0 border border-[#FF0080]/20">
                <span className="material-symbols-outlined text-[#FF0080] text-base">rocket</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] font-black text-[#FF0080] uppercase tracking-widest mb-1">Próximos Passos</p>
                <p className="text-[#F2F2F2]/80 text-sm leading-relaxed">Escalar público Lookalike e testar nova CTA de urgência no topo do funil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prediction Banner */}
        <section className="bg-[#1A1A1A] rounded-3xl p-6 border-l-4 border-[#00FFD1] flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#00FFD1]/5 flex items-center justify-center border border-[#00FFD1]/10 shrink-0">
            <span className="material-symbols-outlined text-[#00FFD1] text-2xl">analytics</span>
          </div>
          <div>
            <p className="font-['Manrope'] text-[13px] text-white/90 leading-snug">
              Projeção 30 dias: Estimamos gerar <span className="text-[#00FFD1] font-black">4.260 conversas</span> mantendo o investimento atual.
            </p>
          </div>
        </section>

        {/* WhatsApp Preview Card */}
        <section className="space-y-4">
          <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.3em] text-[#8E8E93]/60 font-black px-2">Preview de Envio (WhatsApp)</p>
          <div className="bg-[#1A1A1A]/30 rounded-3xl p-8 border border-white/5 relative shadow-inner overflow-hidden">
            <div className="space-y-5 font-['Manrope'] text-[14px] text-white/90">
              <p className="font-['Space_Grotesk'] font-bold text-[#FF0080] text-lg tracking-tight">Relatório Semanal: {selectedClient?.razao_social?.split(' ')[0] || 'Cliente'} 🚀</p>
              <p className="text-sm opacity-80">Olá! Segue a performance consolidada das campanhas:</p>
              <div className="bg-[#050505]/40 p-6 rounded-2xl border border-white/5 space-y-3">
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#8E8E93] font-black border-b border-white/5 pb-2 mb-3">
                  Campanha: <span className="text-[#FF0080]">Performance Master</span>
                </p>
                <ul className="space-y-3 font-medium text-sm">
                  <li className="flex items-center gap-3"><span className="text-lg">💬</span><span>142 Conversas Totais</span></li>
                  <li className="flex items-center gap-3"><span className="text-lg">💰</span><span>Custo médio R$ 4,50</span></li>
                  <li className="flex items-center gap-3"><span className="text-lg">📈</span><span>R$ 639,00 Investidos</span></li>
                </ul>
              </div>
              <p className="text-sm italic opacity-60">Quantas dessas conversas avançaram para o fechamento?</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-3 pb-12">
          <button onClick={handleWhatsApp} className="col-span-2 btn-premium-magenta hover:brightness-110 active:scale-95 transition-all h-16 rounded-2xl flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-white text-xl">send</span>
            <span className="font-['Space_Grotesk'] font-black text-white uppercase tracking-wider text-xs">Enviar Relatório Executivo</span>
          </button>
          <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] active:scale-95 transition-all h-14 rounded-xl flex items-center justify-center gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[#F2F2F2]/60 text-xl">picture_as_pdf</span>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] uppercase tracking-widest text-[#F2F2F2]/80">Exportar PDF</span>
          </button>
          <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] active:scale-95 transition-all h-14 rounded-xl flex items-center justify-center gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[#F2F2F2]/60 text-xl">link</span>
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] uppercase tracking-widest text-[#F2F2F2]/80">Copiar Link</span>
          </button>
        </section>

        {/* Footer */}
        <footer className="pb-12 text-center space-y-4">
          <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#8E8E93]/40 uppercase tracking-[0.25em] leading-relaxed max-w-[80%] mx-auto">
            Relatório de Performance Gerado via MetricZap Engine • v2.4.0 High-End
          </p>
          <div className="flex justify-center gap-6 text-[8px] font-['Plus_Jakarta_Sans'] uppercase tracking-widest text-[#8E8E93]/50 font-bold">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00FFD1]"></span> Tempo Real</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#FF0080]"></span> Meta Official Partner</span>
          </div>
        </footer>
        </>
        )}
      </main>
      <MobileNav />
    </div>
  );
};
