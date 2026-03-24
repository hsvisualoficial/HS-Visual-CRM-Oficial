import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const DocumentsPage: React.FC = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Agency Config
        const { data: configData } = await supabase.from('configuracoes').select('*').single();
        setConfig(configData);

        if (type === 'recibo') {
          const { data: rx } = await supabase
            .from('financeiro')
            .select('*, clientes_onboarding(*)')
            .eq('id', id)
            .single();
          setData(rx);
        } else if (type === 'contrato') {
          const { data: cx } = await supabase
            .from('clientes_onboarding')
            .select('*')
            .eq('id', id)
            .single();
          setData(cx);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, id]);

  const handlePrint = () => window.print();

  const handleShare = () => {
    const tel = data?.clientes_onboarding?.telefone || data?.telefone;
    const msg = `Segue o link do seu ${type === 'recibo' ? 'Recibo' : 'Contrato'} HS Visual: ${window.location.href}`;
    window.open(`https://wa.me/55${tel?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="p-20 text-center text-white/20 uppercase tracking-widest font-black">Gerando Documento...</div>;
  if (!data) return <div className="p-20 text-center text-red-500">Documento não encontrado.</div>;

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-12 font-serif text-slate-900 selection:bg-cyan selection:text-white pb-32 print:p-0 print:bg-white">
      {/* UI Controls - Hidden on Print */}
      <div className="max-w-[21cm] mx-auto mb-8 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-[10px] tracking-widest transition-all">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
        </button>
        <div className="flex gap-4">
          <button onClick={handleShare} className="bg-[#25D366] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">chat</span> Enviar WhatsApp
          </button>
          <button onClick={handlePrint} className="bg-black text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">print</span> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Document A4 Page */}
      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl p-16 min-h-[29.7cm] relative print:shadow-none print:p-0">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-20 border-b-2 border-slate-100 pb-12">
          <div>
            {config?.agency_logo_url && <img src={config.agency_logo_url} alt="Logo" className="h-16 mb-6 grayscale opacity-80" />}
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800">
              {type === 'recibo' ? 'Recibo de Pagamento' : 'Contrato de Prestação de Serviços'}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{config?.agency_name} • {config?.cnpj}</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-300 block mb-1">DATA EMISSÃO</span>
              <span className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-10 leading-relaxed text-slate-700 text-justify">
          {type === 'recibo' ? (
            <div className="space-y-12">
              <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">VALOR RECEBIDO</span>
                <h2 className="text-6xl font-black text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor)}
                </h2>
              </div>
              
              <p className="text-lg">
                Recebemos de <strong>{data.clientes_onboarding?.razao_social}</strong>, inscrito no CPF/CNPJ <strong>{data.clientes_onboarding?.cnpj_cpf}</strong>, 
                a importância supracitada referente a: <strong>{data.descricao}</strong>.
              </p>

              <p>
                Damos por este instrumento plena, geral e irrevogável quitação do valor recebido, para nada mais reclamar no presente ou no futuro com base nesta transação específica.
              </p>
            </div>
          ) : (
            <div className="space-y-8 text-[13px]">
              <h3 className="text-lg font-black uppercase border-l-4 border-slate-900 pl-4 mb-8">1. DAS PARTES</h3>
              <p>
                <strong>CONTRATADA:</strong> {config?.agency_name}, com sede administrativa, inscrita no CNPJ sob o nº {config?.cnpj}, representada neste ato por Helder Bezerra Ferreira.
              </p>
              <p>
                <strong>CONTRATANTE:</strong> {data.razao_social}, residente ou sediado em {data.logradouro}, {data.numero}, {data.bairro}, {data.cidade}/{data.uf}, inscrito no CPF/CNPJ sob o nº {data.cnpj_cpf}.
              </p>

              <h3 className="text-lg font-black uppercase border-l-4 border-slate-900 pl-4 mb-8">2. DO OBJETO</h3>
              <p>
                O presente contrato tem por objeto a prestação de serviços de marketing imobiliário de alta performance, incluindo, mas não se limitando a: <strong>{data.servicos?.join(', ')}</strong>.
              </p>

              <h3 className="text-lg font-black uppercase border-l-4 border-slate-900 pl-4 mb-8">3. DO VALOR E PAGAMENTO</h3>
              <p>
                Pelo serviço ora contratado, a CONTRATANTE pagará à CONTRATADA o valor mensal de <strong>{data.valor}</strong>, com vencimento todo dia <strong>{data.vencimento}</strong> de cada mês, durante o período de <strong>{data.duracao} meses</strong>.
              </p>

              <h3 className="text-lg font-black uppercase border-l-4 border-slate-900 pl-4 mb-8">4. DAS OBRIGAÇÕES</h3>
              <p>
                A CONTRATADA se compromete a utilizar as melhores tecnologias e estratégias de vídeo e tráfego pago para alavancar os resultados da CONTRATANTE, respeitando a ética e as normas do mercado imobiliário.
              </p>
            </div>
          )}
        </div>

        {/* Footer / Signature */}
        <footer className="mt-32 pt-12 border-t border-slate-100 flex justify-between items-end">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Assinatura do Responsável</p>
            {/* Assinatura dinâmica — vem do Supabase campo signature_url */}
            {config?.signature_url ? (
              <img src={config.signature_url} alt="Assinatura" className="h-16 object-contain mb-2" style={{ maxWidth: '200px' }} />
            ) : config?.agency_logo_url ? (
              <img src={config.agency_logo_url} alt="logo" className="h-10 grayscale opacity-50 mb-2" />
            ) : (
              <div className="h-10" />
            )}
            <div className="w-64 h-px bg-slate-900" />
            <p className="text-xs font-black text-slate-800 mt-2 uppercase">HELDER BEZERRA FERREIRA - CEO HS VISUAL</p>
          </div>

          <div className="text-right text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            Documento Autêntico • HS Visual System
          </div>
        </footer>

      </div>
    </div>
  );
};
