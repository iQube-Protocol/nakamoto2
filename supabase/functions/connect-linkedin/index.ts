
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";

serve(async (req) => {
  console.log("=== LinkedIn Connection Request Started ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment configuration first
    if (!LINKEDIN_CLIENT_ID) {
      console.error("LinkedIn client ID not configured");
      return new Response(
        JSON.stringify({ 
          error: "LinkedIn connection service is not properly configured. Please contact support.",
          code: "MISSING_CLIENT_ID"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log("LinkedIn client ID configured:", LINKEDIN_CLIENT_ID ? "Yes" : "No");
    
    // Parse the request URL to get the origin
    const url = new URL(req.url);
    console.log("Request origin:", url.origin);
    
    // Validate request body if present
    let requestBody = null;
    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        requestBody = await req.json();
        console.log("Request body:", requestBody);
      }
    } catch (e) {
      console.warn("Failed to parse request body:", e);
    }
    
    // Create LinkedIn OAuth URL with expanded scopes for profile data
    const scope = encodeURIComponent("openid profile email w_member_social");
    const state = crypto.randomUUID();
    
    console.log("Generated OAuth state:", state);
    
    // Generate the correct redirect URI for the Supabase edge function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || url.origin;
    const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback-linkedin`;
    
    console.log("Using redirect URI:", redirectUri);
    console.log("IMPORTANT: Register this exact URI in your LinkedIn app:", redirectUri);
    
    // Construct the LinkedIn OAuth URL with expanded scopes
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
    
    console.log("Generated auth URL:", authUrl);
    
    const response = {
      authUrl,
      state,
      redirectUri,
      correctRedirectUri: redirectUri,
      timestamp: new Date().toISOString()
    };
    
    console.log("Sending response:", response);
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("=== Unexpected Error in LinkedIn Connection ===");
    console.error("Error:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred while setting up LinkedIn connection. Please try again.",
        code: "INTERNAL_ERROR"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
