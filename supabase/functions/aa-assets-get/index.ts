import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const AA_API_BASE = "https://bsjhfvctmduxhohtllly.supabase.co/functions/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetId } = await req.json();
    
    console.log('Getting asset details:', assetId);

    // Forward to AA backend
    const response = await fetch(`${AA_API_BASE}/assets/${assetId}`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get asset');
    }

    console.log('Asset retrieved:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aa-assets-get:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
