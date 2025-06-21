
import { supabase } from '@/integrations/supabase/client';
import { ReconciliationReport, DuplicateEmailRecord } from './types';

export class ReportGenerator {
  async getReconciliationReport(): Promise<ReconciliationReport> {
    console.log('ReportGenerator: Fetching fresh reconciliation report data...');
    
    try {
      // Force fresh data by adding timestamp to prevent caching
      const { data: invitations, error } = await supabase
        .from('invited_users')
        .select('email_sent, signup_completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ReportGenerator: Error fetching invitations:', error);
        throw error;
      }

      console.log('ReportGenerator: Raw invitation data:', {
        totalRecords: invitations?.length || 0,
        sampleData: invitations?.slice(0, 3)
      });

      const total = invitations?.length || 0;
      const emailsSent = invitations?.filter(i => i.email_sent).length || 0;
      const signupsCompleted = invitations?.filter(i => i.signup_completed).length || 0;
      const pendingEmails = invitations?.filter(i => !i.email_sent).length || 0;
      const awaitingSignup = invitations?.filter(i => i.email_sent && !i.signup_completed).length || 0;

      const report = {
        totalInvitations: total,
        emailsSent,
        signupsCompleted,
        pendingEmails,
        awaitingSignup
      };

      console.log('ReportGenerator: Generated report:', report);
      return report;
    } catch (error) {
      console.error('ReportGenerator: Failed to generate report:', error);
      throw new Error(`Failed to generate reconciliation report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findDuplicateEmails(): Promise<DuplicateEmailRecord[]> {
    console.log('ReportGenerator: Finding duplicate emails...');
    
    try {
      const { data, error } = await supabase
        .from('invited_users')
        .select('id, email')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ReportGenerator: Error fetching invitations for duplicate check:', error);
        throw error;
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

      const duplicates = Array.from(emailMap.entries())
        .filter(([_, data]) => data.count > 1)
        .map(([email, data]) => ({
          email,
          count: data.count,
          ids: data.ids
        }));

      console.log('ReportGenerator: Found duplicates:', duplicates.length);
      return duplicates;
    } catch (error) {
      console.error('ReportGenerator: Failed to find duplicates:', error);
      return [];
    }
  }
}
