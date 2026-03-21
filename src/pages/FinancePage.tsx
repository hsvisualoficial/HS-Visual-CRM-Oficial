import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { UpcomingAlerts } from '../components/UpcomingAlerts';
import { Topbar } from '../components/Topbar';
import { supabase } from '../lib/supabase';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export const FinancePage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0, // Projected Inflow
    totalOutflow: 0,
    balance: 0      // Paid Balance
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [criticalUpcoming, setCriticalUpcoming] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .select('*, clientes_onboarding(razao_social, telefone)')
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;

      const txs = data || [];
      
      // Metrics
      const paidInflow = txs.filter(t => t.status === 'Pago' && t.tipo === 'Entrada').reduce((acc, t) => acc + Number(t.valor), 0);
      const output = txs.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + Number(t.valor), 0);
      const projected = txs.filter(t => t.status !== 'Pago' && t.tipo === 'Entrada').reduce((acc, t) => acc + Number(t.valor), 0);

      setMetrics({
        balance: paidInflow - output,
        totalRevenue: projected,
        totalOutflow: output
      });

      setTransactions(txs);
      setFilteredTransactions(txs);

      // Projection for next 30 days
      const today = new Date();
      const next30 = new Date();
      next30.setDate(today.getDate() + 30);

      const timeline: any = {};
      txs.forEach(t => {
        const d = new Date(t.data_vencimento);
        if (d >= today && d <= next30 && t.tipo === 'Entrada') {
          const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          timeline[key] = (timeline[key] || 0) + Number(t.valor);
        }
      });

      const chartData = Object.keys(timeline).map(key => ({
        name: key,
        valor: timeline[key]
      }));
      setProjectionData(chartData.length > 0 ? chartData : [{name: 'Sem Projeção', valor: 0}]);

      // Critical Upcoming logic (7 days)
      const in7Days = new Date();
      in7Days.setDate(today.getDate() + 7);
      
      const critical = txs.filter(t => 
        t.status === 'Pendente' && 
        t.tipo === 'Entrada' && 
        new Date(t.data_vencimento) <= in7Days
      ).slice(0, 6);
      setCriticalUpcoming(critical);

    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter((t: any) => t.tipo === filterType));
    }
  }, [filterType, transactions]);

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('financeiro')
      .update({ status: 'Pago' })
      .eq('id', id);
    if (!error) fetchFinanceData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este lançamento?')) return;
    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);
    if (!error) fetchFinanceData();
  };

  const handleWhatsApp = (tel: string, name: string, valor: number, venc: string) => {
    const msg = `Olá ${name}, Helder da HS Visual aqui. Passando para lembrar do vencimento da sua mensalidade de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)} para o dia ${new Date(venc).toLocaleDateString('pt-BR')}. Segue o link para acerto. Qualquer dúvida, estou à disposição!`;
    const cleanTel = tel.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanTel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-magenta"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 md:pb-0 md:pl-20 font-plus-jakarta selection:bg-magenta selection:text-white">
      <Sidebar />
      
      <main className="pt-24 md:pt-20 px-6 max-w-7xl mx-auto space-y-12">
        <Topbar title="Cockpit Financeiro" subtitle="HS Visual • Gestão de Fluxo de Caixa" />

        {/* Status Cards - High Contrast */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aura-glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-magenta/20 to-transparent shadow-[0_30px_60px_rgba(255,0,255,0.08)]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Saldo Consolidado</span>
              <span className="material-symbols-outlined text-magenta">account_balance_wallet</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(metrics.balance)}</h2>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-magenta animate-ping" />
              <span className="text-[9px] font-bold text-magenta uppercase tracking-widest">Tempo Real</span>
            </div>
          </div>
          
          <div className="aura-glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-cyan/20 to-transparent shadow-[0_30px_60px_rgba(0,242,254,0.08)]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Entradas Projetadas</span>
              <span className="material-symbols-outlined text-cyan">trending_up</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(metrics.totalRevenue)}</h2>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-cyan text-[9px] font-bold uppercase tracking-widest">Esteira Ativa</span>
            </div>
          </div>

          <div className="aura-glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-coral/20 to-transparent shadow-[0_30px_60px_rgba(255,75,43,0.08)]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Saídas / Custos</span>
              <span className="material-symbols-outlined text-coral">payments</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(metrics.totalOutflow)}</h2>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-coral text-[9px] font-bold uppercase tracking-widest">Operacional</span>
            </div>
          </div>
        </section>

        {/* Projection Chart - Pink Line */}
        <section className="aura-glass p-10 rounded-[32px] border border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1 text-[#ff00ff]">Projeção de Caixa</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Acúmulo de entradas para os próximos 30 dias</p>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Gráfico Dinâmico</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff00ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,0,255,0.2)', borderRadius: '16px', fontSize: '10px' }}
                  itemStyle={{ color: '#ff00ff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#ff00ff" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Sistema Sentinela - Banner de Vidro */}
        <UpcomingAlerts 
          upcoming={criticalUpcoming} 
          onMarkAsPaid={handleMarkAsPaid} 
        />

        {/* New Transaction Table - Clean List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">Histórico de Movimentações</h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
               <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>Todos</button>
               <button onClick={() => setFilterType('Entrada')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'Entrada' ? 'bg-cyan text-black' : 'text-white/40 hover:text-white'}`}>Entradas</button>
               <button onClick={() => setFilterType('Saída')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'Saída' ? 'bg-coral text-white' : 'text-white/40 hover:text-white'}`}>Saídas</button>
            </div>
          </div>

          <div className="aura-glass overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Data</th>
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Cliente / Descrição</th>
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Categoria</th>
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Valor</th>
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-bold text-white/60">{new Date(tx.data_vencimento).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-white group-hover:text-cyan transition-colors">{tx.clientes_onboarding?.razao_social || tx.descricao}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40">{tx.categoria}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-black ${tx.tipo === 'Entrada' ? 'text-white' : 'text-coral'}`}>
                        {tx.tipo === 'Entrada' ? '+' : '-'} {formatCurrency(tx.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'Pago' ? 'bg-[#A3FF47]' : 
                          tx.status === 'Vencido' ? 'bg-coral' : 'bg-yellow-500'
                        }`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          tx.status === 'Pago' ? 'text-[#A3FF47]' : 
                          tx.status === 'Vencido' ? 'text-coral' : 'text-yellow-500'
                        }`}>{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {tx.tipo === 'Entrada' && tx.status !== 'Pago' && (
                          <button 
                            onClick={() => handleWhatsApp(tx.clientes_onboarding?.telefone, tx.clientes_onboarding?.razao_social, tx.valor, tx.data_vencimento)}
                            className="w-8 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center group/btn"
                            title="Cobrar via WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(`/documentos/recibo/${tx.id}`, '_blank')}
                          className="w-8 h-8 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan hover:text-black transition-all flex items-center justify-center"
                          title="Gerar Recibo"
                        >
                          <span className="material-symbols-outlined text-[16px]">description</span>
                        </button>
                        {tx.status !== 'Pago' && (
                          <button 
                            onClick={() => handleMarkAsPaid(tx.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                            title="Dar Baixa"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="w-8 h-8 rounded-lg bg-coral/5 text-coral/40 hover:bg-coral hover:text-white transition-all flex items-center justify-center"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-white/20 font-bold uppercase text-[10px] tracking-widest">Nenhuma movimentação encontrada</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <MobileNav />
    </div>
  );
};
