
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface DriveRequestParams {
  method: string;
  endpoint: string;
  accessToken: string;
  body?: any;
  alt?: string;
  fields?: string;
  query?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  try {
    const { method, endpoint, accessToken, body, alt, fields, query } = await req.json() as DriveRequestParams;

    if (!endpoint || !accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Base URL for Google Drive API
    const baseUrl = 'https://www.googleapis.com/drive/v3';
    
    // Build URL with query parameters
    let url = `${baseUrl}/${endpoint}`;
    const queryParams = new URLSearchParams();
    
    if (alt) queryParams.append('alt', alt);
    if (fields) queryParams.append('fields', fields);
    if (query) queryParams.append('q', query);
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    console.log(`Proxying ${method} request to: ${url}`);
    
    // Make request to Google Drive API
    const driveResponse = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Get response data
    let responseData;
    const contentType = driveResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await driveResponse.json();
    } else {
      responseData = await driveResponse.text();
    }
    
    // Return response with proper CORS headers
    return new Response(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      {
        status: driveResponse.status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': contentType || 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in gdrive-proxy function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Error processing request',
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
