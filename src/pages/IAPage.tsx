import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { Topbar } from '../components/Topbar';
import { AIChatWindow } from '../components/AIChatWindow';
import { supabase } from '../lib/supabase';

export const IAPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes_onboarding')
          .select('*')
          .order('razao_social', { ascending: true });
        
        if (error) throw error;
        setClients(data || []);
        
        const urlClientId = searchParams.get('clientId');
        if (urlClientId) {
          setSelectedClientId(urlClientId);
        } else if (data && data.length > 0) {
          setSelectedClientId(data[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar clientes para IA:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [searchParams]);
  
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B9FF66]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden relative">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 md:pl-24 flex flex-col h-full p-4 md:p-10 pb-20 md:pb-10 gap-6 w-full max-w-[1600px] mx-auto overflow-y-auto">
        <Topbar title="Aura IA" subtitle="Sua Inteligência de Performance & Estratégia" />
        
        <div className="flex-1 flex h-full gap-6 min-h-0 overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 h-full flex flex-col min-w-0">
            <div className="flex-1 min-h-0 relative">
              <AIChatWindow 
                clientName={selectedClient?.razao_social || 'Selecionar Cliente'} 
                clientFocus={selectedClient?.tipo_imovel || 'Imobiliária'} 
                clientFunction={selectedClient?.funcao_cargo}
                clientCreci={selectedClient?.creci}
                contractValue={selectedClient?.valor_investimento}
              />
            </div>
          </div>

        {/* Context Sidebar (Right) */}
        <div className="hidden lg:flex flex-col w-80 space-y-4 pt-[4.5rem]">
          <div className="aura-glass p-6 rounded-xl border border-white/5 bg-black/40 glow-tertiary">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] uppercase tracking-widest text-[#B9FF66] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">radar</span>
                Cliente em Foco
              </h3>
              <select 
                value={selectedClientId || ''} 
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#B9FF66] font-plus-jakarta cursor-pointer max-w-[150px]"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.razao_social}</option>
                ))}
              </select>
            </div>
            
            {selectedClient && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] bg-gradient-to-tr from-[#B9FF66]/20 to-primary/5">
                    {selectedClient.logo_url ? (
                      <img loading="lazy" src={selectedClient.logo_url} alt="Logo" className="w-full h-full object-contain filter saturate-50 contrast-125 mix-blend-screen opacity-90 relative z-10" />
                    ) : (
                      <span className="text-[#B9FF66] font-bold text-lg relative z-10 opacity-70">{getInitials(selectedClient.razao_social)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold font-plus-jakarta text-lg truncate">{selectedClient.razao_social}</h4>
                    <p className="text-white/50 text-xs truncate uppercase tracking-widest">{selectedClient.status}</p>
                  </div>
                </div>
                
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-1">Serviço Principal</span>
                    <span className="text-sm font-semibold">{Array.isArray(selectedClient.servicos) ? selectedClient.servicos[0] : 'Tráfego Pago'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-1">Faturamento</span>
                    <span className="text-sm font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedClient.valor_investimento))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-1">Score Aura</span>
                    <span className="text-xl font-bold text-[#ffd700] p-1.5 rounded bg-[#ffd700]/5 border border-[#ffd700]/10 glow-gold inline-block mt-1">9.2</span>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
