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

    // Resolve or create the root corpus via RPCs in public schema
    const ROOT_TENANT = '00000000-0000-0000-0000-000000000000';
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

    const response = {
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ title: string; error: string }>
    };

    for (const doc of documents as KBDocument[]) {
      try {
        if (dry_run) {
          const { data: existingId, error: findErr } = await supabase.rpc('find_kb_doc_id', {
            _corpus_id: corpusId,
            _tenant: ROOT_TENANT,
            _title: doc.title
          });
          if (findErr) {
            response.errors.push({ title: doc.title, error: findErr.message });
            console.error(`Error checking existence for "${doc.title}":`, findErr);
            continue;
          }
          if (existingId) {
            response.skipped++;
            console.log(`Document "${doc.title}" already exists (dry run)`);
          } else {
            response.imported++;
            console.log(`[DRY RUN] Would import document "${doc.title}"`);
          }
          continue;
        }

        // Upsert the KB document via RPC
        const { data: upsertRes, error: upsertErr } = await supabase.rpc('upsert_kb_doc', {
          _corpus_id: corpusId,
          _tenant: ROOT_TENANT,
          _title: doc.title,
          _content_text: doc.content_text || '',
          _tags: doc.tags || [],
          _storage_path: doc.source_uri || null,
          _metadata: doc.metadata || {}
        });

        if (upsertErr) {
          response.errors.push({ title: doc.title, error: upsertErr.message });
          console.error(`Error importing "${doc.title}":`, upsertErr);
          continue;
        }

        response.imported++;
        console.log(`Successfully upserted document "${doc.title}"`, upsertRes);

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