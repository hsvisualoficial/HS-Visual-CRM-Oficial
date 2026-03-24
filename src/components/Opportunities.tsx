import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface Cliente {
  id: string;
  razao_social: string;
  segmento_atuacao: string | null;
  plataforma_anuncio: string | null;
  status: string | null;
  valor_investimento: number | null;
  created_at: string;
}

const statusColor: Record<string, string> = {
  'Ativo': 'text-[#B9FF66]',
  'Inativo': 'text-red-400',
  'Pendente': 'text-yellow-400',
  'Em Negociação': 'text-blue-400',
  'Novo': 'text-[#66FFED]',
};

const fmt = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—';

export const Opportunities: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes_onboarding')
          .select('id, razao_social, segmento_atuacao, plataforma_anuncio, status, valor_investimento, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error) setClientes(data || []);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    const channel = supabase
      .channel('opportunities_clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, fetchClients)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Iniciais do nome como avatar
  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="lg:col-span-8 space-y-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-2xl font-bold tracking-tight">Clientes Recentes</h3>
        <Link to="/clientes" className="text-[#B9FF66] text-xs font-bold uppercase tracking-widest hover:underline">
          Ver Todos
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aura-glass p-6 rounded-xl animate-pulse bg-white/5 h-20" />
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="aura-glass p-10 rounded-xl flex flex-col items-center justify-center text-center gap-4">
          <span className="material-symbols-outlined text-5xl text-white/20">group_add</span>
          <div>
            <p className="text-white/50 font-bold">Nenhum cliente cadastrado ainda</p>
            <p className="text-white/30 text-sm mt-1">Cadastre o primeiro cliente para começar</p>
          </div>
          <Link to="/cadastro" target="_blank" className="mt-2 px-6 py-2 bg-[#B9FF66] text-black text-xs font-extrabold uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
            Novo Cadastro
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {clientes.map((c) => (
            <div key={c.id} className="aura-glass p-5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-5">
                {/* Avatar com iniciais */}
                <div className="w-12 h-12 rounded-full bg-[#B9FF66]/10 border border-[#B9FF66]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-[#B9FF66]">{initials(c.razao_social)}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold leading-tight">{c.razao_social}</h4>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {c.segmento_atuacao && (
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60 font-bold tracking-widest uppercase">
                        {c.segmento_atuacao}
                      </span>
                    )}
                    {c.plataforma_anuncio && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#66FFED] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">bolt</span>
                        {c.plataforma_anuncio}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-sm font-bold text-white">{fmt(c.valor_investimento)}</p>
                <p className={`text-[10px] font-bold mt-1 ${statusColor[c.status ?? ''] || 'text-white/40'}`}>
                  {c.status || 'Sem status'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
