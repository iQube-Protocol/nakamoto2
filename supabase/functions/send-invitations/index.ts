
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationsRequest {
  emails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails }: SendInvitationsRequest = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: false, errors: ['No emails provided'] }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invitation data for the provided emails
    const { data: invitations, error: fetchError } = await supabase
      .from('invited_users')
      .select('email, invitation_token, persona_type')
      .in('email', emails)
      .eq('signup_completed', false)
      .gt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching invitations:', fetchError);
      return new Response(
        JSON.stringify({ success: false, errors: ['Failed to fetch invitation data'] }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!invitations || invitations.length === 0) {
      return new Response(
        JSON.stringify({ success: false, errors: ['No valid invitations found'] }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const errors: string[] = [];
    let successCount = 0;

    // Get Mailjet credentials
    const mailjetApiKey = Deno.env.get('MAILJET_API_KEY');
    const mailjetSecretKey = Deno.env.get('MAILJET_SECRET_KEY');
    
    if (!mailjetApiKey || !mailjetSecretKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: ['Mailjet API credentials not configured. Please add MAILJET_API_KEY and MAILJET_SECRET_KEY to your Supabase secrets.']
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send emails using Mailjet
    for (const invitation of invitations) {
      try {
        const invitationUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/invited-signup?token=${invitation.invitation_token}`;
        
        const emailData = {
          Messages: [{
            From: {
              Email: "hello@trial-z3m5jgrmk8x4dpyo.mlsender.net", // Mailjet trial sender
              Name: "Agent Nakamoto"
            },
            To: [{
              Email: invitation.email,
              Name: invitation.email.split('@')[0]
            }],
            Subject: `You're invited to join Agent Nakamoto as a ${invitation.persona_type} persona`,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; text-align: center;">Welcome to Agent Nakamoto!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                  You've been invited to create your <strong>${invitation.persona_type.toUpperCase()}</strong> persona account on our platform.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${invitationUrl}" 
                     style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Complete Your Signup
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center;">
                  This invitation expires in 30 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                  Agent Nakamoto Platform
                </p>
              </div>
            `,
            TextPart: `
              Welcome to Agent Nakamoto!
              
              You've been invited to create your ${invitation.persona_type.toUpperCase()} persona account.
              
              Complete your signup here: ${invitationUrl}
              
              This invitation expires in 30 days.
              
              If you didn't expect this invitation, you can safely ignore this email.
            `
          }]
        };

        const response = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${mailjetApiKey}:${mailjetSecretKey}`)}`
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Error sending email to ${invitation.email}:`, errorData);
          errors.push(`Failed to send to ${invitation.email}: ${response.status}`);
          continue;
        }

        const result = await response.json();
        console.log(`Email sent successfully to ${invitation.email}:`, result);
        successCount++;

      } catch (error) {
        console.error(`Error processing invitation for ${invitation.email}:`, error);
        errors.push(`Failed to send to ${invitation.email}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        errors,
        sent: successCount,
        message: `Successfully sent ${successCount} invitation emails${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-invitations function:', error);
    return new Response(
      JSON.stringify({ success: false, errors: [`Unexpected error: ${error.message}`] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
