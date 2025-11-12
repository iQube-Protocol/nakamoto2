import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const AA_API_BASE = "https://bsjhfvctmduxhohtllly.supabase.co/functions/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Getting user DID');

    // Forward to AA backend
    const response = await fetch(`${AA_API_BASE}/auth/did`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get DID');
    }

    console.log('User DID retrieved');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aa-auth-did:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
