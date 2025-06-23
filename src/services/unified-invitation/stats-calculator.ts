
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedInvitationStats } from './types';

export class StatsCalculator {
  static async calculateUnifiedStats(): Promise<UnifiedInvitationStats> {
    console.log('StatsCalculator: Calculating unified stats...');
    
    try {
      // Get all invitation data without any limit to ensure we get everything
      const { data: allInvitations, error, count } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed, invited_at', { count: 'exact' })
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('StatsCalculator: Error fetching invitations:', error);
        throw error;
      }

      console.log('StatsCalculator: Raw query results:', {
        dataLength: allInvitations?.length || 0,
        exactCount: count,
        sampleData: allInvitations?.slice(0, 3)
      });

      // Use the exact count from Supabase to ensure accuracy
      const totalCreated = count || 0;
      const emailsSent = allInvitations?.filter(inv => inv.email_sent === true).length || 0;
      const emailsPending = allInvitations?.filter(inv => inv.email_sent === false).length || 0;
      const signupsCompleted = allInvitations?.filter(inv => inv.signup_completed === true).length || 0;
      const awaitingSignup = allInvitations?.filter(inv => inv.email_sent === true && inv.signup_completed === false).length || 0;
      const conversionRate = emailsSent > 0 ? (signupsCompleted / emailsSent) * 100 : 0;

      const stats: UnifiedInvitationStats = {
        totalCreated,
        emailsSent,
        emailsPending,
        signupsCompleted,
        awaitingSignup,
        conversionRate,
        lastUpdated: new Date().toISOString()
      };

      console.log('StatsCalculator: Generated unified stats:', stats);
      console.log('StatsCalculator: Data verification:', {
        totalFromCount: count,
        totalFromArray: allInvitations?.length,
        emailsSentCalculated: emailsSent,
        emailsPendingCalculated: emailsPending,
        mathCheck: emailsSent + emailsPending === totalCreated,
        signupsCompletedCalculated: signupsCompleted,
        awaitingSignupCalculated: awaitingSignup
      });

      // Validate the math
      if (emailsSent + emailsPending !== totalCreated) {
        console.warn('StatsCalculator: Math validation failed:', {
          emailsSent,
          emailsPending,
          totalCreated,
          sum: emailsSent + emailsPending
        });
      }

      return stats;
    } catch (error) {
      console.error('StatsCalculator: Failed to calculate stats:', error);
      throw new Error(`Failed to get invitation stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async validateDataConsistency(): Promise<{
    isConsistent: boolean;
    issues: string[];
    detailedStats: any;
  }> {
    console.log('StatsCalculator: Validating data consistency...');
    
    try {
      // Get detailed breakdown by different queries to identify discrepancies
      const [
        { count: totalCount },
        { count: sentCount },
        { count: pendingCount },
        { count: completedCount },
        { data: batchData }
      ] = await Promise.all([
        supabase.from('invited_users').select('*', { count: 'exact', head: true }),
        supabase.from('invited_users').select('*', { count: 'exact', head: true }).eq('email_sent', true),
        supabase.from('invited_users').select('*', { count: 'exact', head: true }).eq('email_sent', false),
        supabase.from('invited_users').select('*', { count: 'exact', head: true }).eq('signup_completed', true),
        supabase.from('email_batches').select('*')
      ]);

      const issues: string[] = [];
      const detailedStats = {
        totalInvitations: totalCount,
        emailsSent: sentCount,
        emailsPending: pendingCount,
        signupsCompleted: completedCount,
        totalBatches: batchData?.length || 0,
        batchEmailTotals: batchData?.reduce((sum, batch) => sum + batch.total_emails, 0) || 0
      };

      // Check for math inconsistencies
      if ((sentCount || 0) + (pendingCount || 0) !== (totalCount || 0)) {
        issues.push(`Math error: Sent (${sentCount}) + Pending (${pendingCount}) ≠ Total (${totalCount})`);
      }

      // Check for stuck batches
      const stuckBatches = batchData?.filter(batch => 
        batch.status === 'pending' && 
        new Date(batch.created_at).getTime() < Date.now() - 300000 // 5 minutes old
      ) || [];

      if (stuckBatches.length > 0) {
        issues.push(`Found ${stuckBatches.length} stuck batches older than 5 minutes`);
      }

      // Check for missing batch tracking
      const batchEmailTotal = batchData?.reduce((sum, batch) => sum + batch.total_emails, 0) || 0;
      if (batchEmailTotal > 0 && batchEmailTotal < (sentCount || 0)) {
        issues.push(`Batch tracking incomplete: Batch total (${batchEmailTotal}) < Emails sent (${sentCount})`);
      }

      console.log('StatsCalculator: Validation results:', { issues, detailedStats });

      return {
        isConsistent: issues.length === 0,
        issues,
        detailedStats
      };
    } catch (error: any) {
      console.error('StatsCalculator: Validation failed:', error);
      return {
        isConsistent: false,
        issues: [`Validation failed: ${error.message}`],
        detailedStats: {}
      };
    }
  }

  // Add debug method to see actual status distribution
  static async debugStatusDistribution(): Promise<void> {
    try {
      const { data: allInvitations, error } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed, email_sent_at, completed_at, send_attempts');

      if (error) {
        console.error('Debug query failed:', error);
        return;
      }

      const distribution = {
        total: allInvitations?.length || 0,
        emailSentTrue: allInvitations?.filter(inv => inv.email_sent === true).length || 0,
        emailSentFalse: allInvitations?.filter(inv => inv.email_sent === false).length || 0,
        signupCompletedTrue: allInvitations?.filter(inv => inv.signup_completed === true).length || 0,
        signupCompletedFalse: allInvitations?.filter(inv => inv.signup_completed === false).length || 0,
        awaitingSignup: allInvitations?.filter(inv => inv.email_sent === true && inv.signup_completed === false).length || 0,
        pendingEmailSend: allInvitations?.filter(inv => inv.email_sent === false && inv.signup_completed === false).length || 0
      };

      console.log('StatsCalculator: Actual data distribution:', distribution);
      
      // Verify math
      console.log('StatsCalculator: Math verification:', {
        emailSentTrue_plus_emailSentFalse: distribution.emailSentTrue + distribution.emailSentFalse,
        total: distribution.total,
        mathCorrect: (distribution.emailSentTrue + distribution.emailSentFalse) === distribution.total
      });

    } catch (error) {
      console.error('StatsCalculator: Debug failed:', error);
    }
  }
}
