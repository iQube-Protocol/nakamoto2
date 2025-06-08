
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Helper function to create error response
function createErrorResponse(error: string, status: number = 500) {
  console.error("Error response:", error);
  return new Response(
    JSON.stringify({ error, success: false }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

serve(async (req) => {
  console.log("=== OAuth Callback Function Started ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    console.log("Validating environment variables...");
    const missing = [];
    if (!LINKEDIN_CLIENT_ID) missing.push("LINKEDIN_CLIENT_ID");
    if (!LINKEDIN_CLIENT_SECRET) missing.push("LINKEDIN_CLIENT_SECRET");
    if (!SUPABASE_URL) missing.push("SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    
    if (missing.length > 0) {
      console.error("Missing environment variables:", missing);
      return createErrorResponse("Server configuration error", 500);
    }
    
    console.log("Environment variables validated successfully");

    // Validate authorization header
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      return createErrorResponse("Authorization required", 401);
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return createErrorResponse("Invalid authorization format", 401);
    }

    console.log("Token extracted successfully");

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    console.log("Supabase client initialized");

    // Verify user
    console.log("Verifying user authentication...");
    const userResult = await supabase.auth.getUser(token);

    if (userResult.error || !userResult.data.user) {
      console.error("User verification failed:", userResult.error);
      return createErrorResponse("Authentication failed", 401);
    }

    const user = userResult.data.user;
    console.log("User verified successfully:", user.id);

    // Parse request body
    console.log("Parsing request body...");
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Request body received, length:", bodyText.length);
      
      if (!bodyText.trim()) {
        return createErrorResponse("Empty request body", 400);
      }

      requestBody = JSON.parse(bodyText);
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    const { code, redirectUri, state } = requestBody;
    console.log("Request parameters:", { 
      hasCode: !!code, 
      redirectUri, 
      hasState: !!state 
    });
    
    if (!code) {
      return createErrorResponse("Missing authorization code", 400);
    }

    if (!redirectUri) {
      return createErrorResponse("Missing redirect URI", 400);
    }

    // Exchange code for access token
    console.log("Exchanging authorization code for access token...");
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });
    
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenParams,
    });
    
    console.log("LinkedIn token response status:", tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText
      });
      return createErrorResponse("Token exchange failed", 400);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("LinkedIn token exchange successful");
    
    // Save connection to database
    console.log("Saving connection to database...");
    const { error: insertError } = await supabase
      .from("user_connections")
      .upsert({
        user_id: user.id,
        service: "linkedin",
        connected_at: new Date().toISOString(),
        connection_data: { connected: true },
      });
    
    if (insertError) {
      console.error("Database insert error:", insertError);
      return createErrorResponse("Failed to save connection", 500);
    }
    
    console.log("Connection saved successfully");
    
    const successResponse = new Response(
      JSON.stringify({ success: true, message: "LinkedIn connected" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

    console.log("=== OAuth callback completed successfully ===");
    return successResponse;
    
  } catch (error) {
    console.error("Unexpected error in OAuth callback:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return createErrorResponse("Server error", 500);
  }
});
