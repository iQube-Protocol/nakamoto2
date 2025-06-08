
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
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
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
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Extracted token length:", token.length);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Verify user
    console.log("Verifying user token...");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User verified:", userData.user.id);

    // Parse request URL to get parameters
    const url = new URL(req.url);
    console.log("Full URL:", url.toString());
    console.log("URL search params:", Object.fromEntries(url.searchParams.entries()));

    // Get parameters from URL (LinkedIn OAuth callback always uses GET)
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
      return new Response(
        JSON.stringify({ success: false, error: `LinkedIn OAuth error: ${errorDescription || error}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!code) {
      console.error("Missing authorization code in URL parameters");
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct redirect URI based on the request origin
    const redirectUri = `${url.origin}/oauth-callback?service=linkedin`;
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
    console.log("Token response headers:", Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return new Response(
        JSON.stringify({ success: false, error: `LinkedIn authorization failed: ${errorText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Prepare connection data with profile information
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
      fetchedAt: new Date().toISOString()
    };

    console.log("=== Saving connection data ===");
    console.log("Connection data prepared:", {
      connected: connectionData.connected,
      hasProfile: !!connectionData.profile,
      hasEmail: !!connectionData.email,
      profileId: connectionData.profile?.id
    });

    // Save connection to database
    const { error: insertError } = await supabase
      .from("user_connections")
      .upsert({
        user_id: userData.user.id,
        service: "linkedin",
        connected_at: new Date().toISOString(),
        connection_data: connectionData,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save connection" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("=== Connection saved successfully ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "LinkedIn connected successfully",
        profile: connectionData.profile
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("=== Unexpected error ===", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
