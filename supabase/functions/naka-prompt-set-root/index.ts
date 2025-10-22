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

    console.log('Setting new root prompt for Nakamoto');

    // Get current max version for root prompt
    const { data: current } = await supabase
      .from('prompts.prompts')
      .select('version')
      .eq('app', 'nakamoto')
      .eq('scope', 'root')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = current ? current.version + 1 : 1;

    // Archive previous root prompt
    if (current) {
      await supabase
        .from('prompts.prompts')
        .update({ status: 'archived' })
        .eq('app', 'nakamoto')
        .eq('scope', 'root')
        .eq('status', 'active');
      
      console.log(`Archived previous root prompt (version ${current.version})`);
    }

    // Insert new root prompt
    const { data: newPrompt, error: insertError } = await supabase
      .from('prompts.prompts')
      .insert({
        app: 'nakamoto',
        scope: 'root',
        tenant_id: null,
        version: newVersion,
        prompt_text,
        status: 'active',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new root prompt:', insertError);
      throw insertError;
    }

    console.log(`Successfully set root prompt (version ${newVersion})`);

    return new Response(
      JSON.stringify({
        success: true,
        version: newVersion,
        prompt_id: newPrompt.id,
        previous_version: current?.version || null
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
