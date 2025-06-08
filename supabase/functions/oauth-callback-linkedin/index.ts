
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing environment variables:", {
        hasClientId: !!LINKEDIN_CLIENT_ID,
        hasClientSecret: !!LINKEDIN_CLIENT_SECRET,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
      });
      return new Response(
        `<html><body><h1>Configuration Error</h1><p>Server not properly configured. Please try again later.</p><script>setTimeout(() => window.location.href = '${new URL(req.url).origin}/settings?tab=connections&error=config', 3000)</script></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // Parse request URL to get parameters (LinkedIn OAuth uses GET with query params)
    const url = new URL(req.url);
    console.log("Full URL:", url.toString());
    console.log("URL search params:", Object.fromEntries(url.searchParams.entries()));

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
    
    // Handle LinkedIn OAuth errors
    if (error) {
      console.error("LinkedIn OAuth error:", { error, errorDescription });
      const clientOrigin = url.origin.replace('supabase.co', 'lovable.app');
      return new Response(
        `<html><body><h1>LinkedIn Authorization Failed</h1><p>${errorDescription || error}</p><script>setTimeout(() => window.location.href = '${clientOrigin}/settings?tab=connections&error=${encodeURIComponent(errorDescription || error)}', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
    
    if (!code) {
      console.error("Missing authorization code in URL parameters");
      const clientOrigin = url.origin.replace('supabase.co', 'lovable.app');
      return new Response(
        `<html><body><h1>Authorization Error</h1><p>Missing authorization code. Please try connecting again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/settings?tab=connections&error=missing_code', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Construct redirect URI (same as what we sent to LinkedIn)
    const redirectUri = `${url.origin}/functions/v1/oauth-callback-linkedin`;
    console.log("Using redirect URI:", redirectUri);

    console.log("=== Exchanging code for token ===");

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });

    console.log("Token exchange parameters:", {
      grant_type: "authorization_code",
      hasCode: !!code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID,
      hasClientSecret: !!LINKEDIN_CLIENT_SECRET
    });

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams,
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      const clientOrigin = url.origin.replace('supabase.co', 'lovable.app');
      return new Response(
        `<html><body><h1>LinkedIn Connection Failed</h1><p>Token exchange failed. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/settings?tab=connections&error=token_exchange', 3000)</script></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("Token exchange successful, access token received");

    console.log("=== Fetching LinkedIn profile data ===");

    // Fetch LinkedIn profile data using the modern userinfo endpoint
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    console.log("Profile response status:", profileResponse.status);

    let profileData = null;
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

    // For this callback, we don't have the user's session, so we'll store the connection temporarily
    // and let the client app handle associating it with the user
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
      state: state // Include state for verification
    };

    console.log("=== Redirecting back to client app ===");
    
    // Redirect back to client app with success and connection data
    const clientOrigin = url.origin.replace('supabase.co', 'lovable.app');
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
    const clientOrigin = new URL(req.url).origin.replace('supabase.co', 'lovable.app');
    return new Response(
      `<html><body><h1>Server Error</h1><p>An unexpected error occurred. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/settings?tab=connections&error=server_error', 3000)</script></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
