import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AA_API_BASE = "https://bsjhfvctmduxhohtllly.supabase.co/functions/v1";

serve(async (req) => {
  const url = new URL(req.url);
  const requestId = url.searchParams.get('requestId');

  if (!requestId) {
    return new Response('Missing requestId', { status: 400 });
  }

  console.log('Subscribing to payment events for:', requestId);

  try {
    // Forward SSE stream from AA backend
    const response = await fetch(`${AA_API_BASE}/payments/events?requestId=${requestId}`, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to connect to payment events stream');
    }

    // Return the SSE stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in aa-payments-events:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
