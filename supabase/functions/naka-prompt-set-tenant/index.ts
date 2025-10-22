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

    const { tenant_id, prompt_text, metadata } = await req.json();
    
    if (!tenant_id || !prompt_text) {
      return new Response(
        JSON.stringify({ error: 'tenant_id and prompt_text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Setting tenant prompt augmentation for tenant ${tenant_id}`);

    // Get current max version for this tenant's prompt
    const { data: current } = await supabase
      .from('prompts.prompts')
      .select('version')
      .eq('app', 'nakamoto')
      .eq('scope', 'tenant')
      .eq('tenant_id', tenant_id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = current ? current.version + 1 : 1;

    // Archive previous tenant prompt
    if (current) {
      await supabase
        .from('prompts.prompts')
        .update({ status: 'archived' })
        .eq('app', 'nakamoto')
        .eq('scope', 'tenant')
        .eq('tenant_id', tenant_id)
        .eq('status', 'active');
      
      console.log(`Archived previous tenant prompt (version ${current.version})`);
    }

    // Insert new tenant prompt augmentation
    const { data: newPrompt, error: insertError } = await supabase
      .from('prompts.prompts')
      .insert({
        app: 'nakamoto',
        scope: 'tenant',
        tenant_id,
        version: newVersion,
        prompt_text,
        status: 'active',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting tenant prompt:', insertError);
      throw insertError;
    }

    console.log(`Successfully set tenant prompt augmentation (version ${newVersion})`);

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
