import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { maskPhone, maskCnpjCpf, maskCurrency, maskCep, maskCreci } from '../utils/masks';
import { generateInstallments } from '../utils/finance';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  mode: 'view' | 'edit';
  onSave: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client, mode, onSave }) => {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [showTiktokPass, setShowTiktokPass] = useState(false); // v44 toggle

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

  const handleCnpjFetch = async (cnpj: string) => {
    try {
      setLoadingCnpj(true);
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setFormData((prev: any) => ({
        ...prev,
        razao_social: data.razao_social || data.nome_fantasia || prev.razao_social,
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
        setFormData((prev: any) => ({
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

  if (!isOpen || !formData) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanData = { ...formData };
      delete cleanData.id;
      delete cleanData.created_at;
      
      // Limpeza Rigorosa de Dados v26
      Object.keys(cleanData).forEach(key => {
        // Tratar Strings Vazias em campos de data como NULL
        if (key.includes('data') && cleanData[key] === '') {
          cleanData[key] = null;
        }
        // Tratar campo vencimento como número ou null
        if (key === 'vencimento' && cleanData[key] === '') {
          cleanData[key] = null;
        }
      });

      // Limpeza de Moeda -> Float puro
      if (cleanData.valor_investimento) {
        const val = String(cleanData.valor_investimento);
        cleanData.valor_investimento = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      }

      // Validação v44: Site URL
      if (cleanData.site_url && !cleanData.site_url.startsWith('http')) {
        cleanData.site_url = `https://${cleanData.site_url}`;
      }

      const { error } = await supabase
        .from('clientes_onboarding')
        .update(cleanData)
        .eq('id', client.id);

      if (error) throw error;

      // Sincronização Automática da Esteira Financeira
      const numericValue = typeof formData.valor_investimento === 'string' 
        ? parseFloat(formData.valor_investimento.replace(/[^\d,]/g, '').replace(',', '.')) || 0
        : formData.valor_investimento;

      await generateInstallments({
        clienteId: client.id,
        razaoSocial: formData.razao_social || formData.nome,
        valor: numericValue,
        vencimento: formData.vencimento,
        duracao: formData.duracao_contrato,
        dataInicio: formData.data_inicio_contrato // v45: Passando string YYYY-MM-DD pura
      });

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar (Build v26):', err);
      const msg = err.message || JSON.stringify(err);
      alert(`Erro ao salvar alterações: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: any, field?: string, mask?: (v: string) => string) => {
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (mask) val = mask(val);
      const nextData = { ...formData, [field!]: val };
      setFormData(nextData);

      // Instant Fetch
      if (field === 'cnpj_cpf') {
        const clean = val.replace(/\D/g, '');
        if (clean.length === 14) handleCnpjFetch(clean);
      }
      if (field === 'cep') {
        const clean = val.replace(/\D/g, '');
        if (clean.length === 8) handleCepFetch(clean);
      }
    };

    const displayValue = (mask && value) ? mask(value) : value;

    if (mode === 'view') {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
          <span className="text-sm text-white/90">{displayValue || '---'}</span>
        </div>
      );
    }

    const handleBlur = () => {
      if (field === 'cnpj_cpf') {
        const clean = (value || '').replace(/\D/g, '');
        if (clean.length === 14) handleCnpjFetch(clean);
      }
      if (field === 'cep') {
        const clean = (value || '').replace(/\D/g, '');
        if (clean.length === 8) handleCepFetch(clean);
      }
    };

    return (
      <div className="flex flex-col gap-1 relative">
        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold text-[#A3FF47]">{label}</label>
        <div className="relative">
          <input
            type={field?.includes('data') ? 'date' : 'text'}
            value={value || ''}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A3FF47]/50 outline-none transition-all ${
              (field === 'cnpj_cpf' && loadingCnpj) || (field === 'cep' && loadingCep) ? 'opacity-50' : ''
            }`}
          />
          {((field === 'cnpj_cpf' && loadingCnpj) || (field === 'cep' && loadingCep)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#A3FF47]"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-[#0B0B0B] border border-[#141414] rounded-[48px] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh]"
        >
          {/* Header - Neon Noir Executive v43 */}
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#141414]/40 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#E01183]/30 p-1 bg-black overflow-hidden flex items-center justify-center">
                <img 
                  src={formData.logo_url || 'https://via.placeholder.com/150'} 
                  className="w-full h-full object-cover rounded-full"
                  alt="Logo"
                />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter leading-none font-['Space_Grotesk']">
                  {mode === 'view' ? 'Dossiê do Lead' : 'Ajuste Estratégico'}
                </h2>
                <p className="text-[#20C2AE] text-[11px] uppercase tracking-[0.3em] font-black mt-2">
                  {formData.empresa || 'Unidade HS Visual Oficial'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {mode === 'view' && (
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                  formData.status === 'Ativo' 
                    ? 'bg-[#20C2AE]/5 border-[#20C2AE]/20 text-[#20C2AE]' 
                    : formData.status === 'Pendente'
                    ? 'bg-[#FFD700]/5 border-[#FFD700]/20 text-[#FFD700]'
                    : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {formData.status || 'Análise Pendente'}
                </div>
              )}
              <button 
                onClick={onClose} 
                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all text-white/40"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* Content - Separado por Seções Nobles */}
          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-gradient-to-b from-[#0B0B0B] to-[#141414]">
            
            {/* 🤖 SEÇÃO SCRIPT IA - PRIORIDADE v43 */}
            {mode === 'view' && (formData.resumo_ia || formData.resumo_conversa) && (
              <div className="relative p-8 bg-[#141414] border border-[#20C2AE]/20 rounded-[32px] shadow-[0_20px_60px_rgba(32,194,174,0.05)]">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#20C2AE] text-black px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Insight Multimodal
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#20C2AE] mb-5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                  Análise Estratégica da Aura IA
                </h3>
                <div className="text-base text-[#F0F0F0] leading-relaxed font-['Plus_Jakarta_Sans'] italic pl-4 border-l-2 border-[#20C2AE]/30 py-1">
                   {formData.resumo_ia || formData.resumo_conversa}
                </div>
                <p className="mt-8 text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] text-right">
                  Curadoria Técnica: Helder Bezerra Ferreira
                </p>
              </div>
            )}

            {/* SEÇÃO DOSSIÊ (Dados do Cliente) */}
            <div className="space-y-10">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-white/10" />
                Dados Identificadores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {renderField('Nome do Lead', formData.nome, 'nome')}
                {renderField('Razão Social / Nome Fantasia', formData.razao_social, 'razao_social')}
                {renderField('Endereço Oficial (URL)', formData.site_url, 'site_url')}
                {renderField('WhatsApp de Contato', formData.telefone, 'telefone', maskPhone)}
                {renderField('Status Operacional', formData.status, 'status')}
                {renderField('CRECI / Registro', formData.creci, 'creci', maskCreci)}
                {renderField('E-mail Corporativo', formData.email, 'email')}
              </div>
            </div>

            <div className="h-px bg-white/5 opacity-40 mx-10" />

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-white/10" />
                Dossiê de Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {renderField('Cidade', formData.cidade, 'cidade')}
                {renderField('Estado (UF)', formData.uf, 'uf')}
                {renderField('Bairro', formData.bairro, 'bairro')}
                {renderField('CNPJ / CPF', formData.cnpj_cpf, 'cnpj_cpf', maskCnpjCpf)}
              </div>
            </div>

            <div className="h-px bg-white/5 opacity-40 mx-10" />

            {/* Seção Acessos - Reestilizada v43 */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20 mb-8 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-white/10" />
                Infraestrutura & Acessos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E01183] block">Meta Ads / FB</span>
                  {renderField('Identificador', formData.meta_email, 'meta_email')}
                  {renderField('Chave de Acesso', formData.meta_password, 'meta_password')}
                </div>
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#20C2AE] block">Instagram</span>
                  {renderField('User @', formData.insta_login, 'insta_login')}
                  {renderField('Chave de Acesso', formData.insta_pass, 'insta_pass')}
                </div>
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/80 block">Google Ads</span>
                  {renderField('E-mail Mestre', formData.google_email, 'google_email')}
                  {renderField('Chave de Acesso', formData.google_password, 'google_password')}
                </div>
                {/* TikTok Ads - v44 Nova Linha Premium */}
                <div className="p-6 bg-black/40 rounded-3xl border border-[#20C2AE]/10 space-y-4 hover:border-[#20C2AE]/30 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#20C2AE] block">TikTok Ads</span>
                    {mode === 'edit' && (
                      <button 
                        onClick={() => setShowTiktokPass(!showTiktokPass)}
                        className="text-white/20 hover:text-[#20C2AE] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showTiktokPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    )}
                  </div>
                  {renderField('Login TikTok', formData.tiktok_login, 'tiktok_login')}
                  <div className="relative">
                    {mode === 'edit' ? (
                      <div className="flex flex-col gap-1 relative">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Chave de Acesso</label>
                        <input
                          type={showTiktokPass ? 'text' : 'password'}
                          value={formData.tiktok_password || ''}
                          onChange={(e) => setFormData({ ...formData, tiktok_password: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#20C2AE]/50 outline-none transition-all"
                        />
                      </div>
                    ) : (
                      renderField('Chave de Acesso', formData.tiktok_password ? (showTiktokPass ? formData.tiktok_password : '••••••••') : '---', 'tiktok_password')
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Seção Negócio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A3FF47] mb-6">Serviços & Faturamento</h3>
              
              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-4">Escopo do Projeto</span>
                {mode === 'view' ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.servicos?.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest">
                        {s}
                      </span>
                    )) || <span className="text-white/20 italic text-xs">Nenhum serviço</span>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {['Tráfego Pago', 'Social Media', 'Sites / Landing Page', 'Automação', 'Videomaker', 'Outros Tipos de Serviços'].map((service) => {
                      const isSelected = formData.servicos?.includes(service);
                      const toggleService = () => {
                        const current = formData.servicos || [];
                        const next = isSelected 
                          ? current.filter((s: string) => s !== service)
                          : [...current, service];
                        setFormData({ ...formData, servicos: next });
                      };

                      return (
                        <button
                          key={service} type="button"
                          onClick={toggleService}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                            isSelected 
                              ? 'border-[#A3FF47] bg-[#A3FF47]/10 text-white' 
                              : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {service === 'Tráfego Pago' ? 'ads_click' : 
                             service === 'Social Media' ? 'share' :
                             service === 'Sites / Landing Page' ? 'web' : 
                             service === 'Automação' ? 'precision_manufacturing' : 
                             service === 'Videomaker' ? 'videocam' : 'settings'}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest">{service}</span>
                          {isSelected && <span className="material-symbols-outlined text-[#A3FF47] text-sm ml-auto">check_circle</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {renderField('Data Início', formData.data_inicio_contrato, 'data_inicio_contrato')}
                {renderField('Duração (Meses)', formData.duracao_contrato, 'duracao_contrato')}
                {renderField('Valor Investimento', formData.valor_investimento, 'valor_investimento', maskCurrency)}
                {renderField('Vencimento (Dia)', formData.vencimento, 'vencimento')}
                {renderField('Forma Pagamento', formData.pagamento, 'pagamento')}
              </div>
            </div>
          </div>

          {/* Footer - v43 Neon Refined */}
          {mode === 'edit' && (
            <div className="p-8 border-t border-white/5 bg-[#141414]/20 flex justify-end gap-6">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all underline decoration-[#E01183]/30"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-10 py-3 rounded-full bg-[#E01183] text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-[0_15px_40px_rgba(224,17,131,0.3)]"
              >
                {loading ? 'Sincronizando...' : 'Efetivar Alterações'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
