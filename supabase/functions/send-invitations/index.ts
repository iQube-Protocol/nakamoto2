
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { RetryService } from './retry-service.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationsRequest {
  emails: string[];
  testMode?: boolean;
  batchId?: string;
}

interface MailjetResponse {
  Messages: Array<{
    Status: string;
    CustomID: string;
    To: Array<{
      Email: string;
      MessageUUID: string;
      MessageID: number;
      MessageHref: string;
    }>;
    Cc: Array<any>;
    Bcc: Array<any>;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails, testMode = false, batchId }: SendInvitationsRequest = await req.json();

    console.log('=== EMAIL SEND REQUEST START ===');
    console.log('Request details:', {
      emailCount: emails?.length || 0,
      testMode,
      batchId,
      timestamp: new Date().toISOString()
    });

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.error('Invalid emails array:', emails);
      return new Response(
        JSON.stringify({ success: false, errors: ['No valid emails provided'] }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 1. CHECK SUPABASE CONFIGURATION
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPrefix: supabaseUrl?.substring(0, 20) + '...'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, errors: ['Server configuration error'] }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. CHECK MAILJET CONFIGURATION
    const mailjetApiKey = Deno.env.get('MAILJET_API_KEY');
    const mailjetSecretKey = Deno.env.get('MAILJET_SECRET_KEY');
    
    console.log('Mailjet config check:', {
      hasApiKey: !!mailjetApiKey,
      hasSecretKey: !!mailjetSecretKey,
      apiKeyPrefix: mailjetApiKey?.substring(0, 8) + '...',
      secretKeyPrefix: mailjetSecretKey?.substring(0, 8) + '...'
    });
    
    if (!mailjetApiKey || !mailjetSecretKey) {
      console.error('Missing Mailjet credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: ['Email service not configured. Please add MAILJET_API_KEY and MAILJET_SECRET_KEY to your Supabase secrets.']
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 3. VALIDATE AND FILTER EMAILS
    const validEmails = emails.filter(email => {
      const isValid = email && typeof email === 'string' && email.includes('@') && email.includes('.');
      if (!isValid) {
        console.warn('Invalid email format:', email);
      }
      return isValid;
    });

    console.log('Email validation:', {
      totalReceived: emails.length,
      validEmails: validEmails.length,
      invalidCount: emails.length - validEmails.length
    });

    if (validEmails.length === 0) {
      console.error('No valid emails found after filtering');
      return new Response(
        JSON.stringify({ success: false, errors: ['No valid email addresses provided'] }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 4. FETCH INVITATION DATA - Improved batched approach
    console.log('Fetching invitations from database...');
    
    const BATCH_SIZE = 50; // Reduced batch size for better reliability
    const allInvitations: any[] = [];
    
    for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
      const emailBatch = validEmails.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}, emails ${i + 1}-${Math.min(i + BATCH_SIZE, validEmails.length)}`);
      
      try {
        const { data: batchInvitations, error: fetchError } = await supabase
          .from('invited_users')
          .select('email, invitation_token, persona_type')
          .eq('signup_completed', false)
          .gte('expires_at', new Date().toISOString())
          .in('email', emailBatch);

        if (fetchError) {
          console.error(`Database error fetching invitations for batch ${Math.floor(i / BATCH_SIZE) + 1}:`, fetchError);
          continue;
        }

        if (batchInvitations && batchInvitations.length > 0) {
          allInvitations.push(...batchInvitations);
          console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} results: ${batchInvitations.length} invitations found`);
        }
      } catch (batchError) {
        console.error(`Error processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError);
        continue;
      }
    }

    console.log('Database query results:', {
      totalBatches: Math.ceil(validEmails.length / BATCH_SIZE),
      foundInvitations: allInvitations.length,
      requestedEmails: validEmails.length,
      sampleInvitations: allInvitations.slice(0, 3).map(inv => inv.email)
    });

    if (allInvitations.length === 0) {
      console.log('No valid invitations found for any emails');
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: ['No valid pending invitations found for the provided emails. Make sure the invitations exist and have not expired.'] 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 5. SETUP RETRY SERVICE
    const retryService = new RetryService({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryCondition: (error: any) => {
        return error?.status >= 500 || error?.message?.includes('fetch');
      }
    });

    const errors: string[] = [];
    let successCount = 0;
    const sentEmails: string[] = [];

    // 6. SEND EMAILS WITH ENHANCED ERROR HANDLING
    console.log('=== STARTING EMAIL SEND PROCESS ===');
    
    for (const [index, invitation] of allInvitations.entries()) {
      try {
        console.log(`\n--- Processing email ${index + 1}/${allInvitations.length} ---`);
        console.log(`Sending to: ${invitation.email} (${invitation.persona_type})`);
        
        // Increment send attempts - with better error handling
        try {
          const { error: incrementError } = await supabase.rpc('increment_send_attempts', {
            target_email: invitation.email
          });
          
          if (incrementError) {
            console.warn(`Failed to increment send attempts for ${invitation.email}:`, incrementError);
          }
        } catch (incrementErr) {
          console.warn(`Error incrementing send attempts for ${invitation.email}:`, incrementErr);
        }

        // Updated to use current domain instead of hardcoded old one
        const invitationUrl = `https://preview--aigent-nakamoto.lovable.app/invited-signup?token=${invitation.invitation_token}`;
        
        const emailData = {
          Messages: [{
            From: {
              Email: "nakamoto@metame.com",
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

        console.log('Email payload prepared for:', invitation.email);

        // Send email with retry logic and better error handling
        const result = await retryService.execute(async () => {
          console.log(`Making Mailjet API call for ${invitation.email}...`);
          
          const response = await fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${mailjetApiKey}:${mailjetSecretKey}`)}`
            },
            body: JSON.stringify(emailData)
          });

          console.log(`Mailjet API response for ${invitation.email}:`, {
            status: response.status,
            statusText: response.statusText
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Mailjet API error for ${invitation.email}:`, {
              status: response.status,
              statusText: response.statusText,
              errorData: errorData
            });
            
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            (error as any).status = response.status;
            (error as any).response = errorData;
            throw error;
          }

          return await response.json();
        });

        console.log(`✅ Email sent successfully to ${invitation.email}`);
        
        // Mark email as sent in database with error handling
        try {
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({ 
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              batch_id: batchId
            })
            .eq('email', invitation.email);

          if (updateError) {
            console.error(`Error updating email sent status for ${invitation.email}:`, updateError);
          }
        } catch (updateErr) {
          console.error(`Failed to update database for ${invitation.email}:`, updateErr);
        }

        successCount++;
        sentEmails.push(invitation.email);

        // In test mode, only send one email
        if (testMode) {
          console.log('Test mode: stopping after first successful send');
          break;
        }

        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`❌ Error processing invitation for ${invitation.email}:`, {
          message: error.message,
          status: error.status,
          response: error.response
        });
        errors.push(`Failed to send to ${invitation.email}: ${error.message}`);
      }
    }

    console.log('\n=== EMAIL SEND PROCESS COMPLETE ===');

    const responseData = { 
      success: successCount > 0,
      errors,
      sent: successCount,
      total: testMode ? Math.min(1, allInvitations.length) : allInvitations.length,
      message: testMode 
        ? `Test email ${successCount > 0 ? 'sent successfully' : 'failed'}`
        : `Successfully sent ${successCount} of ${allInvitations.length} invitation emails${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
      sentEmails,
      batchId,
      debug: {
        mailjetConfigured: !!(mailjetApiKey && mailjetSecretKey),
        databaseInvitations: allInvitations.length,
        validEmails: validEmails.length,
        batchProcessing: true,
        batchSize: BATCH_SIZE
      }
    };

    console.log('Final response:', responseData);
    console.log('=== EMAIL SEND REQUEST END ===\n');

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error in send-invitations function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        errors: [`Unexpected error: ${error.message}`],
        debug: {
          errorType: error.constructor.name,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
