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
    'Ativo': '#A3FF47',
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
      className="p-8 relative group transition-all duration-500 bg-[#0B0B0B] border border-white/5 rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
      style={{ borderLeft: `2px solid #E01183` }}
    >
      {/* Selo de Situação */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <div className="text-right">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] block text-white/20">Início</span>
          <span className="text-[10px] font-black tracking-tight text-white/40">{formattedDate}</span>
        </div>
        <button 
          onClick={onToggleStatus}
          className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all"
          style={{ 
            backgroundColor: `${currentColor}10`, 
            borderColor: `${currentColor}20`,
            color: currentColor
          }}
        >
          {status}
        </button>
      </div>

      <div className="flex gap-6 mb-6 relative">
        {/* Foto Arredondada */}
        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[#E01183] to-transparent shrink-0">
          <div className="w-full h-full rounded-full bg-[#0B0B0B] overflow-hidden flex items-center justify-center border-2 border-[#0B0B0B]">
            <img 
              src={logo_url || 'https://via.placeholder.com/150'} 
              alt={nome}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 pt-2">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-xl tracking-tight text-white leading-none truncate max-w-[180px]">{nome}</h3>
            {/* Brain Icon - v40 Toggle IA Summary */}
            <button 
              onClick={() => setShowAI(!showAI)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(163,255,71,0.2)] ${showAI ? 'bg-[#A3FF47] text-black' : 'bg-[#A3FF47]/10 text-[#A3FF47] hover:bg-[#A3FF47] hover:text-black'}`}
              title="Ver Inteligência Multimodal"
            >
              <span className="material-symbols-outlined text-base">psychology</span>
            </button>
          </div>
          {imobiliaria_nome && (
            <p className="text-[#A3FF47] text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_city</span> {imobiliaria_nome}
            </p>
          )}
          <p className="text-[10px] font-medium text-white/40 mb-1">{cnpj_cpf}</p>
          <div className="flex items-center justify-between mt-3">
             <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#20C2AE] truncate">{empresa}</p>
             {status_lead && (
               <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
                 {status_lead === 'Qualificado' ? '✅ Qualificado' : `🤖 ${status_lead}`}
               </span>
             )}
          </div>
        </div>
      </div>

      {/* IA Expansion - v40 n8n focus */}
      <AnimatePresence>
        {showAI && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative">
              <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#A3FF47]" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3FF47] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">robot_2</span>
                Ecossistema n8n Intelligence
              </h4>
              <p className="text-xs text-white/70 leading-relaxed font-medium italic">
                {resumo_ia || "Nenhum dado capturado pelo funil multimodal até o momento. Aguardando gatilho Meta."}
              </p>
              
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                 <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">Auth: Helder Bezerra Ferreira</span>
                 <button 
                  onClick={handleRestartFunnel}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E01183]/10 border border-[#E01183]/20 text-[#E01183] text-[9px] font-black uppercase tracking-widest hover:bg-[#E01183] hover:text-white transition-all"
                 >
                   <span className="material-symbols-outlined text-sm">restart_alt</span>
                   Reiniciar Funil
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col gap-1.5 border-l border-white/5 pl-4 mb-4">
        {funcao && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[10px] text-white/20">work</span>
            <p className="text-[10px] text-[#A3FF47]/60 font-medium uppercase tracking-tighter">{funcao}</p>
          </div>
        )}
        {creci && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[10px] text-white/20">badge</span>
            <p className="text-[10px] text-white/60 font-medium font-mono uppercase">CRECI: {creci}</p>
          </div>
        )}
      </div>

      {/* Serviços */}
      <div className="mb-8 flex flex-wrap gap-2">
        {servicos?.slice(0, 3).map(s => (
          <span key={s} className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/[0.03] text-white/30 border border-white/5">
            {s}
          </span>
        ))}
      </div>

      {/* Ações Rodapé */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onView}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-[#E01183] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Dossiê
          </button>
          <button 
            onClick={onGenerateContract}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:border-[#E01183] hover:text-[#E01183] transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">description</span>
            Contrato
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Editar"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button 
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Excluir"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
