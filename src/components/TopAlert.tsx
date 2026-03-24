import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Alerta {
  mensagem: string;
  url: string;
  tipo: 'vencimento' | 'pagamento';
}

export const TopAlert: React.FC = () => {
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const buscarAlerta = async () => {
      try {
        const hoje = new Date();
        const em3dias = new Date();
        em3dias.setDate(hoje.getDate() + 3);

        // Busca o próximo vencimento pendente nos próximos 3 dias
        const { data } = await supabase
          .from('financeiro')
          .select('descricao, valor, data_vencimento')
          .eq('status', 'Pendente')
          .eq('tipo', 'Entrada')
          .gte('data_vencimento', hoje.toISOString().split('T')[0])
          .lte('data_vencimento', em3dias.toISOString().split('T')[0])
          .order('data_vencimento', { ascending: true })
          .limit(1);

        if (data && data.length > 0) {
          const item = data[0];
          const valorFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor);
          const dataFmt = new Date(item.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR');
          const descricao = item.descricao || 'Lançamento';
          const template = `Olá! Passando para avisar sobre o vencimento de *${descricao}* em ${dataFmt} de ${valorFmt}. Acesse o portal para mais detalhes!`;

          setAlerta({
            mensagem: `${descricao}: vencimento em ${dataFmt} — ${valorFmt}`,
            url: `https://wa.me/?text=${encodeURIComponent(template)}`,
            tipo: 'vencimento',
          });
        } else {
          setAlerta(null); // Sem alerta, não mostra o componente
        }
      } catch {
        setAlerta(null);
      }
    };

    buscarAlerta();
  }, []);

  if (!alerta || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 1 }}
        className="fixed bottom-6 right-6 z-[60] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-[#ff4d4d]/30 rounded-2xl shadow-[0_10px_40px_rgba(255,77,77,0.15)] flex flex-col gap-3 p-5 w-80 group hover:border-[#ff4d4d]/50 transition-colors"
      >
        {/* Botão fechar */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>

        <div className="flex items-start gap-3 text-[#ff4d4d]">
          <div className="w-8 h-8 rounded-full bg-[#ff4d4d]/10 flex items-center justify-center shrink-0 border border-[#ff4d4d]/20 group-hover:bg-[#ff4d4d]/20 transition-colors">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold tracking-widest uppercase mb-1">Vencimento Próximo</h4>
            <p className="text-white/70 text-[11px] leading-tight font-medium">{alerta.mensagem}</p>
          </div>
        </div>

        <a
          className="mt-1 bg-white/5 border border-white/10 hover:bg-[#ff4d4d]/20 hover:border-[#ff4d4d]/50 text-white px-4 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 w-full"
          href={alerta.url}
          target="_blank"
          rel="noreferrer"
        >
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
          Cobrar Agora (WhatsApp)
        </a>
      </motion.div>
    </AnimatePresence>
  );
};
