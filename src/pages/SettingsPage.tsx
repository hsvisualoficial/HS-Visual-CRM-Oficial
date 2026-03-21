import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showDbKey, setShowDbKey] = useState(false);

  // Estados dos campos
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [supabaseUri, setSupabaseUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('configuracoes')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setAgencyName(data.agency_name || '');
          setCnpj(data.cnpj || '');
          setWhatsappTemplate(data.whatsapp_template || '');
          setOpenaiKey(data.openai_key || '');
          setSupabaseUri(data.supabase_uri || '');
          setAgencyLogo(data.agency_logo_url || null);
          setAdminAvatar(data.admin_avatar_url || null);
          setSignatureUrl(data.signature_url || null);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'avatar' | 'signature') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSaving(true);
      try {
        const publicUrl = await uploadFile(file, 'brand_assets', type);
        if (type === 'logo') setAgencyLogo(publicUrl);
        if (type === 'avatar') setAdminAvatar(publicUrl);
        if (type === 'signature') setSignatureUrl(publicUrl);
      } catch (err) {
        console.error('Erro no upload:', err);
        setSaveStatus('error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from('configuracoes').upsert({
        id: user.id,
        agency_name: agencyName,
        cnpj: cnpj,
        whatsapp_template: whatsappTemplate,
        openai_key: openaiKey,
        supabase_uri: supabaseUri,
        agency_logo_url: agencyLogo,
        admin_avatar_url: adminAvatar,
        signature_url: signatureUrl,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B9FF66]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 md:pb-0 md:pl-20 relative">
      <Sidebar />
      
      <main className="pt-12 md:pt-16 px-6 max-w-5xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter font-plus-jakarta mb-2">Setup / Identidade</h1>
          <p className="text-white/60">Configure o branding da sua agência, contratos e automações.</p>
        </div>

        <div className="space-y-8">
          
          {/* Identidade Visual (Uploads) */}
          <section className="aura-glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold tracking-tight mb-8 font-plus-jakarta border-b border-white/10 pb-4 text-[#B9FF66]">Identidade Visual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="flex flex-col gap-4 items-center text-center">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold w-full">Logo da Empresa</label>
                <div className="w-32 h-32 rounded-full bg-black/40 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden group hover:border-[#B9FF66]/50 transition-colors cursor-pointer">
                  {agencyLogo ? (
                    <img src={agencyLogo} alt="Logo" className="w-[70%] h-[70%] object-contain opacity-90 filter drop-shadow-[0_0_10px_rgba(185,255,102,0.3)]" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-white/20 group-hover:text-[#B9FF66] transition-colors">domain</span>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="flex flex-col gap-4 items-center text-center">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold w-full">Foto de Perfil</label>
                <div className="w-32 h-32 rounded-full bg-black/40 border-2 border-dashed border-[#B9FF66]/30 flex items-center justify-center relative overflow-hidden group hover:border-[#B9FF66] transition-colors cursor-pointer">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-[#B9FF66]/40 group-hover:text-[#B9FF66] transition-colors">account_circle</span>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, 'avatar')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Box: Assinatura Digital */}
              <div className="flex flex-col gap-4 items-center">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold w-full text-left">Assinatura Digital (Contratos)</label>
                <div className="h-32 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center relative overflow-hidden group hover:border-white/50 transition-colors w-full cursor-pointer px-4">
                  {signatureUrl ? (
                    <img src={signatureUrl} alt="Assinatura" className="w-full h-full object-contain filter invert mix-blend-screen opacity-70" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-white/20 group-hover:text-white/60 transition-colors">draw</span>
                  )}
                  <input type="file" onChange={(e) => handleFileUpload(e, 'signature')} accept="image/png" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-[10px] text-white/30 text-center uppercase tracking-widest">Somente arquivo PNG vazio/fundo transparente</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Nome da Agência</label>
                <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]/50 transition-all font-plus-jakarta" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold">CNPJ Matriz</label>
                <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]/50 transition-all font-plus-jakarta" />
              </div>
            </div>
          </section>

          {/* Automação do WhatsApp */}
          <section className="aura-glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold tracking-tight mb-6 font-plus-jakarta border-b border-white/10 pb-4 text-[#25D366]">Automação WhatsApp</h3>
            <div className="flex flex-col gap-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-bold flex justify-between">
                Template de Abordagem Base (IA Script)
                <span className="text-[#25D366]">Variáveis Disponíveis: {"{cliente.nome}"}, {"{cliente.foco}"}</span>
              </label>
              <textarea 
                rows={4}
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#25D366] transition-all resize-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] leading-relaxed"
              />
            </div>
          </section>

          {/* Setup Cloud (Integrações Originais) */}
          <section className="aura-glass p-8 rounded-2xl border border-white/5 mb-12">
            <h3 className="text-xl font-bold tracking-tight mb-6 font-plus-jakarta border-b border-white/10 pb-4">Cloud & Chaves de Acesso</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold">OpenAI API Key</label>
                <div className="relative">
                  <input type={showApiKey ? "text" : "password"} value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-white transition-all font-mono tracking-widest" />
                  <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showApiKey ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-bold">Supabase Connection URI</label>
                <div className="relative">
                  <input type={showDbKey ? "text" : "password"} value={supabaseUri} onChange={(e) => setSupabaseUri(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-white transition-all font-mono tracking-widest" />
                  <button onClick={() => setShowDbKey(!showDbKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showDbKey ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-end gap-6">
              {saveStatus === 'success' && (
                <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[#B9FF66] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Configurações Salvas!
                </motion.span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  Erro ao salvar
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#B9FF66] text-black px-10 py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-3 glow-primary disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'cloud_upload'}</span>
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </section>

        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};
