import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
}

// Rate limiting storage (in-memory for simplicity)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3; // Max 3 attempts per 15 minutes

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }
  
  record.count++;
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many password reset attempts. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Password reset requested for:', email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use Supabase's built-in password reset functionality
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.supabase.co/auth/v1/verify?redirect_to=https://nakamoto.aigentz.me/reset-password`
    });

    if (error) {
      console.error('Error sending reset email:', error);
      // Don't reveal specific errors for security
      return new Response(
        JSON.stringify({ message: 'If an account with this email exists, you will receive a password reset link.' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Password reset email sent for:', email);

    return new Response(
      JSON.stringify({ 
        message: 'If an account with this email exists, you will receive a password reset link.',
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in password reset function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request. Please try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);