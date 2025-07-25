import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
}

// Enhanced rate limiting with Redis-like behavior using Map
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const isRateLimited = (email: string, maxAttempts: number = 3, windowMs: number = 900000): boolean => {
  const now = Date.now();
  const key = `password_reset_${email}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (current.count >= maxAttempts) {
    return true;
  }
  
  current.count++;
  return false;
};

const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Check for dangerous characters
  const dangerousChars = /<|>|"|'|&|javascript:|data:|vbscript:/i;
  if (dangerousChars.test(email)) return false;
  
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Enhanced validation
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced rate limiting (3 attempts per 15 minutes)
    if (isRateLimited(email, 3, 900000)) {
      console.log(`Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many password reset attempts. Please wait 15 minutes before trying again.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Send password reset email with secure redirect
    const redirectTo = 'https://nakamoto.aigentz.me/reset-password';
    
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    });

    if (error) {
      console.error('Password reset error:', error);
      
      // Don't expose internal errors to client
      return new Response(
        JSON.stringify({ 
          error: 'Unable to send password reset email. Please try again later.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Password reset email sent successfully to: ${email}`);
    
    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in password reset function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);