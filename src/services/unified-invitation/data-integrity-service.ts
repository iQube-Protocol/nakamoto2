
import { supabase } from '@/integrations/supabase/client';

interface DataIntegrityReport {
  totalInvitations: number;
  emailsSent: number;
  emailsPending: number;
  signupsCompleted: number;
  awaitingSignup: number;
  discrepancies: string[];
  criticalIssues: string[];
  recommendations: string[];
}

export class DataIntegrityService {
  static async generateFullReport(): Promise<DataIntegrityReport> {
    console.log('DataIntegrityService: Starting comprehensive data integrity check...');
    
    try {
      // Get all invitation data
      const { data: invitations, error: invitationError } = await supabase
        .from('invited_users')
        .select('*');

      if (invitationError) {
        throw new Error(`Failed to fetch invitations: ${invitationError.message}`);
      }

      const totalInvitations = invitations?.length || 0;
      const emailsSent = invitations?.filter(inv => inv.email_sent === true).length || 0;
      const emailsPending = invitations?.filter(inv => inv.email_sent === false).length || 0;
      const signupsCompleted = invitations?.filter(inv => inv.signup_completed === true).length || 0;
      const awaitingSignup = invitations?.filter(inv => inv.email_sent === true && inv.signup_completed === false).length || 0;

      const discrepancies: string[] = [];
      const criticalIssues: string[] = [];
      const recommendations: string[] = [];

      // Check basic math
      if (emailsSent + emailsPending !== totalInvitations) {
        criticalIssues.push(`Math error: Sent (${emailsSent}) + Pending (${emailsPending}) = ${emailsSent + emailsPending} ≠ Total (${totalInvitations})`);
      }

      // Check signup logic
      if (signupsCompleted + awaitingSignup !== emailsSent) {
        const difference = Math.abs((signupsCompleted + awaitingSignup) - emailsSent);
        criticalIssues.push(`Signup logic error: Completed (${signupsCompleted}) + Awaiting (${awaitingSignup}) = ${signupsCompleted + awaitingSignup} ≠ Emails Sent (${emailsSent}). Difference: ${difference}`);
        
        if (signupsCompleted + awaitingSignup > emailsSent) {
          criticalIssues.push(`CRITICAL: More signups than emails sent suggests data corruption or legacy users`);
          recommendations.push(`Fix legacy users who signed up before email system was implemented`);
        }
      }

      // Find records with impossible states (signup without email sent)
      const impossibleStates = invitations?.filter(inv => 
        inv.signup_completed === true && inv.email_sent === false
      ) || [];

      if (impossibleStates.length > 0) {
        criticalIssues.push(`Found ${impossibleStates.length} users who completed signup without email being sent (likely legacy users)`);
        recommendations.push(`Fix legacy users by setting email_sent = true for users who signed up before automated system`);
        
        // Log the specific problematic records for debugging
        console.log('DataIntegrityService: Legacy users found:', impossibleStates.map(inv => ({
          id: inv.id,
          email: inv.email,
          invited_at: inv.invited_at,
          completed_at: inv.completed_at,
          email_sent: inv.email_sent,
          signup_completed: inv.signup_completed
        })));
      }

      // Check for users with missing email_sent_at
      const missingSentTimestamp = invitations?.filter(inv => 
        inv.email_sent === true && !inv.email_sent_at
      ) || [];

      if (missingSentTimestamp.length > 0) {
        discrepancies.push(`${missingSentTimestamp.length} users have email_sent=true but missing email_sent_at timestamp`);
      }

      // Check for users with missing completed_at
      const missingCompletedTimestamp = invitations?.filter(inv => 
        inv.signup_completed === true && !inv.completed_at
      ) || [];

      if (missingCompletedTimestamp.length > 0) {
        discrepancies.push(`${missingCompletedTimestamp.length} users have signup_completed=true but missing completed_at timestamp`);
      }

      // Check for high send_attempts
      const highAttempts = invitations?.filter(inv => inv.send_attempts > 5) || [];
      if (highAttempts.length > 0) {
        discrepancies.push(`${highAttempts.length} users have more than 5 send attempts`);
      }

      // Check for stale pending invitations
      const staleInvitations = invitations?.filter(inv => {
        if (!inv.invited_at) return false;
        const daysSinceInvited = (Date.now() - new Date(inv.invited_at).getTime()) / (1000 * 60 * 60 * 24);
        return inv.email_sent === false && daysSinceInvited > 7;
      }) || [];

      if (staleInvitations.length > 0) {
        discrepancies.push(`${staleInvitations.length} invitations pending for more than 7 days`);
        recommendations.push(`Review email sending process for stale invitations`);
      }

      console.log('DataIntegrityService: Report generated:', {
        totalInvitations,
        emailsSent,
        emailsPending,
        signupsCompleted,
        awaitingSignup,
        discrepanciesCount: discrepancies.length,
        criticalIssuesCount: criticalIssues.length
      });

      return {
        totalInvitations,
        emailsSent,
        emailsPending,
        signupsCompleted,
        awaitingSignup,
        discrepancies,
        criticalIssues,
        recommendations
      };
    } catch (error: any) {
      console.error('DataIntegrityService: Report generation failed:', error);
      throw new Error(`Data integrity check failed: ${error.message}`);
    }
  }

  static async fixDataInconsistencies(): Promise<{ fixed: number; errors: string[] }> {
    console.log('DataIntegrityService: Starting data fix process...');
    
    let fixed = 0;
    const errors: string[] = [];

    try {
      // Fix legacy users who signed up without email_sent being true
      const { data: legacyUsers, error: fetchError } = await supabase
        .from('invited_users')
        .select('id, email, invited_at, completed_at')
        .eq('signup_completed', true)
        .eq('email_sent', false);

      if (fetchError) {
        errors.push(`Failed to fetch legacy users: ${fetchError.message}`);
      } else if (legacyUsers && legacyUsers.length > 0) {
        console.log(`DataIntegrityService: Found ${legacyUsers.length} legacy users to fix`);
        
        for (const user of legacyUsers) {
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({ 
              email_sent: true,
              email_sent_at: user.invited_at || new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            errors.push(`Failed to fix legacy user ${user.email}: ${updateError.message}`);
          } else {
            console.log(`DataIntegrityService: Fixed legacy user ${user.email}`);
            fixed++;
          }
        }
      }

      // Fix missing email_sent_at timestamps
      const { data: missingSentTimestamp, error: missingError } = await supabase
        .from('invited_users')
        .select('id, invited_at')
        .eq('email_sent', true)
        .is('email_sent_at', null);

      if (missingError) {
        errors.push(`Failed to fetch missing timestamps: ${missingError.message}`);
      } else if (missingSentTimestamp && missingSentTimestamp.length > 0) {
        for (const record of missingSentTimestamp) {
          const { error: updateError } = await supabase
            .from('invited_users')
            .update({ email_sent_at: record.invited_at })
            .eq('id', record.id);

          if (updateError) {
            errors.push(`Failed to fix email_sent_at for ${record.id}: ${updateError.message}`);
          } else {
            fixed++;
          }
        }
      }

      console.log(`DataIntegrityService: Fixed ${fixed} records with ${errors.length} errors`);
      return { fixed, errors };
    } catch (error: any) {
      errors.push(`Fix process failed: ${error.message}`);
      return { fixed, errors };
    }
  }

  static async getLegacyUsers(): Promise<{ email: string; invited_at: string; completed_at: string | null }[]> {
    console.log('DataIntegrityService: Fetching legacy users...');
    
    try {
      const { data: legacyUsers, error } = await supabase
        .from('invited_users')
        .select('email, invited_at, completed_at')
        .eq('signup_completed', true)
        .eq('email_sent', false)
        .order('invited_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch legacy users: ${error.message}`);
      }

      return legacyUsers || [];
    } catch (error: any) {
      console.error('DataIntegrityService: Failed to get legacy users:', error);
      throw error;
    }
  }
}
