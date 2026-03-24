import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Tipos ────────────────────────────────────────────
export interface AppSettings {
  user_id: string | null;
  user_email: string | null;
  agency_name: string;
  agency_logo_url: string | null;
  admin_avatar_url: string | null;
  signature_url: string | null;
  cnpj: string;
  whatsapp_template: string;
  openai_key: string;
}

interface AppContextValue {
  settings: AppSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

// ─── Defaults ─────────────────────────────────────────
const DEFAULT_SETTINGS: AppSettings = {
  user_id: null,
  user_email: null,
  agency_name: 'HS Visual Intelligence',
  agency_logo_url: null,
  admin_avatar_url: null,
  signature_url: null,
  cnpj: '',
  whatsapp_template: '',
  openai_key: '',
};

// ─── Contexto ─────────────────────────────────────────
const AppContext = createContext<AppContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: async () => {},
});

// ─── Hook ─────────────────────────────────────────────
export function useAppContext() {
  return useContext(AppContext);
}

// ─── Provider ─────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }

      const { data } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', user.id)
        .single();

      setSettings({
        user_id: user.id,
        user_email: user.email ?? null,
        agency_name: data?.agency_name || 'HS Visual Intelligence',
        agency_logo_url: data?.agency_logo_url ?? null,
        admin_avatar_url: data?.admin_avatar_url ?? null,
        signature_url: data?.signature_url ?? null,
        cnpj: data?.cnpj || '',
        whatsapp_template: data?.whatsapp_template || '',
        openai_key: data?.openai_key || '',
      });
    } catch {
      // Sem configurações, usa padrão
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega ao montar e ao trocar de sessão
  useEffect(() => {
    fetch();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetch();
    });
    return () => subscription.unsubscribe();
  }, [fetch]);

  // ── Favicon Dinâmico ──────────────────────────────────
  // Atualiza o ícone da aba do navegador sempre que o logo mudar
  useEffect(() => {
    const link = document.getElementById('favicon-link') as HTMLLinkElement
      || document.querySelector("link[rel~='icon']") as HTMLLinkElement;

    if (!link) return;

    if (settings.agency_logo_url) {
      // Usa o logo da empresa como favicon
      link.href = settings.agency_logo_url;
      link.type = 'image/png'; // logos do Supabase são PNG
    } else {
      // Fallback: HS Visual Gold SVG
      link.href = '/favicon.svg';
      link.type = 'image/svg+xml';
    }
  }, [settings.agency_logo_url]);

  return (
    <AppContext.Provider value={{ settings, loading, refresh: fetch }}>
      {children}
    </AppContext.Provider>
  );
};
