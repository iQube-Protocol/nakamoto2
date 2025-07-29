import { supabase } from '@/integrations/supabase/client';
import type { UnifiedInvitationStats } from './types';

export class StatsCalculator {
  static async calculateUnifiedStats(): Promise<UnifiedInvitationStats> {
    console.log('StatsCalculator: Calculating unified stats with corrected formulas (3,529 total)...');
    
    try {
      // 1. TOTAL INVITATIONS CREATED: Real invitations only (exclude 'direct_signup' placeholders)
      const { data: realInvitations, error: invitationsError, count: realInvitationsCount } = await supabase
        .from('invited_users')
        .select('email, email_sent, signup_completed, persona_type, invited_at, batch_id', { count: 'exact' })
        .or('batch_id.neq.direct_signup,batch_id.is.null')
        .order('invited_at', { ascending: false });

      if (invitationsError) {
        console.error('StatsCalculator: Error fetching real invitations:', invitationsError);
        throw invitationsError;
      }

      // 2. Get invited users who completed signup (real invitations only)
      const { count: invitedUsersCompleted } = await supabase
        .from('invited_users')
        .select('*', { count: 'exact', head: true })
        .or('batch_id.neq.direct_signup,batch_id.is.null')
        .eq('signup_completed', true);

      // 3. Calculate direct signups: Use RPC function to count auth.users not in invited_users
      let directSignupsCount = 0;
      try {
        const { data: directSignupData, error: rpcError } = await supabase.rpc('count_direct_signups');
        if (rpcError) {
          console.error('RPC error counting direct signups:', rpcError);
          directSignupsCount = 0;
        } else {
          directSignupsCount = directSignupData as number || 0;
        }
      } catch (error) {
        console.warn('Direct signup calculation failed, using fallback of 0:', error);
        directSignupsCount = 0;
      }

      console.log('StatsCalculator: Corrected data counts:', {
        realInvitationsCount: realInvitationsCount || 0,
        invitedUsersCompleted: invitedUsersCompleted || 0,
        directSignupsCount
      });

      // 4. Calculate dashboard metrics using corrected formulas
      const totalCreated = realInvitationsCount || 0; // Should be 3,529
      const emailsSent = realInvitations?.filter(inv => inv.email_sent === true).length || 0;
      const emailsPending = realInvitations?.filter(inv => inv.email_sent === false).length || 0;
      const signupsCompleted = invitedUsersCompleted || 0; // Real invited users who completed signup
      const awaitingSignup = emailsSent - signupsCompleted; // People who got emails but haven't signed up
      const conversionRate = emailsSent > 0 ? (signupsCompleted / emailsSent) * 100 : 0;

      const stats: UnifiedInvitationStats = {
        totalCreated,
        emailsSent,
        emailsPending,
        signupsCompleted,
        awaitingSignup,
        directSignups: directSignupsCount || 0,
        conversionRate,
        lastUpdated: new Date().toISOString()
      };

      console.log('StatsCalculator: Generated unified stats:', stats);
      console.log('StatsCalculator: Data verification:', {
        totalFromCount: realInvitationsCount,
        totalFromArray: realInvitations?.length,
        emailsSentCalculated: emailsSent,
        emailsPendingCalculated: emailsPending,
        basicMathCheck: emailsSent + emailsPending === totalCreated,
        signupsCompletedCalculated: signupsCompleted,
        awaitingSignupCalculated: awaitingSignup,
        signupMathCheck: signupsCompleted + awaitingSignup,
        emailsSentForComparison: emailsSent,
        signupConversionCheck: signupsCompleted + awaitingSignup <= emailsSent
      });

      // BUSINESS CRITICAL: Validate the core math that must always be true
      if (emailsSent + emailsPending !== totalCreated) {
        console.error('StatsCalculator: CRITICAL - Basic math validation failed:', {
          emailsSent,
          emailsPending,
          totalCreated,
          sum: emailsSent + emailsPending,
          difference: Math.abs((emailsSent + emailsPending) - totalCreated)
        });
      }

      // BUSINESS CRITICAL: Check signup logic consistency  
      if (signupsCompleted + awaitingSignup > emailsSent) {
        console.error('StatsCalculator: CRITICAL - More signups than emails sent:', {
          signupsCompleted,
          awaitingSignup,
          sumSignups: signupsCompleted + awaitingSignup,
          emailsSent,
          difference: (signupsCompleted + awaitingSignup) - emailsSent
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

  // Enhanced debug method to identify specific data issues
  static async debugStatusDistribution(): Promise<void> {
    try {
      const { data: allInvitations, error } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed, email_sent_at, completed_at, send_attempts, invited_at');

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
        pendingEmailSend: allInvitations?.filter(inv => inv.email_sent === false && inv.signup_completed === false).length || 0,
        // CRITICAL: Identify impossible states
        impossibleStates: allInvitations?.filter(inv => inv.signup_completed === true && inv.email_sent === false).length || 0,
        missingSentTimestamp: allInvitations?.filter(inv => inv.email_sent === true && !inv.email_sent_at).length || 0,
        missingCompletedTimestamp: allInvitations?.filter(inv => inv.signup_completed === true && !inv.completed_at).length || 0
      };

      console.log('StatsCalculator: DETAILED data distribution:', distribution);
      
      // Verify all math relationships
      console.log('StatsCalculator: COMPREHENSIVE math verification:', {
        basicMath: {
          emailSentTrue_plus_emailSentFalse: distribution.emailSentTrue + distribution.emailSentFalse,
          total: distribution.total,
          isCorrect: (distribution.emailSentTrue + distribution.emailSentFalse) === distribution.total
        },
        signupMath: {
          signupsCompleted_plus_awaitingSignup: distribution.signupCompletedTrue + distribution.awaitingSignup,
          emailsSent: distribution.emailSentTrue,
          shouldBeEqual: distribution.signupCompletedTrue + distribution.awaitingSignup === distribution.emailSentTrue,
          difference: Math.abs((distribution.signupCompletedTrue + distribution.awaitingSignup) - distribution.emailSentTrue)
        },
        dataQuality: {
          impossibleStates: distribution.impossibleStates,
          missingSentTimestamp: distribution.missingSentTimestamp,
          missingCompletedTimestamp: distribution.missingCompletedTimestamp
        }
      });

      // Identify specific problematic records
      if (distribution.impossibleStates > 0) {
        const problematicRecords = allInvitations?.filter(inv => 
          inv.signup_completed === true && inv.email_sent === false
        ).slice(0, 5); // Show first 5 for debugging
        
        console.error('StatsCalculator: CRITICAL - Found impossible states (sample):', problematicRecords);
      }

    } catch (error) {
      console.error('StatsCalculator: Debug failed:', error);
    }
  }

  // New method to get the most accurate stats directly from database with corrected formulas
  static async getRealTimeStats(): Promise<UnifiedInvitationStats> {
    console.log('StatsCalculator: Getting real-time stats with corrected formulas (3,529 total)...');
    
    try {
      // Use corrected count queries excluding 'direct_signup' placeholders
      const [
        { count: totalCreated },
        { count: emailsSent },
        { count: emailsPending },
        { count: signupsCompleted },
        { count: awaitingSignup },
        knytResult,
        qryptoResult
      ] = await Promise.all([
        // Real invitations only (exclude direct_signup placeholders)
        supabase.from('invited_users').select('*', { count: 'exact', head: true })
          .or('batch_id.neq.direct_signup,batch_id.is.null'),
        supabase.from('invited_users').select('*', { count: 'exact', head: true })
          .or('batch_id.neq.direct_signup,batch_id.is.null')
          .eq('email_sent', true),
        supabase.from('invited_users').select('*', { count: 'exact', head: true })
          .or('batch_id.neq.direct_signup,batch_id.is.null')
          .eq('email_sent', false),
        supabase.from('invited_users').select('*', { count: 'exact', head: true })
          .or('batch_id.neq.direct_signup,batch_id.is.null')
          .eq('signup_completed', true),
        supabase.from('invited_users').select('*', { count: 'exact', head: true })
          .or('batch_id.neq.direct_signup,batch_id.is.null')
          .eq('email_sent', true)
          .eq('signup_completed', false),
        // Get actual persona counts for direct signups calculation
        supabase.from('knyt_personas').select('*', { count: 'exact', head: true }),
        supabase.from('qrypto_personas').select('*', { count: 'exact', head: true })
      ]);

      // Calculate true direct signups: total personas minus invited users who completed
      const totalPersonas = (knytResult.count || 0) + (qryptoResult.count || 0);
      const directSignupsCount = totalPersonas - (signupsCompleted || 0);

      const conversionRate = (emailsSent || 0) > 0 ? ((signupsCompleted || 0) / (emailsSent || 0)) * 100 : 0;

      const stats: UnifiedInvitationStats = {
        totalCreated: totalCreated || 0, // Should be 3,529
        emailsSent: emailsSent || 0,
        emailsPending: emailsPending || 0,
        signupsCompleted: signupsCompleted || 0,
        awaitingSignup: awaitingSignup || 0,
        directSignups: directSignupsCount || 0,
        conversionRate,
        lastUpdated: new Date().toISOString()
      };

      console.log('StatsCalculator: Corrected real-time stats:', stats);
      console.log('StatsCalculator: Persona breakdown:', {
        knytPersonas: knytResult.count || 0,
        qryptoPersonas: qryptoResult.count || 0,
        totalPersonas,
        invitedCompleted: signupsCompleted || 0,
        calculatedDirectSignups: directSignupsCount
      });
      
      return stats;
    } catch (error: any) {
      console.error('StatsCalculator: Real-time stats failed:', error);
      throw new Error(`Failed to get real-time stats: ${error.message}`);
    }
  }
}
