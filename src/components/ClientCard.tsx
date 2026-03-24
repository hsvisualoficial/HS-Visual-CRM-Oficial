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
  onGenerateContract: () => void;
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
  onGenerateScript,
  onGenerateContract
}) => {
  const formattedDate = created_at ? new Date(created_at).toLocaleDateString('pt-BR') : '---';
  
  const statusColors: Record<string, string> = {
    'Ativo': '#A3FF47',
    'Pendente': '#FFD700',
    'Atrasado': '#FF4B2B',
    'Inativo': '#94a3b8'
  };

  const currentColor = statusColors[status] || statusColors['Pendente'];

  // Design Neon Noir Executive (v39)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: '#E01183' }}
      className="p-8 relative group transition-all duration-500 bg-[#0B0B0B] border border-white/5 rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
      style={{ borderLeft: `2px solid #E01183` }}
    >
      {/* Selo de Situação - Skill v39 */}
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

      <div className="flex gap-6 mb-8 relative">
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
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-xl tracking-tight text-white leading-none truncate max-w-[180px]">{nome}</h3>
            {/* IA Script Brain Icon */}
            <button 
              onClick={onGenerateScript}
              className="w-8 h-8 rounded-full bg-[#A3FF47]/10 flex items-center justify-center text-[#A3FF47] hover:bg-[#A3FF47] hover:text-black transition-all shadow-[0_0_15px_rgba(163,255,71,0.2)]"
              title="Gerar Script de Vendas IA"
            >
              <span className="material-symbols-outlined text-base">psychology</span>
            </button>
          </div>
          <p className="text-[10px] font-medium text-white/40 mb-1">{cnpj_cpf}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#20C2AE] truncate">{empresa}</p>
          
          <div className="mt-4 flex flex-col gap-1.5 border-l border-white/5 pl-4">
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
            {email && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[10px] text-white/20">mail</span>
                <p className="text-[9px] text-white/40 font-medium lowercase truncate">{email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Serviços Minimalistas */}
      <div className="mb-8 flex flex-wrap gap-2">
        {servicos?.slice(0, 3).map(s => (
          <span key={s} className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white/[0.03] text-white/30 border border-white/5">
            {s}
          </span>
        ))}
      </div>

      {/* Ações Rodapé Skill v39 */}
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
