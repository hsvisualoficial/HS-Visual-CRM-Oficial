import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ppwaxkfpbnhdrwiholdw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2F4a2ZwYm5oZHJ3aWhvbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzgwOTAsImV4cCI6MjA4OTU1NDA5MH0.adROp-aHoQ0GgkCWEIwHy6ESct-267t7y5UQivLPBws';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase URL não encontrada nas variáveis de ambiente! Usando fallback de emergência.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
