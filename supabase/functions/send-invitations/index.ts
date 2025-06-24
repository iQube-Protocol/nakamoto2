
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  emails: string[];
  testMode?: boolean;
  batchId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails, testMode = false, batchId }: InvitationEmailRequest = await req.json();
    
    console.log(`🚀 Send invitations started:`, {
      emailCount: emails.length,
      testMode,
      batchId,
      timestamp: new Date().toISOString()
    });

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: false, errors: ['No emails provided'] }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const errors: string[] = [];
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of emails) {
      try {
        console.log(`📧 Processing invitation for: ${email}`);

        // Get the invitation record to generate token and URL
        const { data: invitation, error: fetchError } = await supabase
          .from('invited_users')
          .select('*')
          .eq('email', email)
          .eq('signup_completed', false)
          .single();

        if (fetchError || !invitation) {
          const errorMsg = `No pending invitation found for ${email}`;
          console.error(`❌ ${errorMsg}:`, fetchError);
          errors.push(errorMsg);
          results.push({ email, success: false, error: errorMsg });
          continue;
        }

        // Generate the invitation URL that points to our edge function
        const invitationUrl = `${supabaseUrl}/functions/v1/invitation-redirect?token=${invitation.invitation_token}`;
        
        console.log(`🔗 Generated invitation URL for ${email}:`, invitationUrl);

        if (testMode) {
          console.log(`🧪 TEST MODE: Would send email to ${email} with URL: ${invitationUrl}`);
          
          // Mark as sent in test mode
          await supabase
            .from('invited_users')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('email', email);

          results.push({ email, success: true });
          continue;
        }

        // In production, you would integrate with your email service here
        // For now, we'll simulate email sending and mark as sent
        console.log(`📤 Sending invitation email to ${email}`);
        
        // TODO: Replace this with actual email service integration
        // Example: Mailjet, SendGrid, etc.
        const emailSent = await sendEmailViaService(email, invitationUrl, invitation);
        
        if (emailSent) {
          // Mark email as sent
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('email', email);

          if (updateError) {
            console.error(`❌ Failed to update email status for ${email}:`, updateError);
            errors.push(`Failed to update status for ${email}`);
            results.push({ email, success: false, error: 'Database update failed' });
          } else {
            console.log(`✅ Successfully sent and marked email for ${email}`);
            results.push({ email, success: true });
          }
        } else {
          const errorMsg = `Failed to send email to ${email}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
          results.push({ email, success: false, error: errorMsg });
        }

      } catch (emailError: any) {
        const errorMsg = `Error processing ${email}: ${emailError.message}`;
        console.error(`❌ ${errorMsg}`, emailError);
        errors.push(errorMsg);
        results.push({ email, success: false, error: emailError.message });
      }
    }

    const successfulSends = results.filter(r => r.success).length;
    const failedSends = results.filter(r => !r.success).length;

    console.log(`📊 Send invitations completed:`, {
      total: emails.length,
      successful: successfulSends,
      failed: failedSends,
      batchId,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: failedSends === 0,
        total: emails.length,
        sent: successfulSends,
        failed: failedSends,
        errors: errors,
        results: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Critical error in send-invitations function:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        errors: [`Critical error: ${error.message}`] 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

// Mock email service function - replace with actual email service
async function sendEmailViaService(email: string, invitationUrl: string, invitation: any): Promise<boolean> {
  try {
    // This is where you would integrate with Mailjet, SendGrid, etc.
    console.log(`📧 Mock: Sending email to ${email} with invitation URL: ${invitationUrl}`);
    
    // For now, we'll simulate success
    // In production, replace this with actual email service call
    return true;
    
  } catch (error) {
    console.error(`❌ Email service error:`, error);
    return false;
  }
}

serve(handler);
