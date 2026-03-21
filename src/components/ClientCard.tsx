import React from 'react';
import { motion } from 'framer-motion';

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
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onGenerateScript: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ 
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
  onView, 
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateScript
}) => {
  const formattedDate = created_at ? new Date(created_at).toLocaleDateString('pt-BR') : '---';
  
  const statusColors: Record<string, string> = {
    'Ativo': '#A3FF47',
    'Pendente': '#FFD700',
    'Atrasado': '#FF4B2B',
    'Inativo': '#94a3b8'
  };

  const currentColor = statusColors[status] || statusColors['Pendente'];

  // Estilo Elite (Build v14) - Degradê Cyan/Teal
  const cardStyle = "aura-glass bg-gradient-to-br from-[#00f2fe]/10 to-[#4facfe]/05 backdrop-blur-3xl border border-white/10 text-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-[24px]";
  
  const subTextStyle = "text-white/40";
  const labelStyle = "text-white/20";
  const dateStyle = "text-white/60";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: `${currentColor}44` }}
      style={{ borderLeft: `4px solid ${currentColor}` }}
      className={`p-8 relative group transition-all duration-500 ${cardStyle}`}
    >
      {/* Selo de Situação - Topo Direito */}
      <button 
        onClick={onToggleStatus}
        className="absolute top-6 right-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all z-10"
        style={{ 
          backgroundColor: `${currentColor}10`, 
          borderColor: `${currentColor}30`,
          color: currentColor
        }}
      >
        {status}
      </button>

      <div className="flex justify-between items-start mb-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-full p-1.5 absolute -top-12 -left-12 bg-[#0A0A0A] border-4 border-[#050505] shadow-2xl transition-transform group-hover:scale-105 duration-500 overflow-hidden">
            <img 
              src={logo_url || 'https://via.placeholder.com/150'} 
              alt={nome}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="pl-10">
            <h3 className="font-bold text-2xl tracking-tighter leading-none mb-2">{nome}</h3>
            <p className="text-xs font-medium text-white/40">{cnpj_cpf}</p>
            <p className={`text-[9px] uppercase tracking-[0.2em] font-bold mt-3 ${subTextStyle}`}>{empresa}</p>
            {(creci || funcao || email) && (
              <div className="mt-3 flex flex-col gap-1">
                {funcao && <p className="text-[10px] text-white/60 font-medium italic">{funcao}</p>}
                {email && <p className="text-[9px] text-white/50 font-medium lowercase tracking-tight">{email}</p>}
                {creci && <p className="text-[9px] text-white/30 tracking-widest uppercase font-bold">CRECI: {creci}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] block mb-1 ${labelStyle}`}>Início</span>
          <span className={`text-xs font-black tracking-tight ${dateStyle}`}>{formattedDate}</span>
        </div>
      </div>

      <div className="mb-10 min-h-[40px]">
        <div className="flex flex-wrap gap-2">
          {servicos?.slice(0, 3).map(s => (
            <span key={s} className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5 bg-white/5 text-white/40">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-6 border-t border-white/5">
        <button 
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black hover:bg-[#00f2fe] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-base">analytics</span>
          Dossiê
        </button>
        <button 
          onClick={onGenerateScript}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B9FF66] text-black hover:bg-[#A3FF47] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-base">psychology</span>
          IA Script
        </button>
        <button 
          onClick={onEdit}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:border-[#00f2fe] hover:text-[#00f2fe] transition-all"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
        <button 
          onClick={onDelete}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </motion.div>
  );
};
