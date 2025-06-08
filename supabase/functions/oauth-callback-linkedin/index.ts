
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  console.log("OAuth callback function started");
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Processing OAuth callback request");
    
    // Validate environment variables
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("LinkedIn credentials missing:", { 
        hasClientId: !!LINKEDIN_CLIENT_ID, 
        hasClientSecret: !!LINKEDIN_CLIENT_SECRET 
      });
      throw new Error("LinkedIn credentials not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials missing");
      throw new Error("Supabase credentials not configured");
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", { 
        hasCode: !!requestBody.code, 
        hasRedirectUri: !!requestBody.redirectUri,
        hasState: !!requestBody.state
      });
    } catch (error) {
      console.error("Failed to parse request body:", error);
      throw new Error("Invalid request body");
    }

    const { code, redirectUri, state } = requestBody;
    
    if (!code) {
      console.error("Authorization code missing from request");
      throw new Error("Authorization code is required");
    }

    if (!redirectUri) {
      console.error("Redirect URI missing from request");
      throw new Error("Redirect URI is required");
    }

    // Create Supabase client
    console.log("Creating Supabase client");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("No token found in authorization header");
      throw new Error("Invalid authorization header format");
    }
    
    console.log("Getting user from token...");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error("No user found for token");
      throw new Error("User not found");
    }
    
    console.log("User authenticated successfully:", user.id);
    
    // Exchange authorization code for access token
    console.log("Exchanging authorization code for access token...");
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });
    
    console.log("Making token exchange request to LinkedIn...");
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
      throw new Error(`LinkedIn token exchange failed: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful, got access token");
    
    // Get LinkedIn profile information
    console.log("Fetching LinkedIn profile...");
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
      },
    });
    
    console.log("Profile response status:", profileResponse.status);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("LinkedIn profile fetch failed:", {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch LinkedIn profile: ${profileResponse.status} ${errorText}`);
    }
    
    const profileData = await profileResponse.json();
    console.log("Profile data received for LinkedIn ID:", profileData.id);
    
    // Attempt to get email (this may fail if permission not granted)
    let emailData = null;
    try {
      console.log("Attempting to fetch email...");
      const emailResponse = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json",
        },
      });
      
      if (emailResponse.ok) {
        emailData = await emailResponse.json();
        console.log("Email data received");
      } else {
        console.log("Email permission not granted or failed to fetch");
      }
    } catch (error) {
      console.log("Email fetch failed (this is optional):", error.message);
    }
    
    // Save connection to database
    console.log("Saving connection to database...");
    const connectionData = {
      user_id: user.id,
      service: "linkedin",
      connected_at: new Date().toISOString(),
      connection_data: {
        profile: profileData,
        email: emailData,
        token_expires_in: tokenData.expires_in,
        profile_id: profileData.id,
      },
    };
    
    console.log("Inserting connection data...");
    const { error: insertError } = await supabase
      .from("user_connections")
      .upsert(connectionData);
    
    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to save connection: ${insertError.message}`);
    }
    
    console.log("LinkedIn connection saved successfully");
    
    // Return success response
    const successResponse = {
      success: true,
      profile_id: profileData.id,
      message: "LinkedIn connection successful"
    };
    
    console.log("Sending success response");
    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("OAuth callback error:", error);
    
    const errorResponse = {
      error: error.message || "Unknown error occurred",
      success: false
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
