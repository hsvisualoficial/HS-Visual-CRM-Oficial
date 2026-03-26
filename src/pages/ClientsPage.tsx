import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { MobileNav } from '../components/MobileNav';
import { ClientCard } from '../components/ClientCard';
import { ClientModal } from '../components/ClientModal';
import { supabase } from '../lib/supabase';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<any>(null);

  useEffect(() => {
    fetchClients();

    // Injetar Realtime
    const subscription = supabase
      .channel('clientes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_onboarding' }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes_onboarding')
        .select('*')
        .neq('status', 'excluído') // Filtro v43: Soft Delete
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados do banco para o padrão do componente (snake_case -> camelCase onde necessário)
      const mappedClients = (data || []).map(item => ({
        ...item,
        nome: item.razao_social,
        empresa: item.cidade ? `${item.cidade} / ${item.uf}` : 'Empresa não informada',
        logo_url: item.logoPreview || item.logo_url // se logoPreview estiver disponível
      }));

      setClients(mappedClients);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (client: any, mode: 'view' | 'edit') => {
    setSelectedClient(client);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (client: any) => {
    const newStatus = client.status === 'Ativo' ? 'Pendente' : 'Ativo';
    try {
      const { error } = await supabase
        .from('clientes_onboarding')
        .update({ status: newStatus })
        .eq('id', client.id);

      if (error) throw error;
      fetchClients();
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };


  const confirmDelete = async () => {
    if (!deletingClient) return;
    try {
      // v43: Soft Delete em vez de remoção física
      const { error } = await supabase
        .from('clientes_onboarding')
        .update({ status: 'excluído' })
        .eq('id', deletingClient.id);
        
      if (error) throw error;
      
      setDeletingClient(null);
      fetchClients();
    } catch (err) {
      console.error('Erro ao excluir (Soft Delete):', err);
      alert('Erro ao excluir cliente. Verifique permissões de rede.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 md:pb-0 md:pl-20">
      <Sidebar />
      <main className="pt-24 md:pt-20 px-6 max-w-7xl mx-auto">
        <Topbar title="Gestão de Clientes" subtitle="Controle total dos dossiês e cadastros ativos" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="hidden md:block" />
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={fetchClients}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-[#A3FF47] hover:border-[#A3FF47]/30 transition-all active:scale-90"
              title="Atualizar Lista"
            >
              <span className={`material-symbols-outlined ${loading ? 'animate-spin text-[#A3FF47]' : ''}`}>refresh</span>
            </button>
            <div className="relative group w-full md:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#A3FF47] transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#A3FF47]/50 transition-all backdrop-blur-xl"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#B9FF66] border-t-transparent animate-spin"></div>
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Carregando Clientes...</span>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <ClientCard 
                key={client.id} 
                {...client} 
                onView={() => handleAction(client, 'view')}
                onEdit={() => handleAction(client, 'edit')}
                onDelete={() => setDeletingClient(client)}
                onToggleStatus={() => handleToggleStatus(client)}
                onGenerateScript={() => navigate(`/ia?clientId=${client.id}`)}
                onGenerateContract={() => navigate(`/contratos?clientId=${client.id}`)}
              />
            ))}

          </div>
        ) : (
          <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-4 text-block">group_off</span>
            <p className="text-white/40">Nenhum cliente encontrado.</p>
          </div>
        )}
      </main>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={selectedClient} 
        mode={modalMode}
        onSave={fetchClients}
      />

      {/* Modal de Exclusão Segura - Skill v39 */}
      {deletingClient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0B0B0B] border border-white/10 p-10 rounded-[40px] max-w-md w-full text-center shadow-[0_0_100px_rgba(224,17,131,0.2)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase leading-none">Exclusão Segura</h3>
            <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
              Você está prestes a apagar o dossiê de <br/>
              <span className="text-[#E01183] font-black">{deletingClient.nome || deletingClient.razao_social}</span>. <br/>
              Esta ação é <span className="text-white underline">irreversível</span>.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeletingClient(null)}
                className="py-4 rounded-2xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-500/20"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};
