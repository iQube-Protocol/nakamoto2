
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  console.log("=== LinkedIn OAuth Callback Started ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables first
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("Missing LinkedIn configuration:", {
        hasClientId: !!LINKEDIN_CLIENT_ID,
        hasClientSecret: !!LINKEDIN_CLIENT_SECRET
      });
      
      // Use the preview domain for redirects
      const clientOrigin = 'https://preview--nakamoto2.lovable.app';
      
      return new Response(
        `<html><body><h1>Configuration Error</h1><p>LinkedIn service not properly configured. Please contact support.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/settings?tab=connections&error=config', 3000)</script></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // Parse request URL to get parameters
    const url = new URL(req.url);
    console.log("Full URL:", url.toString());

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    const state = url.searchParams.get("state");
    
    console.log("OAuth parameters:", { 
      hasCode: !!code, 
      codeLength: code?.length || 0,
      error, 
      errorDescription,
      state 
    });
    
    // Use the preview domain for redirects
    const clientOrigin = 'https://preview--nakamoto2.lovable.app';
    console.log("Client origin for redirects:", clientOrigin);
    
    // Handle LinkedIn OAuth errors
    if (error) {
      console.error("LinkedIn OAuth error:", { error, errorDescription });
      return new Response(
        `<html><body><h1>LinkedIn Authorization Failed</h1><p>${errorDescription || error}</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=${encodeURIComponent(errorDescription || error)}', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
    
    if (!code) {
      console.error("Missing authorization code");
      return new Response(
        `<html><body><h1>Authorization Error</h1><p>Missing authorization code. Please try connecting again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=missing_code', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Construct the correct redirect URI that matches what was registered
    const supabaseUrl = SUPABASE_URL || url.origin;
    const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback-linkedin`;
    console.log("Using redirect URI for token exchange:", redirectUri);

    console.log("=== Exchanging code for token ===");

    // Exchange authorization code for access token with timeout
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let tokenResponse;
    try {
      tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: tokenParams,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Token exchange fetch error:", fetchError);
      return new Response(
        `<html><body><h1>Connection Timeout</h1><p>LinkedIn connection timed out. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=timeout', 3000)</script></body></html>`,
        { status: 408, headers: { "Content-Type": "text/html" } }
      );
    }

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return new Response(
        `<html><body><h1>LinkedIn Connection Failed</h1><p>Authentication failed. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=token_exchange', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      console.error("No access token received");
      return new Response(
        `<html><body><h1>LinkedIn Connection Failed</h1><p>Invalid token response. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=invalid_token', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
    
    console.log("Token exchange successful");

    console.log("=== Fetching LinkedIn profile data ===");

    // Fetch LinkedIn profile data with timeout
    const profileController = new AbortController();
    const profileTimeoutId = setTimeout(() => profileController.abort(), 10000);

    let profileData = null;
    try {
      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
        signal: profileController.signal
      });
      clearTimeout(profileTimeoutId);

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
        console.log("Profile data fetched successfully:", {
          sub: profileData?.sub,
          given_name: profileData?.given_name,
          family_name: profileData?.family_name,
          email: profileData?.email
        });
      } else {
        const errorText = await profileResponse.text();
        console.warn("Failed to fetch profile data:", {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
          error: errorText
        });
      }
    } catch (profileError) {
      clearTimeout(profileTimeoutId);
      console.warn("Profile fetch error:", profileError);
    }

    // Create connection data with better structure
    const connectionData = {
      connected: true,
      access_token: accessToken,
      profile: profileData ? {
        id: profileData.sub,
        firstName: profileData.given_name,
        lastName: profileData.family_name,
        name: profileData.name,
        profileUrl: `https://www.linkedin.com/in/${profileData.sub}`,
        profilePicture: profileData.picture
      } : null,
      email: profileData?.email,
      fetchedAt: new Date().toISOString(),
      state: state,
      version: "2.0"
    };

    console.log("=== Redirecting back to client app ===");
    
    // Redirect back to client app with success and connection data
    const redirectUrl = new URL('/oauth-callback', clientOrigin);
    redirectUrl.searchParams.set('service', 'linkedin');
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('state', state || '');
    redirectUrl.searchParams.set('connection_data', encodeURIComponent(JSON.stringify(connectionData)));
    
    console.log("Redirecting to:", redirectUrl.toString());
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl.toString(),
      },
    });

  } catch (error) {
    console.error("=== Unexpected error ===", error);
    console.error("Error stack:", error.stack);
    
    // Use the preview domain for redirects
    const clientOrigin = 'https://preview--nakamoto2.lovable.app';
    
    return new Response(
      `<html><body><h1>Server Error</h1><p>An unexpected error occurred. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=server_error', 3000)</script></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
