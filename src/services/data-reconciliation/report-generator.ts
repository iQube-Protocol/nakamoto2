
import { supabase } from '@/integrations/supabase/client';
import { ReconciliationReport, DuplicateEmailRecord } from './types';

export class ReportGenerator {
  async getReconciliationReport(): Promise<ReconciliationReport> {
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

  async findDuplicateEmails(): Promise<DuplicateEmailRecord[]> {
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
