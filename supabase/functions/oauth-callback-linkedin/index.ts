import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from "../_shared/cors.ts";

const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  const startTime = Date.now();
  console.log("=== LinkedIn OAuth Callback Started ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("User-Agent:", req.headers.get("user-agent"));
  console.log("Origin:", req.headers.get("origin"));
  console.log("Referer:", req.headers.get("referer"));
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the actual client origin from request headers with smart detection
    const referer = req.headers.get("referer");
    const origin = req.headers.get("origin");
    
    let clientOrigin = 'https://nakamoto.aigentz.me'; // Production fallback
    
    console.log("Detecting client origin from headers:", { referer, origin });
    
    // Try to extract origin from referer first (most reliable for OAuth redirects)
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const detectedOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
        
        // Check if it's a valid Lovable preview domain or production domain
        if (detectedOrigin.includes('.lovable.app') || 
            detectedOrigin.includes('nakamoto.aigentz.me') ||
            detectedOrigin.includes('localhost')) {
          clientOrigin = detectedOrigin;
          console.log("✅ Using referer as client origin:", clientOrigin);
        } else {
          console.log("⚠️ Referer origin not recognized, using fallback:", detectedOrigin);
        }
      } catch (e) {
        console.log("❌ Failed to parse referer, using fallback:", e.message);
      }
    } 
    
    // Fallback to origin header if referer didn't work
    if (origin && clientOrigin === 'https://nakamoto.aigentz.me') {
      if (origin.includes('.lovable.app') || 
          origin.includes('nakamoto.aigentz.me') ||
          origin.includes('localhost')) {
        clientOrigin = origin;
        console.log("✅ Using origin header as client origin:", clientOrigin);
      } else {
        console.log("⚠️ Origin header not recognized, keeping fallback:", origin);
      }
    }
    
    console.log("🎯 Final client origin:", clientOrigin);
    
    // Validate environment variables first
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("Missing LinkedIn configuration:", {
        hasClientId: !!LINKEDIN_CLIENT_ID,
        hasClientSecret: !!LINKEDIN_CLIENT_SECRET
      });
      
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

    // Fetch basic profile data from userinfo endpoint
    const profileController = new AbortController();
    const profileTimeoutId = setTimeout(() => profileController.abort(), 10000);

    let basicProfileData = null;
    let detailedProfileData = null;

    try {
      // Get basic profile info
      const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
        signal: profileController.signal
      });
      clearTimeout(profileTimeoutId);

      if (profileResponse.ok) {
        basicProfileData = await profileResponse.json();
        console.log("Basic profile data fetched successfully:", {
          sub: basicProfileData?.sub,
          given_name: basicProfileData?.given_name,
          family_name: basicProfileData?.family_name,
          email: basicProfileData?.email
        });
      } else {
        const errorText = await profileResponse.text();
        console.warn("Failed to fetch basic profile data:", {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
          error: errorText
        });
      }

      // Try to get detailed profile information
      console.log("=== Fetching detailed LinkedIn profile ===");
      const detailedController = new AbortController();
      const detailedTimeoutId = setTimeout(() => detailedController.abort(), 10000);

      try {
        // Enhanced API call to get more detailed profile information with proper fields
        const detailedResponse = await fetch(
          "https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline,industryName,localizedFirstName,localizedLastName,profilePicture,publicProfileUrl,vanityName,emailAddress,location)",
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Accept": "application/json",
              "X-Restli-Protocol-Version": "2.0.0"
            },
            signal: detailedController.signal
          }
        );
        clearTimeout(detailedTimeoutId);

        if (detailedResponse.ok) {
          detailedProfileData = await detailedResponse.json();
          console.log("Detailed profile data fetched successfully:", {
            id: detailedProfileData?.id,
            vanityName: detailedProfileData?.vanityName,
            firstName: detailedProfileData?.localizedFirstName || detailedProfileData?.firstName?.localized?.en_US,
            lastName: detailedProfileData?.localizedLastName || detailedProfileData?.lastName?.localized?.en_US,
            headline: detailedProfileData?.headline,
            publicProfileUrl: detailedProfileData?.publicProfileUrl
          });
        } else {
          const errorText = await detailedResponse.text();
          console.warn("Failed to fetch detailed profile data:", {
            status: detailedResponse.status,
            statusText: detailedResponse.statusText,
            error: errorText
          });
          
          // If first try fails, try alternative endpoint format
          console.log("Trying alternative detailed profile endpoint...");
          const alternativeResponse = await fetch(
            "https://api.linkedin.com/v2/people/(id:~)?projection=(id,firstName,lastName,headline,industryName,location,publicProfileUrl,profilePicture)",
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
              }
            }
          );
          
          if (alternativeResponse.ok) {
            detailedProfileData = await alternativeResponse.json();
            console.log("Alternative detailed profile data fetched successfully");
          } else {
            const altErrorText = await alternativeResponse.text();
            console.warn("Failed to fetch alternative detailed profile data:", altErrorText);
          }
        }
      } catch (detailedError) {
        clearTimeout(detailedTimeoutId);
        console.warn("Detailed profile fetch error:", detailedError);
      }

    } catch (profileError) {
      clearTimeout(profileTimeoutId);
      console.warn("Profile fetch error:", profileError);
    }

    // Create comprehensive connection data combining both sources
    const firstName = detailedProfileData?.localizedFirstName || 
                     detailedProfileData?.firstName?.localized?.en_US || 
                     basicProfileData?.given_name || '';
                     
    const lastName = detailedProfileData?.localizedLastName || 
                    detailedProfileData?.lastName?.localized?.en_US || 
                    basicProfileData?.family_name || '';
                    
    // Get real vanity URL or profile URL, ensuring we get the actual LinkedIn profile URL
    let profileUrl = detailedProfileData?.publicProfileUrl;
    if (!profileUrl) {
      const vanityName = detailedProfileData?.vanityName;
      if (vanityName) {
        profileUrl = `https://www.linkedin.com/in/${vanityName}`;
      } else if (detailedProfileData?.id) {
        profileUrl = `https://www.linkedin.com/in/${detailedProfileData.id}`;
      } else if (basicProfileData?.sub) {
        profileUrl = `https://www.linkedin.com/in/${basicProfileData.sub}`;
      }
    }
    
    const connectionData = {
      connected: true,
      access_token: accessToken,
      profile: {
        // Basic info from userinfo
        id: basicProfileData?.sub || detailedProfileData?.id,
        firstName: firstName,
        lastName: lastName,
        name: [firstName, lastName].filter(Boolean).join(' '),
        profilePicture: basicProfileData?.picture,
        
        // Enhanced info from detailed profile
        headline: detailedProfileData?.headline?.localized?.en_US || detailedProfileData?.headline,
        industryName: detailedProfileData?.industryName?.localized?.en_US || detailedProfileData?.industryName,
        locationName: detailedProfileData?.location?.preferredGeoPlace?.name || 
                    detailedProfileData?.locationName?.localized?.en_US || 
                    detailedProfileData?.locationName,
        publicProfileUrl: profileUrl,
        vanityName: detailedProfileData?.vanityName,
        
        // Constructed profile URL (use from existing data or construct as fallback)
        profileUrl: profileUrl
      },
      email: basicProfileData?.email,
      fetchedAt: new Date().toISOString(),
      state: state,
      version: "3.0"
    };

    console.log("=== Redirecting back to client app ===");
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ LinkedIn OAuth processing completed in ${processingTime}ms`);
    console.log("Profile data summary:", {
      hasName: !!(firstName && lastName),
      hasEmail: !!basicProfileData?.email,
      hasProfileUrl: !!profileUrl,
      hasHeadline: !!detailedProfileData?.headline
    });
    
    // Redirect back to client app with success and connection data
    const redirectUrl = new URL('/oauth-callback', clientOrigin);
    redirectUrl.searchParams.set('service', 'linkedin');
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('state', state || '');
    redirectUrl.searchParams.set('connection_data', encodeURIComponent(JSON.stringify(connectionData)));
    
    console.log("🚀 Redirecting to:", redirectUrl.toString());
    console.log("=== LinkedIn OAuth Callback Completed Successfully ===");
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl.toString(),
      },
    });

  } catch (error) {
    console.error("=== Unexpected error ===", error);
    console.error("Error stack:", error.stack);
    
    // Get the actual client origin from request headers with smart detection (error handler)
    const referer = req.headers.get("referer");
    const origin = req.headers.get("origin");
    
    let clientOrigin = 'https://nakamoto.aigentz.me'; // Production fallback
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const detectedOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
        
        // Check if it's a valid domain
        if (detectedOrigin.includes('.lovable.app') || 
            detectedOrigin.includes('nakamoto.aigentz.me') ||
            detectedOrigin.includes('localhost')) {
          clientOrigin = detectedOrigin;
        }
      } catch (e) {
        // Use fallback
      }
    } else if (origin && (origin.includes('.lovable.app') || 
                         origin.includes('nakamoto.aigentz.me') ||
                         origin.includes('localhost'))) {
      clientOrigin = origin;
    }
    
    return new Response(
      `<html><body><h1>Server Error</h1><p>An unexpected error occurred. Please try again.</p><script>setTimeout(() => window.location.href = '${clientOrigin}/oauth-callback?service=linkedin&error=server_error', 3000)</script></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
