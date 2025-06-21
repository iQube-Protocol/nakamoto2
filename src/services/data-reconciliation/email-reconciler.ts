
import { supabase } from '@/integrations/supabase/client';
import { ReconciliationResult } from './types';

export class EmailReconciler {
  async reconcileEmailCounts(result: ReconciliationResult): Promise<void> {
    try {
      // Get all invitations that should have emails sent
      const invitationsResponse = await supabase
        .from('invited_users')
        .select('id, email, email_sent, email_sent_at, batch_id, invited_at');

      if (invitationsResponse.error) {
        result.errors.push(`Error fetching invitations for email reconciliation: ${invitationsResponse.error.message}`);
        return;
      }

      const allInvitations = invitationsResponse.data;
      if (!allInvitations || allInvitations.length === 0) {
        return;
      }

      // For historical emails (before batch system), we'll assume they were sent
      // if the user has signed up or if we know they received an email
      for (const invitation of allInvitations) {
        if (!invitation.email_sent && !invitation.batch_id) {
          // This might be a historical email - check if user has signed up
          try {
            // Simple query to check if user exists in personas
            const queryResult = await supabase
              .from('knyt_personas')
              .select('user_id')
              .ilike('Email', invitation.email)
              .limit(1);

            if (queryResult.data && queryResult.data.length > 0) {
              // User signed up, so they must have received an email
              const updateResponse = await supabase
                .from('invited_users')
                .update({
                  email_sent: true,
                  email_sent_at: invitation.invited_at || new Date().toISOString()
                })
                .eq('id', invitation.id);

              if (updateResponse.error) {
                result.errors.push(`Failed to update email status for ${invitation.email}: ${updateResponse.error.message}`);
              } else {
                result.emailsReconciled++;
              }
            }
          } catch (personaError: any) {
            result.errors.push(`Error checking persona for ${invitation.email}: ${personaError.message}`);
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Error in email reconciliation: ${error.message}`);
    }
  }
}
