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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      tenant_id, 
      title, 
      content_text, 
      source_uri, 
      lang = 'en',
      tags = [],
      metadata = {}
    } = await req.json();
    
    if (!tenant_id || !title) {
      return new Response(
        JSON.stringify({ error: 'tenant_id and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Upserting tenant KB document for tenant ${tenant_id}: "${title}"`);

    // Get the root corpus ID
    const { data: corpus } = await supabase
      .from('kb.corpora')
      .select('id')
      .eq('app', 'nakamoto')
      .eq('name', 'Root')
      .single();

    if (!corpus) {
      throw new Error('Root corpus not found');
    }

    // Check if tenant doc already exists
    const { data: existing } = await supabase
      .from('kb.docs')
      .select('id, version')
      .eq('corpus_id', corpus.id)
      .eq('scope', 'tenant')
      .eq('tenant_id', tenant_id)
      .eq('title', title)
      .single();

    let result;

    if (existing) {
      // Update existing tenant doc
      const { data: updated, error: updateError } = await supabase
        .from('kb.docs')
        .update({
          content_text,
          source_uri,
          lang,
          tags,
          metadata,
          version: existing.version + 1
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = updated;
      console.log(`Updated tenant doc "${title}" (version ${result.version})`);
    } else {
      // Insert new tenant doc
      const { data: inserted, error: insertError } = await supabase
        .from('kb.docs')
        .insert({
          corpus_id: corpus.id,
          scope: 'tenant',
          tenant_id,
          title,
          content_text,
          source_uri,
          lang,
          tags,
          metadata,
          is_active: true,
          version: 1
        })
        .select()
        .single();

      if (insertError) throw insertError;
      result = inserted;
      console.log(`Created tenant doc "${title}"`);
    }

    // Enqueue for reindexing
    await supabase
      .from('kb.reindex_queue')
      .insert({
        doc_id: result.id,
        action: 'upsert'
      });

    return new Response(
      JSON.stringify({
        success: true,
        doc_id: result.id,
        version: result.version,
        action: existing ? 'updated' : 'created'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
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
