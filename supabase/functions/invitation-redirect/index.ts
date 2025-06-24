
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    console.log('Invitation redirect request:', {
      originalUrl: req.url,
      token: token?.substring(0, 8) + '...',
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      timestamp: new Date().toISOString()
    });

    // If no token, redirect to main app (current site)
    if (!token) {
      console.log('No token found, redirecting to main app');
      const redirectUrl = 'https://preview--aigent-nakamoto.lovable.app/';
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        }
      });
    }

    // Construct the new invitation URL with the token (redirect to current site)
    const newInvitationUrl = `https://preview--aigent-nakamoto.lovable.app/invited-signup?token=${token}`;
    
    console.log('Redirecting invitation:', {
      from: req.url,
      to: newInvitationUrl,
      token: token.substring(0, 8) + '...'
    });

    // Return a 301 permanent redirect to the new domain
    return new Response(null, {
      status: 301,
      headers: {
        'Location': newInvitationUrl,
        'Cache-Control': 'public, max-age=3600', // Cache redirect for 1 hour
        ...corsHeaders
      }
    });

  } catch (error: any) {
    console.error('Error in invitation redirect:', error);
    
    // In case of error, still try to redirect to the main app (current site)
    const fallbackUrl = 'https://preview--aigent-nakamoto.lovable.app/';
    return new Response(null, {
      status: 302,
      headers: {
        'Location': fallbackUrl,
        ...corsHeaders
      }
    });
  }
};

serve(handler);
