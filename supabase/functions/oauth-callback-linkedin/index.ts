
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
    const { code, redirectUri, state } = await req.json();
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get("authorization")?.split(" ")[1];
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error("Invalid user token");
    }
    
    // Exchange code for token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get LinkedIn profile
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error("Failed to fetch LinkedIn profile");
    }
    
    const profileData = await profileResponse.json();
    
    // Get LinkedIn email
    const emailResponse = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    let emailData = {};
    if (emailResponse.ok) {
      emailData = await emailResponse.json();
    }
    
    // Save connection to user_connections table
    const { error: insertError } = await supabase
      .from("user_connections")
      .upsert({
        user_id: user.id,
        service: "linkedin",
        connected_at: new Date().toISOString(),
        connection_data: {
          profile: profileData,
          email: emailData,
          // Don't store access token in the database for security
          // In a production app, you'd encrypt these tokens
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          refresh_token: tokenData.refresh_token,
        },
      });
    
    if (insertError) {
      throw new Error(`Error saving connection: ${insertError.message}`);
    }
    
    // Update BlakQube data
    // For LinkedIn, we might want to update profession, interests, etc.
    // This would be implemented based on specific BlakQube data model
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
