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
    // Use Core Hub credentials for migration
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

    console.log('Setting root system prompt for Nakamoto via kb_docs fallback');

    // Find the Nakamoto Root Corpus (same logic as KB import)
    let corpus = await supabase
      .from('kb_corpora')
      .select('id')
      .eq('site_id', 'nakamoto')
      .eq('name', 'Nakamoto Root Corpus')
      .single();

    if (corpus.error || !corpus.data) {
      throw new Error('Nakamoto corpus not found. Please run this SQL on your Core Hub:\n\n' +
        `INSERT INTO kb.corpora (tenant_id, site_id, name, description)\n` +
        `VALUES (\n` +
        `  '00000000-0000-0000-0000-000000000000',\n` +
        `  'nakamoto',\n` +
        `  'Nakamoto Root Corpus',\n` +
        `  'Root knowledge base for Nakamoto platform'\n` +
        `) ON CONFLICT (tenant_id, site_id) DO NOTHING;`
      );
    }

    if (!corpus.data) {
      throw new Error('Failed to find Nakamoto corpus');
    }

    const ROOT_TENANT = '00000000-0000-0000-0000-000000000000';
    const TITLE = 'Nakamoto Root System Prompt';

    // Check if a prompt doc already exists
    const { data: existing } = await supabase
      .from('kb_docs')
      .select('id, version')
      .eq('corpus_id', corpus.data.id)
      .eq('tenant_id', ROOT_TENANT)
      .eq('title', TITLE)
      .single();

    let version = 1;
    if (existing) {
      version = (existing.version || 1) + 1;
      const { error: updateError } = await supabase
        .from('kb_docs')
        .update({
          content: prompt_text,
          content_type: 'text/markdown',
          metadata: { ...(metadata || {}), type: 'root_system_prompt' },
          is_active: true,
          version
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating prompt doc:', updateError);
        throw updateError;
      }

      console.log(`Updated existing root prompt doc (version ${version})`);

      return new Response(
        JSON.stringify({ success: true, stored_in: 'kb_docs', version, doc_id: existing.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new prompt doc
    const { data: newDoc, error: insertError } = await supabase
      .from('kb_docs')
      .insert({
        corpus_id: corpus.data.id,
        tenant_id: ROOT_TENANT,
        title: TITLE,
        content: prompt_text,
        content_type: 'text/markdown',
        tags: ['system', 'prompt'],
        storage_path: null,
        metadata: { ...(metadata || {}), type: 'root_system_prompt' },
        is_active: true,
        version
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting prompt doc:', insertError);
      throw insertError;
    }

    console.log(`Inserted new root prompt doc (version ${version})`);

    return new Response(
      JSON.stringify({ success: true, stored_in: 'kb_docs', version, doc_id: newDoc.id }),
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
