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

    // Get the root corpus ID
    const { data: corpus, error: corpusError } = await supabase
      .from('kb.corpora')
      .select('id')
      .eq('app', 'nakamoto')
      .eq('name', 'Root')
      .single();

    if (corpusError || !corpus) {
      throw new Error('Root corpus not found. Please ensure database schema is properly initialized.');
    }

    const response = {
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ title: string; error: string }>
    };

    for (const doc of documents as KBDocument[]) {
      try {
        // Check if document already exists by title
        const { data: existing } = await supabase
          .from('kb.docs')
          .select('id')
          .eq('corpus_id', corpus.id)
          .eq('title', doc.title)
          .eq('scope', 'root')
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

        // Insert root KB document
        const { data: newDoc, error: insertError } = await supabase
          .from('kb.docs')
          .insert({
            corpus_id: corpus.id,
            scope: 'root',
            tenant_id: null,
            title: doc.title,
            content_text: doc.content_text,
            source_uri: doc.source_uri,
            lang: doc.lang || 'en',
            tags: doc.tags || [],
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

        // Enqueue for reindexing (if vector search is enabled)
        await supabase
          .from('kb.reindex_queue')
          .insert({
            doc_id: newDoc.id,
            action: 'upsert'
          });

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
