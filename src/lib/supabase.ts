import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjozbbdgtngljujcuhxk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3piYmRndG5nbGp1amN1aHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjE0MTQsImV4cCI6MjA4OTY5NzQxNH0.qGGqbtDJjoyGrXOJNAjlZjZqbj61uhsKvde55fW5mJk';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase URL não encontrada nas variáveis de ambiente! Usando fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
