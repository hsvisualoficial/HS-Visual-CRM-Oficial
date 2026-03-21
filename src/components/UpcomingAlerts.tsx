import React from 'react';
import { motion } from 'framer-motion';

interface UpcomingAlertsProps {
  upcoming: any[];
  onMarkAsPaid: (id: string) => void;
}

export const UpcomingAlerts: React.FC<UpcomingAlertsProps> = ({ upcoming, onMarkAsPaid }) => {
  if (!upcoming || upcoming.length === 0) return null;

  const handleWhatsApp = (tel: string, name: string, valor: number, venc: string) => {
    const msg = `Olá ${name}, Helder da HS Visual aqui. Passando para lembrar do vencimento da sua mensalidade de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)} para o dia ${new Date(venc).toLocaleDateString('pt-BR')}. Segue o link para acerto. Qualquer dúvida, estou à disposição!`;
    const cleanTel = tel?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/55${cleanTel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-coral text-xl animate-pulse">priority_high</span>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-coral/80">Vencimentos Críticos (Próximos 7 dias)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcoming.map((item) => (
          <div 
            key={item.id}
            className="relative overflow-hidden group aura-glass p-5 rounded-3xl border border-coral/20 bg-coral/5 backdrop-blur-xl transition-all hover:border-coral/40"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 blur-[50px] -mr-10 -mt-10" />
            
            <div className="relative flex flex-col justify-between h-full gap-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-coral/60">
                    {new Date(item.data_vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </p>
                  <span className="px-2 py-0.5 rounded-full bg-coral/20 border border-coral/30 text-[8px] font-black text-coral uppercase tracking-tighter">
                    Pendente
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-coral transition-colors line-clamp-1">
                  {item.clientes_onboarding?.razao_social || item.descricao}
                </h4>
                <p className="text-xl font-black tracking-tighter text-white/90 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button 
                  onClick={() => handleWhatsApp(item.clientes_onboarding?.telefone, item.clientes_onboarding?.razao_social, item.valor, item.data_vencimento)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  Cobrar
                </button>
                <button 
                  onClick={() => onMarkAsPaid(item.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all"
                  title="Dar Baixa Instantânea"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
