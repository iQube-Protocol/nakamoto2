
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// This would be stored in Supabase secrets in production
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("OAuth callback received");
    const { code, redirectUri, state } = await req.json();
    console.log("Received parameters:", { code: !!code, redirectUri, state });
    
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("LinkedIn credentials not configured");
      throw new Error("LinkedIn credentials not configured");
    }
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get("authorization")?.split(" ")[1];
    if (!authHeader) {
      console.error("No authorization header");
      throw new Error("No authorization header");
    }
    
    console.log("Getting user from auth token...");
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      console.error("Invalid user token:", userError);
      throw new Error("Invalid user token");
    }
    
    console.log("User authenticated:", user.id);
    
    // Exchange code for token
    console.log("Exchanging code for token...");
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
      },
      body: tokenParams,
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", errorText);
      throw new Error(`LinkedIn API error: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");
    
    // Get LinkedIn profile
    console.log("Fetching LinkedIn profile...");
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("LinkedIn profile fetch failed:", errorText);
      throw new Error("Failed to fetch LinkedIn profile");
    }
    
    const profileData = await profileResponse.json();
    console.log("Profile data received:", profileData.id);
    
    // Get LinkedIn email (optional - may fail due to permissions)
    let emailData = {};
    try {
      console.log("Fetching LinkedIn email...");
      const emailResponse = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (emailResponse.ok) {
        emailData = await emailResponse.json();
        console.log("Email data received");
      } else {
        console.log("Email permission not granted - continuing without email");
      }
    } catch (error) {
      console.log("Email fetch failed, continuing without email:", error.message);
    }
    
    // Save connection to user_connections table
    console.log("Saving connection to database...");
    const { error: insertError } = await supabase
      .from("user_connections")
      .upsert({
        user_id: user.id,
        service: "linkedin",
        connected_at: new Date().toISOString(),
        connection_data: {
          profile: profileData,
          email: emailData,
          // Store minimal token info for potential future API calls
          // In production, encrypt these tokens
          token_expires_in: tokenData.expires_in,
          profile_id: profileData.id,
        },
      });
    
    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Error saving connection: ${insertError.message}`);
    }
    
    console.log("LinkedIn connection saved successfully");
    
    return new Response(
      JSON.stringify({ success: true, profile_id: profileData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
