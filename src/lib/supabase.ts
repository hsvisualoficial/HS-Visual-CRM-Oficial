import { createClient } from '@supabase/supabase-js';

// URL e chave hardcoded para garantir funcionamento independente de variáveis de ambiente
const supabaseUrl = 'https://pjozbbdgtngljujcuhxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3piYmRndG5nbGp1amN1aHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjE0MTQsImV4cCI6MjA4OTY5NzQxNH0.qGGqbtDJjoyGrXOJNAjlZjZqbj61uhsKvde55fW5mJk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
