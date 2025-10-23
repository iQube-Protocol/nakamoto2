import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use Core Hub credentials
    const coreUrl = Deno.env.get('CORE_SUPABASE_URL')!;
    const coreServiceKey = Deno.env.get('CORE_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(coreUrl, coreServiceKey);

    const { prompt_text, metadata } = await req.json();
    
    if (!prompt_text) {
      return new Response(
        JSON.stringify({ error: 'prompt_text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Setting root system prompt for Nakamoto via RPC');

    const ROOT_TENANT = '00000000-0000-0000-0000-000000000000';

    // Ensure or create the Root corpus via RPC
    const { data: corpusId, error: corpusErr } = await supabase.rpc('ensure_corpus', {
      _tenant: ROOT_TENANT,
      _app: 'nakamoto',
      _name: 'Root',
      _scope: 'root',
      _description: 'Root knowledge base for Nakamoto platform'
    });

    if (corpusErr || !corpusId) {
      throw new Error(`Failed to ensure/get Root corpus: ${corpusErr?.message || 'unknown error'}`);
    }

    const TITLE = 'Nakamoto Root System Prompt';

    // Upsert the prompt doc via RPC
    const { data: upsertRes, error: upsertErr } = await supabase.rpc('upsert_kb_doc', {
      _corpus_id: corpusId,
      _tenant: ROOT_TENANT,
      _title: TITLE,
      _content_text: prompt_text,
      _tags: ['system', 'prompt'],
      _storage_path: null,
      _metadata: { ...(metadata || {}), type: 'root_system_prompt' }
    });

    if (upsertErr) {
      console.error('Error upserting prompt doc:', upsertErr);
      throw upsertErr;
    }

    console.log(`Upserted root prompt doc`, upsertRes);

    return new Response(
      JSON.stringify({ success: true, stored_in: 'kb.docs', ...upsertRes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});