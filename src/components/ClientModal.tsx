import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { maskPhone, maskCnpjCpf, maskCurrency, maskDate, maskCep, maskCreci } from '../utils/masks';
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
        dataInicio: formData.data_inicio_contrato
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
          className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-white/10 p-0.5 bg-black overflow-hidden flex items-center justify-center">
                <img 
                  src={formData.logo_url || 'https://via.placeholder.com/150'} 
                  className="w-full h-full object-cover rounded-full"
                  alt="Logo"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{mode === 'view' ? 'Dossiê do Cliente' : 'Editar Cadastro'}</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">{formData.empresa}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mode === 'view' && (
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  formData.status === 'Ativo' 
                    ? 'bg-[#A3FF47]/10 border-[#A3FF47]/30 text-[#A3FF47]' 
                    : formData.status === 'Pendente'
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]'
                    : formData.status === 'Atrasado'
                    ? 'bg-[#FF4B2B]/10 border-[#FF4B2B]/30 text-[#FF4B2B]'
                    : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {formData.status || 'Pendente'}
                </div>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Seção Principal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {renderField('Nome Completo', formData.nome, 'nome')}
              {renderField('Razão Social', formData.razao_social, 'razao_social')}
              {mode === 'edit' && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#A3FF47] font-bold">Situação Financeira</label>
                  <select 
                    value={formData.status || 'Pendente'} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#A3FF47]/50 outline-none transition-all mt-1"
                  >
                    <option value="Pendente" className="bg-[#0A0A0A]">Pendente</option>
                    <option value="Ativo" className="bg-[#0A0A0A]">Ativo</option>
                    <option value="Atrasado" className="bg-[#0A0A0A]">Atrasado</option>
                    <option value="Inativo" className="bg-[#0A0A0A]">Inativo</option>
                  </select>
                </div>
              )}
              {renderField('CNPJ / CPF', formData.cnpj_cpf, 'cnpj_cpf', maskCnpjCpf)}
              {renderField('RG', formData.rg, 'rg')}
              {renderField('Data Nascimento', formData.data_nascimento, 'data_nascimento', maskDate)}
              {renderField('WhatsApp', formData.telefone, 'telefone', maskPhone)}
              {renderField('Telefone Pessoal', formData.telefone_pessoal, 'telefone_pessoal', maskPhone)}
              {renderField('E-mail', formData.email, 'email')}
              {renderField('CRECI', formData.creci, 'creci', maskCreci)}
              {renderField('Função / Cargo', formData.funcao_cargo, 'funcao_cargo')}
            </div>

            <div className="h-px bg-white/5" />

            {/* Seção Endereço */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A3FF47] mb-4">Endereço & Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderField('CEP', formData.cep, 'cep', maskCep)}
                {renderField('Logradouro', formData.logradouro, 'logradouro')}
                {renderField('Número', formData.numero, 'numero')}
                {renderField('Bairro', formData.bairro, 'bairro')}
                {renderField('Cidade', formData.cidade, 'cidade')}
                {renderField('UF', formData.uf, 'uf')}
                {renderField('Tipo Imóvel', formData.tipo_imovel, 'tipo_imovel')}
                {renderField('Complemento', formData.complemento, 'complemento')}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Seção Acessos */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A3FF47] mb-4">Credenciais de Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3FF47] block mb-3">Instagram</span>
                  {renderField('Login', formData.insta_login, 'insta_login')}
                  {renderField('Senha', formData.insta_pass, 'insta_pass')}
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3FF47] block mb-3">Meta / Facebook</span>
                  {renderField('Email', formData.meta_email, 'meta_email')}
                  {renderField('Senha', formData.meta_password, 'meta_password')}
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3FF47] block mb-3">Google Ads</span>
                  {renderField('Email', formData.google_email, 'google_email')}
                  {renderField('Senha', formData.google_password, 'google_password')}
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3FF47] block mb-3">Observações</span>
                  {mode === 'view' ? (
                    <p className="text-xs text-white/60 leading-relaxed font-medium mt-1">{formData.observacoes_acesso || '---'}</p>
                  ) : (
                    <textarea 
                      value={formData.observacoes_acesso || ''} 
                      onChange={(e) => setFormData({ ...formData, observacoes_acesso: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-[#A3FF47] h-20 resize-none"
                    />
                  )}
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

          {/* Footer */}
          {mode === 'edit' && (
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-2 rounded-xl bg-[#A3FF47] text-black text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(163,255,71,0.2)]"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
