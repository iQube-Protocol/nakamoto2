import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KBDocument {
  title: string;
  content_text?: string;
  source_uri?: string;
  lang?: string;
  tags?: string[];
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use Core Hub credentials for migration
    const coreUrl = Deno.env.get('CORE_SUPABASE_URL')!;
    const coreServiceKey = Deno.env.get('CORE_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(coreUrl, coreServiceKey);

    const { documents, dry_run = false } = await req.json();
    
    if (!Array.isArray(documents) || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'documents array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${documents.length} KB documents (dry_run: ${dry_run})`);

    // Get the root corpus ID from kb.corpora (schema-qualified)
    // Ensure the root corpus exists (create if missing)
    const ROOT_TENANT = '00000000-0000-0000-0000-000000000000';
    let { data: corpusRow, error: corpusErr } = await supabase
      .from('kb.corpora')
      .select('id')
      .eq('app', 'nakamoto')
      .eq('name', 'Root')
      .eq('scope', 'root')
      .single();

    if (corpusErr || !corpusRow) {
      console.log('Root corpus missing - creating it');
      const { data: newCorpus, error: createErr } = await supabase
        .from('kb.corpora')
        .insert({
          tenant_id: ROOT_TENANT,
          app: 'nakamoto',
          name: 'Root',
          scope: 'root',
          description: 'Root knowledge base for Nakamoto platform'
        })
        .select('id')
        .single();

      if (createErr) {
        throw new Error(`Failed to create Nakamoto root corpus: ${createErr.message}`);
      }

      corpusRow = newCorpus;
    }

    const corpusId = corpusRow.id;

    const response = {
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ title: string; error: string }>
    };

    for (const doc of documents as KBDocument[]) {
      try {
        // Check if document already exists by title in kb.docs (schema-qualified)
        const { data: existing } = await supabase
          .from('kb.docs')
          .select('id')
          .eq('corpus_id', corpusId)
          .eq('title', doc.title)
          .eq('tenant_id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (existing) {
          response.skipped++;
          console.log(`Document "${doc.title}" already exists`);
          continue;
        }

        if (dry_run) {
          response.imported++;
          console.log(`[DRY RUN] Would import document "${doc.title}"`);
          continue;
        }

        // Insert root KB document into kb.docs
        const { data: newDoc, error: insertError } = await supabase
          .from('kb.docs')
          .insert({
            corpus_id: corpusId,
            tenant_id: '00000000-0000-0000-0000-000000000000',
            title: doc.title,
            content_text: doc.content_text || '',
            content_type: 'text/markdown',
            tags: doc.tags || [],
            storage_path: doc.source_uri || null,
            metadata: doc.metadata || {},
            is_active: true,
            version: 1
          })
          .select('id')
          .single();

        if (insertError) {
          response.errors.push({ title: doc.title, error: insertError.message });
          console.error(`Error importing "${doc.title}":`, insertError);
          continue;
        }

        // Note: Reindexing queue not yet implemented in Core Hub schema

        response.imported++;
        console.log(`Successfully imported document "${doc.title}"`);

      } catch (error: any) {
        response.errors.push({ 
          title: doc.title, 
          error: error.message || 'Unknown error' 
        });
        console.error(`Error processing document "${doc.title}":`, error);
      }
    }

    console.log('KB import complete:', response);

    return new Response(
      JSON.stringify(response),
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
