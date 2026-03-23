import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AppSettings {
  agency_name: string;
  agency_logo_url: string | null;
  admin_avatar_url: string | null;
  signature_url: string | null;
  cnpj: string;
  whatsapp_template: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  agency_name: 'HS Visual Intelligence',
  agency_logo_url: null,
  admin_avatar_url: null,
  signature_url: null,
  cnpj: '',
  whatsapp_template: '',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
          setSettings({
            agency_name: data.agency_name || 'HS Visual Intelligence',
            agency_logo_url: data.agency_logo_url || null,
            admin_avatar_url: data.admin_avatar_url || null,
            signature_url: data.signature_url || null,
            cnpj: data.cnpj || '',
            whatsapp_template: data.whatsapp_template || '',
          });
        }
      } catch (err) {
        console.warn('Configurações não encontradas, usando padrão.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
