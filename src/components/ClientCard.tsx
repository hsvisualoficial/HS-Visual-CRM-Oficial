import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ClientCardProps {
  id: string;
  nome: string;
  cnpj_cpf: string;
  empresa: string;
  status?: string;
  created_at?: string;
  logo_url?: string;
  servicos?: string[];
  creci?: string;
  email?: string;
  funcao?: string;
  // Novos campos v40 (n8n focus)
  resumo_ia?: string;
  status_lead?: string;
  imobiliaria_nome?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onGenerateScript: () => void;
  onGenerateContract: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ 
  id,
  nome, 
  cnpj_cpf,
  empresa, 
  status = 'Pendente',
  created_at, 
  logo_url, 
  servicos, 
  creci,
  email,
  funcao,
  resumo_ia,
  status_lead,
  imobiliaria_nome,
  onView, 
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateScript,
  onGenerateContract
}) => {
  const [showAI, setShowAI] = useState(false);
  const formattedDate = created_at ? new Date(created_at).toLocaleDateString('pt-BR') : '---';
  
  const statusColors: Record<string, string> = {
    'Ativo': '#20C2AE', // Turquesa Clean v43
    'Pendente': '#FFD700',
    'Atrasado': '#FF4B2B',
    'Inativo': '#94a3b8'
  };

  const currentColor = statusColors[status] || statusColors['Pendente'];

  const handleRestartFunnel = async () => {
    // URL do n8n que o Helder irá configurar
    const N8N_WEBHOOK_URL = 'https://n8n.seudominio.com/webhook/funnel-restart';
    try {
      if (!confirm(`Deseja reiniciar o funil de qualificação para ${nome}?`)) return;
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: id, 
          action: 'RESTART_FUNNEL',
          executor: 'HELDER BEZERRA FERREIRA'
        })
      });
      
      if (response.ok) alert('Funil Reiniciado via n8n! ✅');
      else throw new Error();
    } catch {
      alert('Configuração de Webhook n8n pendente ou erro de conexão.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: '#E01183' }}
      className="p-10 relative group transition-all duration-500 bg-[#141414] border border-[#1F1F1F] rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
      style={{ borderLeft: `2px solid #E01183` }}
    >
      {/* Selo de Situação */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <div className="text-right">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] block text-white/10">Início</span>
          <span className="text-[10px] font-black tracking-tight text-white/40">{formattedDate}</span>
        </div>
        <button 
          onClick={onToggleStatus}
          className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all"
          style={{ 
            backgroundColor: `${currentColor}05`, 
            borderColor: `${currentColor}15`,
            color: currentColor
          }}
        >
          {status}
        </button>
      </div>

      <div className="flex flex-col gap-8 mb-8 relative">
        {/* Foto Arredondada - Posição Estática para evitar sobreposição */}
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#E01183]/40 to-transparent shrink-0 shadow-[0_10px_30px_rgba(224,17,131,0.1)]">
          <div className="w-full h-full rounded-full bg-[#0B0B0B] overflow-hidden flex items-center justify-center border-2 border-[#141414]">
            <img 
              src={logo_url || 'https://via.placeholder.com/150'} 
              alt={nome}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="font-bold text-2xl tracking-tighter text-white leading-tight font-['Space_Grotesk']">{nome}</h3>
            {/* Brain Icon - v43 Toggle IA Summary */}
            <button 
              onClick={() => setShowAI(!showAI)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(32,194,174,0.1)] ${showAI ? 'bg-[#20C2AE] text-black' : 'bg-[#20C2AE]/10 text-[#20C2AE] hover:bg-[#20C2AE] hover:text-black'}`}
              title="Ver Inteligência Multimodal"
            >
              <span className="material-symbols-outlined text-lg">psychology</span>
            </button>
          </div>
          
          {imobiliaria_nome && (
            <p className="text-[#20C2AE] text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">location_city</span> {imobiliaria_nome}
            </p>
          )}

          <div className="flex flex-col gap-1 text-[11px] font-medium text-white/40 font-['Plus_Jakarta_Sans']">
            <p className="flex items-center gap-2">
               <span className="material-symbols-outlined text-xs">fingerprint</span> {cnpj_cpf}
            </p>
            <p className="flex items-center gap-2">
               <span className="material-symbols-outlined text-xs">public</span> {empresa}
            </p>
          </div>
          
          {status_lead && (
            <div className="mt-5">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#20C2AE]">
                {status_lead === 'Qualificado' ? '✅ Qualificado' : `🤖 ${status_lead}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* IA Expansion - v43 Optimized */}
      <AnimatePresence>
        {showAI && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] relative shadow-inner">
              <div className="absolute top-5 right-5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#20C2AE] shadow-[0_0_10px_#20C2AE] animate-pulse" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#20C2AE] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">robot_2</span>
                Ecossistema de Inteligência
              </h4>
              <p className="text-[13px] text-[#F0F0F0]/80 leading-relaxed font-['Plus_Jakarta_Sans'] italic">
                {resumo_ia || "Aguardando gatilho do anúncio Meta para gerar análise multimodal estratégica."}
              </p>
              
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                 <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em]">Auth: Helder Bezerra Ferreira</span>
                 <button 
                  onClick={handleRestartFunnel}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E01183]/10 border border-[#E01183]/20 text-[#E01183] text-[9px] font-black uppercase tracking-widest hover:bg-[#E01183] hover:text-white transition-all shadow-lg shadow-[#E01183]/5"
                 >
                   <span className="material-symbols-outlined text-sm">restart_alt</span>
                   Reiniciar Funil
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col gap-2.5 border-l border-[#1F1F1F] pl-6 mb-8">
        {funcao && (
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-white/10">work</span>
            <p className="text-[11px] text-[#20C2AE]/80 font-bold uppercase tracking-[0.1em]">{funcao}</p>
          </div>
        )}
        {creci && (
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-white/10">badge</span>
            <p className="text-[11px] text-white/60 font-bold font-mono tracking-wider">CRECI: {creci}</p>
          </div>
        )}
      </div>

      {/* Serviços - Pill Style */}
      <div className="mb-10 flex flex-wrap gap-2.5">
        {servicos?.slice(0, 3).map(s => (
          <span key={s} className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-[#0B0B0B] text-white/40 border border-[#1F1F1F] shadow-sm">
            {s}
          </span>
        ))}
      </div>

      {/* Ações Rodapé - Premium Refined v43 */}
      <div className="flex items-center justify-between pt-8 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-4">
          <button 
            onClick={onView}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#F0F0F0] text-black hover:bg-[#E01183] hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.1em] shadow-[0_10px_40px_rgba(240,240,240,0.1)]"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Dossiê
          </button>
          <button 
            onClick={onGenerateContract}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/5 text-[#F0F0F0]/60 hover:border-[#E01183]/40 hover:text-[#E01183] transition-all text-[10px] font-black uppercase tracking-[0.1em]"
          >
            <span className="material-symbols-outlined text-base">description</span>
            Contrato
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onEdit}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-white/30 hover:text-[#20C2AE] hover:border-[#20C2AE]/30 transition-all"
            title="Editar"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button 
            onClick={onDelete}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
            title="Excluir"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
