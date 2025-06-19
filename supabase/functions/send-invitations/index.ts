
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

    // For now, we'll just log the invitation details
    // In a real implementation, you would integrate with an email service like Resend
    for (const invitation of invitations) {
      try {
        const invitationUrl = `${supabaseUrl.replace('supabase.co', 'vercel.app')}/signup?token=${invitation.invitation_token}`;
        
        console.log(`Would send invitation email to: ${invitation.email}`);
        console.log(`Invitation URL: ${invitationUrl}`);
        console.log(`Persona Type: ${invitation.persona_type}`);
        
        // TODO: Integrate with email service
        // Example with Resend:
        /*
        const emailResponse = await resend.emails.send({
          from: "Agent Nakamoto <invitations@yourdomain.com>",
          to: [invitation.email],
          subject: "You're invited to join Agent Nakamoto",
          html: `
            <h1>Welcome to Agent Nakamoto!</h1>
            <p>You've been invited to create your ${invitation.persona_type} persona account.</p>
            <p><a href="${invitationUrl}">Click here to complete your signup</a></p>
            <p>This invitation expires in 30 days.</p>
          `,
        });
        */
        
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
        message: `Would send ${successCount} invitation emails (email integration needed)`
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
