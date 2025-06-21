
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedInvitationStats } from './types';

export class StatsCalculator {
  static async calculateUnifiedStats(): Promise<UnifiedInvitationStats> {
    console.log('StatsCalculator: Calculating unified stats...');
    
    try {
      // Get all invitation data in one query
      const { data: allInvitations, error } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed, invited_at')
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('StatsCalculator: Error fetching invitations:', error);
        throw error;
      }

      const totalCreated = allInvitations?.length || 0;
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
      return stats;
    } catch (error) {
      console.error('StatsCalculator: Failed to calculate stats:', error);
      throw new Error(`Failed to get invitation stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
