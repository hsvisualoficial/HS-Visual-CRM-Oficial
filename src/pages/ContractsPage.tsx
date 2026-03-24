import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { PageContainer } from '../components/PageContainer';
import { Topbar } from '../components/Topbar';

interface Cliente {
  id: string;
  razao_social: string;
  cnpj_cpf: string | null;
  telefone: string | null;
  email: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  valor_investimento: number | null;
  plataforma_anuncio: string | null;
}

const fmt = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : 'A definir';

export const ContractsPage: React.FC = () => {
  const { settings } = useAppContext();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [duracao, setDuracao] = useState('12');
  const [vencimento, setVencimento] = useState('5');
  const [servicos, setServicos] = useState('Gestão de Tráfego Pago, Criação de Conteúdo, Consultoria Estratégica');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('clientes_onboarding')
        .select('id, razao_social, cnpj_cpf, telefone, email, logradouro, numero, bairro, cidade, uf, valor_investimento, plataforma_anuncio')
        .order('created_at', { ascending: false });
      setClientes(data || []);
      // Auto-seleciona o cliente passado via URL ?clientId=
      const paramId = searchParams.get('clientId');
      if (data && data.length > 0) {
        const target = paramId ? data.find(c => c.id === paramId) : null;
        setSelected(target || data[0]);
      }
      setLoading(false);
    };
    fetch();
  }, [searchParams]);


  const today = new Date().toLocaleDateString('pt-BR');
  const agencyName = settings.agency_name || 'HS Visual Intelligence';
  const cnpjAgencia = settings.cnpj || 'N/A';

  return (
    <PageContainer>
      <Topbar title="Contratos" subtitle="Gerador Automático de Contratos" />

      {/* Config Panel */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Seletor de Cliente */}
          <div className="p-6 rounded-2xl space-y-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Cliente Contratante
            </p>
            {loading ? (
              <div className="h-8 rounded-lg animate-pulse" style={{ background: '#1F1F1F' }} />
            ) : clientes.length === 0 ? (
              <p className="text-sm" style={{ color: '#6B7280' }}>Nenhum cliente cadastrado.</p>
            ) : (
              <select
                value={selected?.id || ''}
                onChange={e => setSelected(clientes.find(c => c.id === e.target.value) || null)}
                className="w-full text-lg font-bold bg-transparent outline-none border-none cursor-pointer"
                style={{ color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#141414' }}>{c.razao_social}</option>
                ))}
              </select>
            )}
            {selected && (
              <div className="space-y-1 text-xs" style={{ color: '#6B7280' }}>
                <p>📄 {selected.cnpj_cpf || 'CPF/CNPJ não informado'}</p>
                <p>📍 {[selected.logradouro, selected.numero, selected.bairro, selected.cidade, selected.uf].filter(Boolean).join(', ') || 'Endereço não informado'}</p>
                <p>💰 {fmt(selected.valor_investimento)} / mês</p>
              </div>
            )}
          </div>

          {/* Parâmetros do contrato */}
          <div className="p-6 rounded-2xl space-y-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Parâmetros do Contrato
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest font-bold block mb-1" style={{ color: '#6B7280' }}>Duração (meses)</label>
                <input
                  type="number" min="1" max="60" value={duracao}
                  onChange={e => setDuracao(e.target.value)}
                  className="w-full text-lg font-bold bg-transparent border-b outline-none py-1"
                  style={{ color: '#FFFFFF', borderColor: '#1F1F1F', fontFamily: 'Space Grotesk, sans-serif' }}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest font-bold block mb-1" style={{ color: '#6B7280' }}>Vencimento (dia)</label>
                <input
                  type="number" min="1" max="28" value={vencimento}
                  onChange={e => setVencimento(e.target.value)}
                  className="w-full text-lg font-bold bg-transparent border-b outline-none py-1"
                  style={{ color: '#FFFFFF', borderColor: '#1F1F1F', fontFamily: 'Space Grotesk, sans-serif' }}
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest font-bold block mb-1" style={{ color: '#6B7280' }}>Serviços Contratados</label>
              <textarea
                value={servicos}
                onChange={e => setServicos(e.target.value)}
                rows={3}
                className="w-full text-sm bg-transparent border-b outline-none py-1 resize-none"
                style={{ color: '#F0F0F0', borderColor: '#1F1F1F' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 h-14 rounded-2xl font-extrabold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E01183 0%, #B8006B 100%)', boxShadow: '0 10px 30px rgba(224,17,131,0.25)' }}
          >
            <span className="material-symbols-outlined">print</span>
            Imprimir / Gerar PDF
          </button>
          {selected?.telefone && (
            <button
              onClick={() => {
                const msg = `Olá, ${selected.razao_social.split(' ')[0]}! Segue o seu contrato de serviços com a ${agencyName}. Acesse: ${window.location.href}`;
                window.open(`https://wa.me/55${selected.telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="px-8 h-14 rounded-2xl font-extrabold text-sm tracking-widest uppercase flex items-center gap-3 transition-all hover:scale-[1.02]"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <span className="material-symbols-outlined">chat</span>
              WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* ════════════════ PRINT AREA ════════════════ */}
      <div
        id="contract-doc"
        className="mt-12 print:mt-0"
        style={{
          background: '#FFFFFF',
          color: '#1A1A1A',
          borderRadius: '1.5rem',
          padding: '4rem',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.8',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F0F0F0', paddingBottom: '2rem', marginBottom: '3rem' }}>
          <div>
            {settings.agency_logo_url && (
              <img src={settings.agency_logo_url} alt="Logo" style={{ height: '60px', marginBottom: '1rem', filter: 'grayscale(1)', opacity: 0.8 }} />
            )}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', color: '#0A0A0A', marginBottom: '0.25rem' }}>
              Contrato de Prestação de Serviços
            </h1>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF' }}>
              {agencyName} • CNPJ: {cnpjAgencia}
            </p>
          </div>
          <div style={{ background: '#F9FAFB', padding: '1rem 1.5rem', borderRadius: '0.75rem', textAlign: 'right', border: '1px solid #F0F0F0' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', display: 'block', marginBottom: '0.25rem' }}>DATA DE EMISSÃO</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{today}</span>
          </div>
        </div>

        {/* Cláusula 1 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            1. DAS PARTES
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <strong>CONTRATADA:</strong> {agencyName}, inscrita no CNPJ sob o nº {cnpjAgencia}, representada neste ato por Helder Silva, CEO.
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            <strong>CONTRATANTE:</strong> {selected?.razao_social || '_______________'}, {
              [selected?.logradouro, selected?.numero, selected?.bairro, selected?.cidade, selected?.uf].filter(Boolean).join(', ') || 'endereço não informado'
            }, inscrito no CPF/CNPJ sob o nº {selected?.cnpj_cpf || '_______________'}.
          </p>
        </div>

        {/* Cláusula 2 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            2. DO OBJETO
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            O presente contrato tem por objeto a prestação de serviços de marketing digital e gestão de performance, incluindo: <strong>{servicos}</strong>.
          </p>
        </div>

        {/* Cláusula 3 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            3. DO VALOR E PAGAMENTO
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Pelo serviço ora contratado, a CONTRATANTE pagará à CONTRATADA o valor mensal de{' '}
            <strong>{fmt(selected?.valor_investimento || null)}</strong>, com vencimento todo dia{' '}
            <strong>{vencimento}</strong> de cada mês, durante o período de{' '}
            <strong>{duracao} meses</strong>, totalizando {fmt((selected?.valor_investimento || 0) * parseInt(duracao))}.
          </p>
        </div>

        {/* Cláusula 4 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            4. DAS OBRIGAÇÕES
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            A CONTRATADA se compromete a utilizar as melhores tecnologias e estratégias de tráfego pago e criação de conteúdo para alavancar os resultados da CONTRATANTE, respeitando a ética e as normas do mercado.
          </p>
        </div>

        {/* Cláusula 5 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            5. DO SIGILO E RESCISÃO
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            As partes se comprometem a manter absoluto sigilo sobre as informações trocadas. A rescisão antecipada sem justa causa por qualquer das partes implicará no pagamento de multa equivalente a 30% do valor total restante do contrato.
          </p>
        </div>

        {/* Cláusula 6 */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', borderLeft: '3px solid #0A0A0A', paddingLeft: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            6. DO FORO
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            As partes elegem o foro da Comarca de {selected?.cidade || 'sua cidade'}/{selected?.uf || 'UF'} para dirimir quaisquer questões oriundas deste contrato.
          </p>
        </div>

        {/* Local e Data */}
        <p style={{ fontSize: '0.8rem', textAlign: 'center', color: '#6B7280', marginBottom: '4rem' }}>
          {selected?.cidade || '_____________'}, {today}.
        </p>

        {/* Assinaturas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          {/* Assinatura CONTRATADA */}
          <div style={{ textAlign: 'center' }}>
            {settings.signature_url ? (
              <img
                src={settings.signature_url}
                alt="Assinatura"
                style={{ height: '70px', margin: '0 auto 0.5rem', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ height: '60px' }} />
            )}
            {settings.agency_logo_url && (
              <img src={settings.agency_logo_url} alt="Logo" style={{ height: '28px', margin: '0 auto 0.5rem', filter: 'grayscale(1)', opacity: 0.6 }} />
            )}
            <div style={{ borderBottom: '1.5px solid #0A0A0A', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              HELDER BEZERRA FERREIRA — CEO {agencyName}
            </p>
          </div>
          {/* Assinatura CONTRATANTE */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '100px' }} />
            <div style={{ borderBottom: '1.5px solid #0A0A0A', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {selected?.razao_social || 'CONTRATANTE'}<br />
              {selected?.cnpj_cpf || ''}
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #F0F0F0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#D1D5DB' }}>
            Documento Autêntico • {agencyName} System • Gerado em {today}
          </p>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #contract-doc, #contract-doc * { visibility: visible !important; }
          #contract-doc {
            position: fixed !important;
            left: 0; top: 0;
            width: 100%;
            background: white !important;
            border-radius: 0 !important;
            padding: 2cm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </PageContainer>
  );
};
