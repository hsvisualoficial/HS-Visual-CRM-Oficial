import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const PerformancePage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes_onboarding')
        .select('id, razao_social, telefone, email')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        setClients([]);
      } else {
        setClients(data || []);
        if (data && data.length > 0) {
          setSelectedClient(data[0]);
        }
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = selectedClient?.telefone?.replace(/\D/g, '') || '';
    const nome = selectedClient?.razao_social?.split(' ')[0] || 'Cliente';
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const msg = `*${saudacao}, ${nome}! 🚀*\n\n*Relatório de Performance — Últimos ${periodo} dias*\n\n📊 *Campanha:* Performance Master\n\n💬 *142* Conversas Geradas\n💰 Custo por conversa: *R$ 4,50*\n📈 Total investido: *R$ 639,00*\n👥 Alcance: *24.500 pessoas*\n👁️ Impressões: *45.200*\n\n⭐ *Score da Campanha: 8.2/10*\n📈 Tendência: *+8% de crescimento*\n\n_Quantas dessas conversas avançaram para fechamento? Seu feedback é muito importante para otimizarmos ainda mais!_ 🎯`;
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      alert('Selecione um cliente com telefone cadastrado para enviar o relatório.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#F2F2F2', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar Desktop */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: '72px',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', paddingTop: '32px', gap: '24px', zIndex: 50
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,0,128,0.15)', border: '1px solid rgba(255,0,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#FF0080', fontSize: '18px' }}>⚡</span>
        </div>
        {[
          { to: '/painel', icon: '🟢', label: 'Painel' },
          { to: '/ia', icon: '🧠', label: 'IA' },
          { to: '/clientes', icon: '👥', label: 'Clientes' },
          { to: '/performance', icon: '📊', label: 'Performance', active: true },
          { to: '/financeiro', icon: '💰', label: 'Financeiro' },
          { to: '/setup', icon: '⚙️', label: 'Config' },
        ].map(item => (
          <Link key={item.to} to={item.to} title={item.label} style={{
            fontSize: '22px', textDecoration: 'none', opacity: item.active ? 1 : 0.5,
            filter: item.active ? 'none' : 'grayscale(0.5)',
            transition: 'opacity 0.2s',
          }}>
            {item.icon}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ marginLeft: '72px', padding: '40px 24px', maxWidth: '720px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '11px', color: '#FF0080', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Relatório Premium
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
            Performance Master
          </h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {['7', '15', '30'].map(p => (
              <button key={p} onClick={() => setPeriodo(p)} style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: periodo === p ? '#FF0080' : 'rgba(255,255,255,0.05)',
                color: periodo === p ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '12px', fontWeight: 700, transition: 'all 0.2s'
              }}>
                {p} dias
              </button>
            ))}
          </div>
        </div>

        {/* Client Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
            <p style={{ fontSize: '10px', color: '#8E8E93', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
              Cliente
            </p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #FF0080', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Carregando...</span>
              </div>
            ) : clients.length === 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Nenhum cliente cadastrado</span>
            ) : (
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value))}
                style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, width: '100%', cursor: 'pointer' }}
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#1a1a1a' }}>
                    {c.razao_social || 'Sem Nome'}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
            <p style={{ fontSize: '10px', color: '#8E8E93', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
              Campanha
            </p>
            <select style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              <option style={{ background: '#1a1a1a' }}>Performance Master (Ativa)</option>
              <option style={{ background: '#1a1a1a' }}>Remarketing Geral</option>
            </select>
          </div>
        </div>

        {/* Main Metric Card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,0,128,0.08) 0%, rgba(0,0,0,0) 60%)', border: '1px solid rgba(255,0,128,0.2)', borderRadius: '24px', padding: '36px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontSize: '11px', color: '#FF0080', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Conversas Ativas</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', margin: '12px 0' }}>
            <span style={{ fontSize: '80px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>142</span>
            <span style={{ fontSize: '14px', color: '#00FFD1', fontWeight: 700, marginBottom: '12px', background: 'rgba(0,255,209,0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(0,255,209,0.2)' }}>+12%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Últimos {periodo} dias</span>
            <span style={{ fontSize: '11px', color: '#00FFD1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#00FFD1', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Sincronizado
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Custo por Conv.', value: 'R$ 4,50', color: '#fff' },
            { label: 'Total Investido', value: 'R$ 639,00', color: '#fff' },
            { label: 'Saldo Disp.', value: 'R$ 1.250', color: '#00FFD1' },
            { label: 'Alcance', value: '24.5k', color: '#fff' },
            { label: 'Impressões', value: '45.2k', color: '#fff' },
            { label: 'Score', value: '8.2/10', color: '#FF0080' },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
              <p style={{ fontSize: '9px', color: '#8E8E93', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{m.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>Funil de Conversão</h3>
          {[
            { label: 'Impressões', value: '45.200', badge: '100%', color: 'rgba(255,255,255,0.1)' },
            { label: 'Alcance Único', value: '24.500', badge: '54% Alcance', color: 'rgba(255,0,128,0.1)' },
            { label: 'Conversas Geradas', value: '142', badge: '0.58% CTR', color: 'rgba(0,255,209,0.1)' },
          ].map(step => (
            <div key={step.label} style={{ background: step.color, borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{step.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{step.value}</p>
              </div>
              <span style={{ fontSize: '11px', color: '#FF0080', fontWeight: 700, background: 'rgba(255,0,128,0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,0,128,0.2)' }}>{step.badge}</span>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '28px', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Análise Estratégica AI</span>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '✅', color: '#00FFD1', label: 'Pontos Fortes', text: 'Forte engajamento no criativo B; custo por clique 15% abaixo da média do setor.' },
              { icon: '⚠️', color: '#FF4D4D', label: 'Oportunidade', text: 'Otimizar conversão de alcance na quarta-feira via agendamento de orçamento.' },
              { icon: '🚀', color: '#FF0080', label: 'Próximos Passos', text: 'Escalar público Lookalike e testar nova CTA de urgência no topo do funil.' },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${a.color}10`, border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                  {a.icon}
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: a.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>{a.label}</p>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast */}
        <div style={{ background: '#1a1a1a', borderLeft: '4px solid #00FFD1', borderRadius: '16px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '28px' }}>📈</span>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
            Previsão 30 dias: estimamos gerar <strong style={{ color: '#00FFD1' }}>4.260 conversas</strong> mantendo o investimento atual.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '48px' }}>
          <button
            onClick={handleWhatsApp}
            style={{ gridColumn: '1 / -1', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF0080, #FF4D9D)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '0.05em', boxShadow: '0 10px 30px rgba(255,0,128,0.3)', transition: 'all 0.2s' }}
          >
            📲 Enviar Relatório para o Cliente
          </button>
          <button style={{ height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
            📄 Exportar PDF
          </button>
          <button style={{ height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
            🔗 Copiar Link
          </button>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          select option { background: #1a1a1a; color: white; }
        `}</style>
      </main>
    </div>
  );
};
