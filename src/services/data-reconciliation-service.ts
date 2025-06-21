
import { supabase } from '@/integrations/supabase/client';

interface ReconciliationResult {
  emailsReconciled: number;
  signupsReconciled: number;
  duplicatesHandled: number;
  errors: string[];
}

class DataReconciliationService {
  async reconcileHistoricalData(): Promise<ReconciliationResult> {
    const result: ReconciliationResult = {
      emailsReconciled: 0,
      signupsReconciled: 0,
      duplicatesHandled: 0,
      errors: []
    };

    try {
      // Step 1: Find users who have persona data but no invitation record
      const { data: orphanedPersonas, error: personasError } = await supabase
        .from('knyt_personas')
        .select('user_id, "Email"')
        .not('"Email"', 'is', null);

      if (personasError) {
        result.errors.push(`Error fetching personas: ${personasError.message}`);
        return result;
      }

      // Step 2: Find users who have signed up but invitation not marked complete
      for (const persona of orphanedPersonas || []) {
        if (!persona.Email) continue;

        const { data: invitation, error: invError } = await supabase
          .from('invited_users')
          .select('*')
          .eq('email', persona.Email.toLowerCase())
          .single();

        if (invError && invError.code !== 'PGRST116') {
          result.errors.push(`Error checking invitation for ${persona.Email}: ${invError.message}`);
          continue;
        }

        if (invitation && !invitation.signup_completed) {
          // Mark as completed
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({
              signup_completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

          if (updateError) {
            result.errors.push(`Failed to update signup status for ${persona.Email}: ${updateError.message}`);
          } else {
            result.signupsReconciled++;
          }
        }
      }

      // Step 3: Reconcile email counts by checking actual sent emails
      await this.reconcileEmailCounts(result);

      return result;
    } catch (error: any) {
      result.errors.push(`Unexpected error: ${error.message}`);
      return result;
    }
  }

  private async reconcileEmailCounts(result: ReconciliationResult): Promise<void> {
    try {
      // Get all invitations that should have emails sent
      const { data: allInvitations, error } = await supabase
        .from('invited_users')
        .select('id, email, email_sent, email_sent_at, batch_id, invited_at');

      if (error) {
        result.errors.push(`Error fetching invitations for email reconciliation: ${error.message}`);
        return;
      }

      // For historical emails (before batch system), we'll assume they were sent
      // if the user has signed up or if we know they received an email
      for (const invitation of allInvitations || []) {
        if (!invitation.email_sent && !invitation.batch_id) {
          // This might be a historical email - check if user has signed up
          const { data: persona } = await supabase
            .from('knyt_personas')
            .select('user_id')
            .eq('"Email"', invitation.email)
            .single();

          if (persona) {
            // User signed up, so they must have received an email
            const { error: updateError } = await supabase
              .from('invited_users')
              .update({
                email_sent: true,
                email_sent_at: invitation.invited_at || new Date().toISOString()
              })
              .eq('id', invitation.id);

            if (updateError) {
              result.errors.push(`Failed to update email status for ${invitation.email}: ${updateError.message}`);
            } else {
              result.emailsReconciled++;
            }
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Error in email reconciliation: ${error.message}`);
    }
  }

  async getReconciliationReport(): Promise<{
    totalInvitations: number;
    emailsSent: number;
    signupsCompleted: number;
    pendingEmails: number;
    awaitingSignup: number;
  }> {
    const { data: invitations } = await supabase
      .from('invited_users')
      .select('email_sent, signup_completed');

    const total = invitations?.length || 0;
    const emailsSent = invitations?.filter(i => i.email_sent).length || 0;
    const signupsCompleted = invitations?.filter(i => i.signup_completed).length || 0;
    const pendingEmails = invitations?.filter(i => !i.email_sent).length || 0;
    const awaitingSignup = invitations?.filter(i => i.email_sent && !i.signup_completed).length || 0;

    return {
      totalInvitations: total,
      emailsSent,
      signupsCompleted,
      pendingEmails,
      awaitingSignup
    };
  }

  async findDuplicateEmails(): Promise<{ email: string; count: number; ids: string[] }[]> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email');

    if (error) {
      console.error('Error fetching invitations for duplicate check:', error);
      return [];
    }

    const emailMap = new Map<string, { count: number; ids: string[] }>();
    
    for (const invitation of data || []) {
      const email = invitation.email.toLowerCase();
      if (emailMap.has(email)) {
        const existing = emailMap.get(email)!;
        existing.count++;
        existing.ids.push(invitation.id);
      } else {
        emailMap.set(email, { count: 1, ids: [invitation.id] });
      }
    }

    return Array.from(emailMap.entries())
      .filter(([_, data]) => data.count > 1)
      .map(([email, data]) => ({
        email,
        count: data.count,
        ids: data.ids
      }));
  }
}

export const dataReconciliationService = new DataReconciliationService();
