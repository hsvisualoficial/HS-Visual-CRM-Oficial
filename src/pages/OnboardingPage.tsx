import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { maskCnpjCpf, maskPhone, maskCep, maskCurrency, maskDate, maskCreci } from '../utils/masks';
import { supabase } from '../lib/supabase';
import { generateInstallments } from '../utils/finance';

export function OnboardingPage() {
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showGooglePass, setShowGooglePass] = useState(false);
  const [showMetaPass, setShowMetaPass] = useState(false);
  const [showInstaPass, setShowInstaPass] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    // Dados Cadastrais
    cnpjCpf: '',
    razaoSocial: '',
    rg: '',
    dataNascimento: '',
    telefone: '',
    telefonePessoal: '',
    creci: '',
    email: '',
    funcao: '',
    
    // Foto
    logoFileName: '',
    logoPreview: '',

    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    tipoImovel: 'Comercial', // Casa, Apartamento, Comercial

    // Serviços
    servicos: [] as string[],

    // Acessos Ads
    googleEmail: '',
    googlePassword: '',
    metaEmail: '',
    metaPassword: '',
    instaLogin: '',
    instaPass: '',
    observacoesAcesso: '',

    // Faturamento
    valor: '',
    vencimento: '',
    duracao: '',
    dataInicioContrato: new Date().toISOString().split('T')[0],
    pagamento: 'Boleto'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cnpjCpf') finalValue = maskCnpjCpf(value);
    if (name === 'telefone' || name === 'telefonePessoal') finalValue = maskPhone(value);
    if (name === 'cep') finalValue = maskCep(value);
    if (name === 'valor') finalValue = maskCurrency(value);
    if (name === 'dataNascimento') finalValue = maskDate(value);
    if (name === 'creci') finalValue = maskCreci(value);
    
    if (name === 'vencimento') {
      finalValue = value.replace(/\D/g, '').substring(0, 2);
      if (parseInt(finalValue) > 31) finalValue = '31';
      if (finalValue === '00') finalValue = '01';
    }
    if (name === 'duracao') {
      finalValue = value.replace(/\D/g, '').substring(0, 2);
      if (finalValue === '00') finalValue = '01';
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (name === 'cep' && finalValue.replace(/\D/g, '').length === 8) {
      handleCepFetch(finalValue.replace(/\D/g, ''));
    }

    if (name === 'cnpjCpf' && finalValue.replace(/\D/g, '').length === 14) {
      handleCnpjFetch(finalValue.replace(/\D/g, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoFileName: file.name,
          logoPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.includes(service)
        ? prev.servicos.filter(s => s !== service)
        : [...prev.servicos, service]
    }));
  };

  const handleCnpjBlur = () => {
    const cleanCnpj = formData.cnpjCpf.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      handleCnpjFetch(cleanCnpj);
    }
  };

  const handleCnpjFetch = async (cnpj: string) => {
    try {
      setLoadingCnpj(true);
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razao_social || data.nome_fantasia || prev.razaoSocial,
        cep: data.cep ? maskCep(data.cep) : prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
      }));
    } catch {
      console.log("CNPJ não encontrado");
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleCepFetch = async (cep: string) => {
    try {
      setLoadingCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }));
      }
    } catch {
      console.log("CEP não encontrado");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        cnpj_cpf: formData.cnpjCpf,
        razao_social: formData.razaoSocial,
        rg: formData.rg,
        data_nascimento: formData.dataNascimento || null,
        telefone: formData.telefone,
        telefone_pessoal: formData.telefonePessoal,
        creci: formData.creci,
        email: formData.email,
        funcao_cargo: formData.funcao,
        logo_file_name: formData.logoFileName,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        tipo_imovel: formData.tipoImovel,
        servicos: formData.servicos,
        google_email: formData.googleEmail,
        google_password: formData.googlePassword,
        meta_email: formData.metaEmail,
        meta_password: formData.metaPassword,
        insta_login: formData.instaLogin,
        insta_pass: formData.instaPass,
        observacoes_acesso: formData.observacoesAcesso,
        logo_url: formData.logoPreview,
        valor_investimento: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        vencimento: formData.vencimento ? parseInt(formData.vencimento) || null : null,
        duracao_contrato: formData.duracao ? parseInt(formData.duracao) || null : null,
        data_inicio_contrato: formData.dataInicioContrato || null,
        pagamento: formData.pagamento
      };

      if (import.meta.env.VITE_SUPABASE_URL) {
        const { data: newClient, error: clientError } = await supabase
          .from('clientes_onboarding')
          .insert([payload])
          .select()
          .single();
        
        if (clientError) throw clientError;

        // Gerar Esteira de Mensalidades (Lote total via Utility)
        await generateInstallments({
          clienteId: (newClient as any).id,
          razaoSocial: formData.razaoSocial,
          valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          vencimento: formData.vencimento,
          duracao: formData.duracao,
          dataInicio: formData.dataInicioContrato
        });
      }
      await new Promise(r => setTimeout(r, 1500));
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro de envio (Build v26):', err);
      const msg = err.message || JSON.stringify(err);
      alert(`Erro ao enviar cadastro: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const sectionClass = "bg-[#ffffff] p-8 md:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden ring-1 ring-black/5";
  const labelClass = "block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2 ml-1";
  const inputClass = (fieldName: string) => `
    w-full bg-[#f8f9fa] border-2 px-5 py-4 rounded-2xl text-black font-medium outline-none transition-all
    ${focusedField === fieldName ? 'border-[#B9FF66] bg-white shadow-[0_0_20px_rgba(185,255,102,0.2)]' : 'border-black/5 hover:border-black/10'}
  `;

  if (success) {
    const handleCopyPix = () => {
      navigator.clipboard.writeText('52.672.332/0001-16'); 
      alert('CNPJ Copiado! ✅');
    };

    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-[#A3FF47] selection:text-black">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="aura-glass p-8 md:p-12 rounded-[48px] border border-white/10 max-w-2xl text-center bg-black/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          
          {/* Foto Dinâmica / Logo - Sem Filtros Neon */}
          <div className="w-28 h-28 bg-[#ffffff]/5 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-white/10 overflow-hidden">
            {formData.logoPreview ? (
              <img src={formData.logoPreview} alt="Logo Cliente" className="w-full h-full object-contain" />
            ) : (
              <span className="material-symbols-outlined text-white/20 text-5xl font-black">person</span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-none">
            {formData.razaoSocial}, <br/>
            <span className="text-[#A3FF47]">recebemos tudo com sucesso! 🚀</span>
          </h2>
          
          <p className="text-white/60 mb-12 text-lg font-medium">
            Para dar o play na sua estratégia agora, realize o pagamento abaixo:
          </p>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 mb-12 text-center relative overflow-hidden group max-w-lg mx-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3FF47]/5 blur-[60px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-[#A3FF47] mb-8 uppercase tracking-tighter">Ative seu Plano</h3>
              
              <div className="bg-black/40 border border-white/10 p-6 rounded-2xl mb-8 inline-block mx-auto min-w-[240px]">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Chave PIX (CNPJ)</span>
                <code className="text-white text-lg font-black tracking-wider block">
                  52.672.332/0001-16
                </code>
              </div>

              <button 
                onClick={handleCopyPix}
                className="w-full py-5 rounded-2xl bg-[#A3FF47] text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(163,255,71,0.2)]"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copiar Código Pix
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
              Suporte e Atendimento HS Visual
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
              <a 
                href="https://wa.me/5511953611000" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                WhatsApp
              </a>
              <a 
                href="https://www.instagram.com/hsvisual.oficial/" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all"
              >
                <span className="material-symbols-outlined text-lg">public</span>
                Instagram
              </a>
            </div>
          </div>

          <button onClick={() => window.location.href = '/'} className="mt-10 text-white/20 hover:text-[#A3FF47] text-[10px] font-black uppercase tracking-[0.4em] transition-colors">
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-20 px-4 md:px-0 selection:bg-[#B9FF66] selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full border border-[#B9FF66]/30 bg-[#B9FF66]/10 text-[#B9FF66] text-[10px] font-bold uppercase tracking-[0.3em] mb-6 shadow-glow-primary"
          >
            Partner Onboarding
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
            Dê o próximo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B9FF66] to-[#66FFED]">passo na Elite.</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">Preencha o formulário oficial para ativação do seu ecossistema de alta performance.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* FOTO / LOGO - CENTRALIZADO CIRCULAR */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-2 border-white/10 bg-[#111] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#B9FF66]">
                {formData.logoPreview ? (
                  <img src={formData.logoPreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-white/10 text-6xl">add_a_photo</span>
                )}
                <input
                  type="file" accept="image/*" onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
              </div>
              <div className="absolute -bottom-2 right-2 bg-[#B9FF66] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-[#050505] z-30">
                <span className="material-symbols-outlined text-sm">edit</span>
              </div>
            </div>
            <span className="mt-4 text-[10px] font-bold text-[#B9FF66] uppercase tracking-widest">Logo ou Foto do Perfil</span>
          </motion.div>

          {/* DADOS CADASTRAIS */}
          <motion.section className={sectionClass}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#B9FF66]">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight leading-none">Identificação</h2>
                <p className="text-black/30 text-xs font-bold uppercase tracking-wider mt-1">Dados Legais e Pessoais</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <label className={labelClass}>CNPJ ou CPF</label>
                <div className="relative">
                  <input
                    name="cnpjCpf" value={formData.cnpjCpf} onChange={handleChange} onBlur={handleCnpjBlur}
                    onFocus={() => setFocusedField('cnpjCpf')} placeholder="00.000.000/0000-00" required
                    className={inputClass('cnpjCpf')}
                  />
                  {loadingCnpj && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
              <div>
                <label className={labelClass}>Razão Social / Nome Completo</label>
                <input
                  name="razaoSocial" value={formData.razaoSocial} onChange={handleChange}
                  onFocus={() => setFocusedField('razaoSocial')} placeholder="Helder Silva" required
                  className={inputClass('razaoSocial')}
                />
              </div>
              <div>
                <label className={labelClass}>RG (Opcional)</label>
                <input
                  name="rg" value={formData.rg} onChange={(e) => setFormData(p => ({...p, rg: e.target.value}))}
                  onFocus={() => setFocusedField('rg')} placeholder="00.000.000-0"
                  className={inputClass('rg')}
                />
              </div>
              <div>
                <label className={labelClass}>Data de Nascimento (Opcional)</label>
                <input
                  name="dataNascimento" value={formData.dataNascimento} onChange={handleChange}
                  onFocus={() => setFocusedField('dataNascimento')} placeholder="00/00/0000"
                  className={inputClass('dataNascimento')}
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp (Comercial)</label>
                <input
                  name="telefone" value={formData.telefone} onChange={handleChange}
                  onFocus={() => setFocusedField('telefone')} placeholder="(00) 00000-0000" required
                  className={inputClass('telefone')}
                />
              </div>
              <div>
                <label className={labelClass}>Telefone Pessoal (Opcional)</label>
                <input
                  name="telefonePessoal" value={formData.telefonePessoal} onChange={handleChange}
                  onFocus={() => setFocusedField('telefonePessoal')} placeholder="(00) 00000-0000"
                  className={inputClass('telefonePessoal')}
                />
              </div>
              <div>
                <label className={labelClass}>CRECI</label>
                <input
                  name="creci" value={formData.creci} onChange={handleChange}
                  onFocus={() => setFocusedField('creci')} placeholder="00.000-F"
                  maxLength={15}
                  className={inputClass('creci')}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input
                  name="email" type="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} placeholder="email@exemplo.com"
                  className={inputClass('email')}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Função / Cargo</label>
                <input
                  name="funcao" value={formData.funcao} onChange={handleChange}
                  onFocus={() => setFocusedField('funcao')} placeholder="Ex: Corretora de Imóveis, Gestor, etc."
                  className={inputClass('funcao')}
                />
              </div>
            </div>
          </motion.section>

          {/* SERVIÇOS CONTRATADOS */}
          <motion.section className={sectionClass}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#66FFED]">
                <span className="material-symbols-outlined">layers</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight leading-none">Serviços</h2>
                <p className="text-black/30 text-xs font-bold uppercase tracking-wider mt-1">Escopo do Projeto</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Tráfego Pago', 'Social Media', 'Sites / Landing Page', 'Automação', 'Videomaker', 'Outros Tipos de Serviços'].map((service) => (
                <button
                  key={service} type="button"
                  onClick={() => toggleService(service)}
                  className={`
                    flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4
                    ${formData.servicos.includes(service) 
                      ? 'border-[#B9FF66] bg-[#B9FF66]/10 text-black shadow-lg' 
                      : 'border-black/5 hover:border-black/10 text-black/40'}
                  `}
                >
                  <span className="material-symbols-outlined text-4xl">
                    {service === 'Tráfego Pago' ? 'ads_click' : 
                     service === 'Social Media' ? 'share' :
                     service === 'Sites / Landing Page' ? 'web' : 
                     service === 'Automação' ? 'precision_manufacturing' : 
                     service === 'Videomaker' ? 'videocam' : 'settings'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">{service}</span>
                  {formData.servicos.includes(service) && <span className="material-symbols-outlined text-[#B9FF66] text-xl">check_circle</span>}
                </button>
              ))}
            </div>
          </motion.section>

          {/* ENDEREÇO */}
          <motion.section className={sectionClass}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#B9FF66]">
                <span className="material-symbols-outlined">map</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight leading-none">Localização</h2>
                <p className="text-black/30 text-xs font-bold uppercase tracking-wider mt-1">Endereço de Operação</p>
              </div>
            </div>

            <div className="mb-8">
              <label className={labelClass}>Tipo de Imóvel</label>
              <div className="flex gap-2 p-1 bg-[#f8f9fa] rounded-2xl border-2 border-black/5">
                {['Casa', 'Apartamento', 'Comercial'].map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => setFormData(p => ({...p, tipoImovel: type}))}
                    className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formData.tipoImovel === type ? 'bg-black text-[#B9FF66] shadow-lg' : 'text-black/30 hover:bg-black/5'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>CEP</label>
                <div className="relative">
                  <input
                    name="cep" value={formData.cep} onChange={handleChange}
                    onFocus={() => setFocusedField('cep')} placeholder="00000-000" required
                    className={inputClass('cep')}
                  />
                  {loadingCep && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Logradouro</label>
                <input
                  name="logradouro" value={formData.logradouro} onChange={handleChange}
                  onFocus={() => setFocusedField('logradouro')} placeholder="Rua, Avenida..." required
                  className={inputClass('logradouro')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Número</label>
                <input
                  name="numero" value={formData.numero} onChange={handleChange}
                  onFocus={() => setFocusedField('numero')} placeholder="123" required
                  className={inputClass('numero')}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Complemento</label>
                <input
                  name="complemento" value={formData.complemento} onChange={(e) => setFormData(p=>({...p, complemento: e.target.value}))}
                  onFocus={() => setFocusedField('complemento')} placeholder="Apto, Bloco, Sala..."
                  className={inputClass('complemento')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Bairro</label>
                <input
                  name="bairro" value={formData.bairro} onChange={handleChange}
                  onFocus={() => setFocusedField('bairro')} required
                  className={inputClass('bairro')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Cidade/UF</label>
                <input
                  value={`${formData.cidade}${formData.uf ? ' / ' + formData.uf : ''}`} readOnly
                  className={inputClass('cidade-uf') + " opacity-50 cursor-not-allowed"}
                />
              </div>
            </div>
          </motion.section>

          {/* ACESSOS ADS */}
          <motion.section className={sectionClass}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#B9FF66]">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight leading-none">Segurança</h2>
                <p className="text-black/30 text-xs font-bold uppercase tracking-wider mt-1">Acessos Publicitários</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* INSTAGRAM */}
              <div className="p-6 bg-[#f8f9fa] rounded-[24px] border-2 border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-black/20">photo_camera</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Instagram</span>
                </div>
                <div className="space-y-4">
                  <input name="instaLogin" type="text" autoComplete="off" value={formData.instaLogin} onChange={handleChange} placeholder="Login / Usuário" className={inputClass('instaLogin')} />
                  <div className="relative">
                    <input name="instaPass" type={showInstaPass ? "text" : "password"} autoComplete="new-password" value={formData.instaPass} onChange={handleChange} placeholder="Senha" className={inputClass('instaPass') + " pr-12"} />
                    <button type="button" onClick={() => setShowInstaPass(!showInstaPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black">
                      <span className="material-symbols-outlined text-[20px]">{showInstaPass ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* META / FACEBOOK */}
              <div className="p-6 bg-[#f8f9fa] rounded-[24px] border-2 border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-black/20">hub</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Meta / Facebook</span>
                </div>
                <div className="space-y-4">
                  <input name="metaEmail" type="email" autoComplete="off" value={formData.metaEmail} onChange={handleChange} placeholder="Email / Login" className={inputClass('metaEmail')} />
                  <div className="relative">
                    <input name="metaPassword" type={showMetaPass ? "text" : "password"} autoComplete="new-password" value={formData.metaPassword} onChange={handleChange} placeholder="Senha" className={inputClass('metaPassword') + " pr-12"} />
                    <button type="button" onClick={() => setShowMetaPass(!showMetaPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black">
                      <span className="material-symbols-outlined text-[20px]">{showMetaPass ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GOOGLE ADS */}
              <div className="p-6 bg-[#f8f9fa] rounded-[24px] border-2 border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-black/20">search</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Google Ads</span>
                </div>
                <div className="space-y-4">
                  <input name="googleEmail" type="email" autoComplete="off" value={formData.googleEmail} onChange={handleChange} placeholder="Email" className={inputClass('googleEmail')} />
                  <div className="relative">
                    <input name="googlePassword" type={showGooglePass ? "text" : "password"} autoComplete="new-password" value={formData.googlePassword} onChange={handleChange} placeholder="Senha" className={inputClass('googlePassword') + " pr-12"} />
                    <button type="button" onClick={() => setShowGooglePass(!showGooglePass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black">
                      <span className="material-symbols-outlined text-[20px]">{showGooglePass ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div className="p-6 bg-[#f8f9fa] rounded-[24px] border-2 border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-black/20">note_alt</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Observações de Acesso</span>
                </div>
                <textarea 
                  name="observacoesAcesso" 
                  value={formData.observacoesAcesso} 
                  onChange={(e) => setFormData(p => ({...p, observacoesAcesso: e.target.value}))} 
                  placeholder="Detalhes adicionais sobre logins, autenticação em duas etapas, etc."
                  className="w-full bg-[#f8f9fa] border-2 border-black/5 px-5 py-4 rounded-2xl text-black font-medium outline-none transition-all hover:border-black/10 focus:border-[#B9FF66] focus:bg-white h-[116px] resize-none"
                />
              </div>
            </div>
          </motion.section>

          {/* FATURAMENTO */}
          <motion.section className={sectionClass + " ring-2 ring-[#B9FF66]/20 bg-gradient-to-br from-white to-[#B9FF66]/5"}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#B9FF66]">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight leading-none">Faturamento</h2>
                <p className="text-black/30 text-xs font-bold uppercase tracking-wider mt-1">Acordo Comercial</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-1">
                <label className={labelClass}>Data Início</label>
                <input
                  type="date"
                  name="dataInicioContrato" value={formData.dataInicioContrato} onChange={handleChange}
                  onFocus={() => setFocusedField('dataInicioContrato')} required
                  className={inputClass('dataInicioContrato')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Valor Investimento</label>
                <input
                  name="valor" value={formData.valor} onChange={handleChange}
                  onFocus={() => setFocusedField('valor')} placeholder="R$ 0,00" required
                  className={inputClass('valor')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Dia Vencimento</label>
                <input
                  name="vencimento" value={formData.vencimento} onChange={handleChange}
                  onFocus={() => setFocusedField('vencimento')} placeholder="01 a 31" required
                  className={inputClass('vencimento')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Duração (Meses)</label>
                <input
                  name="duracao" value={formData.duracao} onChange={handleChange}
                  onFocus={() => setFocusedField('duracao')} placeholder="12" required
                  className={inputClass('duracao')}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Método</label>
                <select name="pagamento" value={formData.pagamento} onChange={handleChange} className={inputClass('pagamento')}>
                  <option value="Boleto">Boleto (Automático)</option>
                  <option value="Pix">Pix Instantâneo</option>
                  <option value="Cartão">Cartão de Crédito</option>
                  <option value="Outros">Outros Métodos</option>
                </select>
              </div>
            </div>
          </motion.section>

          {/* DECLARAÇÃO DE ACEITE */}
          <motion.div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-black/5 flex items-start gap-4">
            <div className="pt-1">
              <input 
                type="checkbox" 
                id="declaration"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-6 h-6 rounded-lg border-2 border-black/10 checked:bg-[#B9FF66] checked:border-[#B9FF66] transition-all cursor-pointer accent-[#B9FF66]"
              />
            </div>
            <label htmlFor="declaration" className="text-sm text-black/60 leading-relaxed cursor-pointer select-none">
              Declaro que as informações acima são verdadeiras e estou ciente de que a equipe <span className="font-bold text-[#A3FF47]">HS Visual</span> utilizará esses dados para a configuração das minhas contas de anúncios e elaboração do contrato de prestação de serviços.
            </label>
          </motion.div>

          <button
            type="submit" disabled={submitting || !acceptedTerms}
            className="w-full h-20 rounded-[32px] bg-[#B9FF66] text-black font-black text-xl uppercase tracking-widest hover:bg-[#a3eb52] transition-all shadow-glow-primary flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {submitting ? (
              <>Criptografando... <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div></>
            ) : (
              <>Finalizar Cadastro <span className="material-symbols-outlined">rocket_launch</span></>
            )}
          </button>
          
        </form>
        
        <div className="mt-12 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">
          Powered by HS Visual Intelligence
        </div>
      </div>

      {/* WHATSAPP FLUTUANTE */}
      <div className="fixed bottom-8 right-8 z-[100] group flex items-end gap-3 translate-x-1/4 hover:translate-x-0 transition-transform md:translate-x-0">
        <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-black/5 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">Dúvidas no preenchimento?</span>
        </div>
        <a 
          href="https://wa.me/5511953611000" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-16 h-16 bg-[#25D366] text-white rounded-[24px] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
