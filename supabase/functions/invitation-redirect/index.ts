
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
    
    console.log('=== INVITATION REDIRECT HANDLER ===');
    console.log('Request details:', {
      method: req.method,
      originalUrl: req.url,
      hostname: url.hostname,
      pathname: url.pathname,
      searchParams: url.searchParams.toString(),
      token: token ? token.substring(0, 12) + '...' : 'NO_TOKEN',
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      timestamp: new Date().toISOString()
    });

    // Current site URL (where we want to redirect to)
    const currentSiteUrl = 'https://preview--aigent-nakamoto.lovable.app';
    
    // If no token, redirect to main app
    if (!token) {
      console.log('❌ No token found, redirecting to main app');
      const redirectUrl = currentSiteUrl + '/';
      console.log('Redirecting to:', redirectUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders
        }
      });
    }

    // Construct the new invitation URL with the token
    const newInvitationUrl = `${currentSiteUrl}/invited-signup?token=${token}`;
    
    console.log('✅ Token found, creating redirect:', {
      from: req.url,
      to: newInvitationUrl,
      token: token.substring(0, 12) + '...'
    });

    // Return a 302 temporary redirect (since this is a one-time invitation)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': newInvitationUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders
      }
    });

  } catch (error: any) {
    console.error('❌ ERROR in invitation redirect handler:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    // In case of error, still try to redirect to the main app
    const fallbackUrl = 'https://preview--aigent-nakamoto.lovable.app/';
    console.log('Using fallback redirect to:', fallbackUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': fallbackUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders
      }
    });
  }
};

serve(handler);
