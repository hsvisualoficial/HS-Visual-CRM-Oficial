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
  cep: string | null;
  valor_investimento: string | null;
  dia_vencimento: string | null;
  vencimento: number | null;
  pagamento: string | null;
}

const fmt = (val: number | string | null) => {
  if (val == null) return 'A definir';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

export const ContractsPage: React.FC = () => {
  const { settings } = useAppContext();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados locais para override manual se necessário
  const [localValor, setLocalValor] = useState('');
  const [localVencimento, setLocalVencimento] = useState('');
  const [localPagamento, setLocalPagamento] = useState('PIX');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('clientes_onboarding')
        .select('*')
        .order('created_at', { ascending: false });
      
      const list = data || [];
      setClientes(list);

      const paramId = searchParams.get('clientId');
      if (list.length > 0) {
        const target = paramId ? list.find(c => c.id === paramId) : list[0];
        if (target) {
          setSelected(target);
          setLocalValor(target.valor_investimento || '1.500,00');
          setLocalVencimento(target.dia_vencimento || target.vencimento?.toString() || '20');
          setLocalPagamento(target.pagamento || 'PIX');
        }
      }
      setLoading(false);
    };
    fetch();
  }, [searchParams]);

  const handleClientChange = (id: string) => {
    const target = clientes.find(c => c.id === id);
    if (target) {
      setSelected(target);
      setLocalValor(target.valor_investimento || '1.500,00');
      setLocalVencimento(target.dia_vencimento || target.vencimento?.toString() || '20');
      setLocalPagamento(target.pagamento || 'PIX');
    }
  };

  const getLongDate = () => {
    const d = new Date();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  };

  const currentYearShort = new Date().getFullYear().toString().slice(-2);

  const agencyName = "HS VISUAL";
  const consultor = "Helder Bezerra Ferreira";
  const cnpjAgencia = "52.672.332/0001-16";
  const enderecoAgencia = "Av. Moisés Raphael, 55 - Cidade Nova, Jundiaí - SP, 13219-490";

  const handleWhatsApp = () => {
    if (!selected) return;
    const first = selected.razao_social.split(' ')[0];
    const msg = `Olá ${first}, aqui é o Helder da HS Visual. Segue o link do nosso contrato de assessoria digital conforme combinamos: ${window.location.href}. Fico à disposição!`;
    const tel = selected.telefone?.replace(/\D/g, '');
    window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <PageContainer>
      <Topbar title="Gestor de Contratos" subtitle="Skill de Automação de Documentos (v37)" />

      <div className="space-y-8 print:hidden">
        {/* Painel Neon Noir UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aura-glass p-6 rounded-2xl border border-white/5 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#E01183]">Contratante</label>
            {loading ? (
              <div className="h-10 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <select
                value={selected?.id || ''}
                onChange={e => handleClientChange(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-white outline-none cursor-pointer"
              >
                {clientes.map(c => <option key={c.id} value={c.id} style={{background: '#141414'}}>{c.razao_social}</option>)}
              </select>
            )}
            <div className="text-[11px] text-white/40 font-medium space-y-1">
              <p>📍 {[selected?.logradouro, selected?.numero, selected?.bairro].filter(Boolean).join(', ')}</p>
              <p>📄 {selected?.cnpj_cpf || 'CNPJ/CPF não informado'}</p>
            </div>
          </div>

          <div className="aura-glass p-6 rounded-2xl border border-white/5 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Valor/Mês</label>
              <input
                type="text" value={localValor} onChange={e => setLocalValor(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-white border-b border-white/10 focus:border-[#E01183] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Vencimento</label>
              <input
                type="text" value={localVencimento} onChange={e => setLocalVencimento(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-white border-b border-white/10 focus:border-[#E01183] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Pagamento</label>
              <input
                type="text" value={localPagamento} onChange={e => setLocalPagamento(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-white border-b border-white/10 focus:border-[#E01183] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botoes de Ação */}
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 h-14 bg-gradient-to-r from-[#E01183] to-[#B8006B] rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(224,17,131,0.3)] flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">print</span> Imprimir A4
          </button>
          <button
            onClick={handleWhatsApp}
            className="px-8 h-14 bg-[#25D366] rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(37,211,102,0.2)] flex items-center gap-3"
          >
            <span className="material-symbols-outlined">chat</span> WhatsApp
          </button>
        </div>
      </div>

      {/* 📄 DOCUMENTO (CONTRATO) */}
      <div id="contract-view" className="mt-12 bg-white text-slate-900 mx-auto rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden print:p-0 print:shadow-none print:rounded-none">
        
        {/* Header Contract */}
        <div className="flex justify-between items-start mb-16 border-b-2 border-slate-100 pb-8">
          <div>
            {settings.agency_logo_url && <img src={settings.agency_logo_url} alt="Logo" className="h-14 mb-4 grayscale" />}
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 leading-tight">
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Marketing Digital e Gestão de Tráfego Pago</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">CNPJ: {cnpjAgencia}</p>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Jundiaí - SP</p>
          </div>
        </div>

        {/* Content Clauses */}
        <div className="document-body space-y-8 text-[13px] leading-relaxed text-slate-700 text-justify">
          
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2563EB] mb-4">DAS PARTES</h3>
            <p className="mb-4">
              <strong>CONTRATADA:</strong> <strong>{agencyName} ({consultor})</strong>, portador do CNPJ nº {cnpjAgencia}, residente e domiciliado em {enderecoAgencia}.
            </p>
            <p>
              <strong>CONTRATANTE:</strong> <strong>{selected?.razao_social || '____________________'}</strong>, 
              inscrito no CPF/CNPJ nº <strong>{selected?.cnpj_cpf || '____________________'}</strong>, 
              com endereço em <strong>{[selected?.logradouro, selected?.numero, selected?.bairro, selected?.cidade, selected?.uf, selected?.cep].filter(Boolean).join(', ') || '____________________'}</strong>.
            </p>
            <p className="mt-4 italic">Têm entre si, justo e contratado, o seguinte:</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 1 – DO OBJETO</h3>
            <p>1.1. O presente contrato tem por objeto a prestação de serviços de Gestão de Tráfego Pago (anúncios online) e Assessoria Visual de Criativos nas plataformas META ADS (Facebook e Instagram) e SOCIAL MEDIA, conforme acordado entre as partes.</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 2 – DAS OBRIGAÇÕES DA CONTRATADA ({agencyName})</h3>
            <p className="mb-3">Compete à CONTRATADA:</p>
            <ul className="list-none space-y-2 ml-4">
              <li>2.1. Planejar, criar e gerenciar as campanhas de anúncios nas plataformas mencionadas;</li>
              <li>2.2. Prestar consultoria visual, orientando ou realizando edições estratégicas nos materiais (fotos/vídeos) fornecidos pelo CONTRATANTE para uso exclusivo nos anúncios;</li>
              <li>2.3. Otimizar os anúncios periodicamente visando o melhor desempenho (custo por lead);</li>
              <li>2.4. Enviar relatório mensal (ou quinzenal) com os principais métricas e resultados obtidos.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 3 – DAS OBRIGAÇÕES DO CONTRATANTE</h3>
            <p className="mb-3">Compete ao CONTRATANTE:</p>
            <ul className="list-none space-y-2 ml-4">
              <li>3.1. Fornecer acesso às contas de anúncios (Business Manager) e páginas necessárias;</li>
              <li>3.2. Fornecer o material bruto (fotos e vídeos) com qualidade mínima para a criação dos anúncios;</li>
              <li>3.3. Realizar o atendimento comercial aos leads (contatos) gerados, sendo de sua total responsabilidade a velocidade e qualidade da resposta ao potencial cliente;</li>
              <li>3.4. Efetuar o pagamento direto às plataformas (Facebook/Google) via cartão de crédito ou boleto.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 4 – DO INVESTIMENTO EM MÍDIA</h3>
            <p className="mb-2">4.1. Fica estipulado que os valores investidos em mídia (verba de anúncios paga ao Facebook/Google) NÃO estão inclusos no valor da prestação de serviço da {agencyName};</p>
            <p>4.2. O CONTRATANTE é o único responsável pelo pagamento dos boletos/faturas das plataformas de anúncios. A CONTRATADA não se responsabiliza por pausas nas campanhas decorrentes de falta de pagamento às plataformas.</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 5 – DA AUSÊNCIA DE GARANTIA DE VENDAS</h3>
            <p className="mb-2">5.1. A atividade da CONTRATADA é de "meio" e não de "fim". O objetivo é dar visibilidade ao cliente de captar leads qualificados;</p>
            <p>5.2. A CONTRATADA não garante número exato de vendas ou fechamento de contratos, visto que estes dependem de fatores externos alheios à gestão de tráfego, tais como: preço do imóvel, condições de mercado, aprovação de crédito bancário e, principalmente, da habilidade comercial do CONTRATANTE no atendimento.</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 6 – DOS VALORES E PAGAMENTO</h3>
            <p className="mb-2">6.1. Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor mensal de <strong>{fmt(localValor)}</strong>;</p>
            <p>6.2. O pagamento deverá ser efetuado todo dia <strong>{localVencimento}</strong> de cada mês, via <strong>{localPagamento}</strong>.</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 7 – DA VIGÊNCIA E RESCISÃO</h3>
            <p className="mb-2">7.1. O presente contrato é sem prazo determinado (contrato contínuo);</p>
            <p className="mb-2">7.2. Qualquer das partes pode rescindir este contrato com aviso prévio de 30 (trinta) dias;</p>
            <p>7.3. Não há multa rescisória ou período de fidelidade obrigatório.</p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">CLÁUSULA 8 – DO FORO</h3>
            <p>8.1. Fica eleito o foro da Comarca de Jundiaí/SP para dirimir quaisquer dúvidas oriundas deste contrato.</p>
          </section>

          <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl mt-12 bg-slate-50/50">
            <p className="text-[12px] italic text-slate-500">
              E, por estarem justos e contratados, a aceitação desta proposta via e-mail ou WhatsApp, acompanhada da confirmação de leitura e concordância com os termos, valida o presente acordo.
            </p>
          </div>

          <p className="mt-16 text-right font-medium">
            Jundiaí, {getLongDate()}
          </p>

          <div className="pt-24 grid grid-cols-2 gap-20">
            <div className="text-center">
              <div className="h-0.5 bg-slate-200 mb-2" />
              <p className="font-black text-[10px] uppercase">{selected?.razao_social || 'CONTRATANTE'}</p>
              <p className="text-[9px] text-slate-400">CPF/CNPJ: {selected?.cnpj_cpf}</p>
            </div>
            <div className="text-center relative">
              {settings.signature_url && (
                <img 
                  src={settings.signature_url} 
                  alt="Assinatura Helder" 
                  className="absolute -top-16 left-1/2 -translate-x-1/2 h-20 object-contain mix-blend-multiply"
                />
              )}
              <div className="h-0.5 bg-slate-200 mb-2" />
              <p className="font-black text-[10px] uppercase">{consultor}</p>
              <p className="text-[9px] text-slate-400">HS VISUAL - CNPJ: {cnpjAgencia}</p>
            </div>
          </div>

          <footer className="pt-12 border-t border-slate-100 mt-20 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
            <div>Contato: (11) 95361-1000 | @hsvisual.oficial</div>
            <div>HS VISUAL Intelligence System v37</div>
          </footer>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        #contract-view {
          font-family: 'Plus Jakarta Sans', sans-serif;
          max-width: 21cm;
        }

        @media print {
          body * { visibility: hidden !important; }
          #contract-view, #contract-view * { visibility: visible !important; }
          #contract-view {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2cm !important;
          }
          .aura-glass { display: none !important; }
        }
      `}</style>

    </PageContainer>
  );
};
