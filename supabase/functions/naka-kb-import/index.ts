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

    // Get the root corpus ID (or create it if it doesn't exist)
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
      throw new Error('Failed to find or create Nakamoto corpus');
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
          .from('kb_docs')
          .select('id')
          .eq('corpus_id', corpus.data.id)
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

        // Insert root KB document
        const { data: newDoc, error: insertError } = await supabase
          .from('kb_docs')
          .insert({
            corpus_id: corpus.data.id,
            tenant_id: '00000000-0000-0000-0000-000000000000',
            title: doc.title,
            content: doc.content_text || '',
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
