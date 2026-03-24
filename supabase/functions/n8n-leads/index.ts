// Supabase Edge Function: n8n-leads
// Deploy via: supabase functions deploy n8n-leads

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-n8n-api-key',
};

Deno.serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { method } = req;
    if (method !== 'POST') throw new Error('Method not allowed');

    // 2. Security Check (Basic API_KEY)
    const apiKey = req.headers.get('x-n8n-api-key');
    const EXPECTED_KEY = 'HS_VISUAL_N8N_SECRET_2024';

    if (apiKey !== EXPECTED_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { clientId, resumo_ia, status_lead, imobiliaria_nome } = await req.json();

    if (!clientId) throw new Error('Missing clientId');

    // 3. Initialize Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Update Client Data (v40 focus)
    const { data, error } = await supabase
      .from('clientes_onboarding')
      .update({
        resumo_ia,
        status_lead,
        imobiliaria_nome,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select();

    if (error) throw error;

    console.log(`[v40] Lead ${clientId} qualificado por n8n. Autoridade: HELDER BEZERRA FERREIRA`);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
