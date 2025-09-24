import { supabase } from '@/integrations/supabase/client';
import type { 
  InvitationData, 
  PendingInvitation, 
  DeduplicationStats, 
  BatchProgress,
  EmailBatch,
  InvitationStats,
  UserDetail
} from './invitation-service-types';

export type { 
  InvitationData, 
  PendingInvitation, 
  DeduplicationStats, 
  BatchProgress,
  EmailBatch,
  InvitationStats,
  UserDetail
};

class InvitationService {
  parseCSV(csvContent: string, personaType: 'knyt' | 'qripto'): { invitations: InvitationData[], stats: DeduplicationStats } {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const emailColumnIndex = headers.findIndex(h => 
      h.toLowerCase().includes('email') || h.toLowerCase() === 'e-mail'
    );

    if (emailColumnIndex === -1) {
      throw new Error('No email column found in CSV. Please ensure there is a column with "email" in the name.');
    }

    // Parse and deduplicate
    const emailMap = new Map<string, InvitationData>();
    const duplicatesFound: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;

      const email = values[emailColumnIndex]?.toLowerCase().trim();
      if (!email || !email.includes('@')) continue;

      const personaData: any = {};
      headers.forEach((header, index) => {
        if (values[index]) {
          // Handle array fields
          if (['Chain-IDs', 'Web3-Interests', 'Tokens-of-Interest', 'Wallets-of-Interest'].includes(header)) {
            personaData[header] = values[index].split(';').map(item => item.trim()).filter(item => item);
          } else {
            personaData[header] = values[index];
          }
        }
      });

      if (emailMap.has(email)) {
        duplicatesFound.push(email);
        // Merge data, keeping non-empty values
        const existing = emailMap.get(email)!;
        Object.keys(personaData).forEach(key => {
          if (personaData[key] && (!existing.personaData[key] || existing.personaData[key] === '')) {
            existing.personaData[key] = personaData[key];
          }
        });
      } else {
        emailMap.set(email, {
          email,
          personaType,
          personaData
        });
      }
    }

    const invitations = Array.from(emailMap.values());
    const stats: DeduplicationStats = {
      totalEntries: lines.length - 1,
      finalCount: invitations.length,
      duplicatesFound: duplicatesFound.length,
      mergedEmails: Array.from(new Set(duplicatesFound))
    };

    return { invitations, stats };
  }

  async createInvitations(
    invitations: InvitationData[],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<{ success: boolean; errors: string[] }> {
    const batchId = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errors: string[] = [];
    let processed = 0;
    let successful = 0;

    const updateProgress = () => {
      if (onProgress) {
        onProgress({
          batchId,
          totalEmails: invitations.length,
          emailsProcessed: processed,
          emailsSuccessful: successful,
          emailsFailed: processed - successful,
          errors,
          isComplete: processed === invitations.length
        });
      }
    };

    const BATCH_SIZE = 50;
    for (let i = 0; i < invitations.length; i += BATCH_SIZE) {
      const batch = invitations.slice(i, i + BATCH_SIZE);
      
      try {
        const { data, error } = await supabase
          .from('invited_users')
          .insert(
            batch.map(inv => ({
              email: inv.email,
              persona_type: inv.personaType,
              persona_data: inv.personaData,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }))
          )
          .select('email');

        if (error) {
          // Handle individual conflicts
          if (error.code === '23505') {
            for (const inv of batch) {
              try {
                const { error: singleError } = await supabase
                  .from('invited_users')
                  .insert({
                    email: inv.email,
                    persona_type: inv.personaType,
                    persona_data: inv.personaData,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  });

                if (singleError && singleError.code === '23505') {
                  errors.push(`Invitation already exists for ${inv.email}`);
                } else if (singleError) {
                  errors.push(`Error creating invitation for ${inv.email}: ${singleError.message}`);
                } else {
                  successful++;
                }
                processed++;
                updateProgress();
              } catch (err) {
                errors.push(`Unexpected error for ${inv.email}: ${err}`);
                processed++;
                updateProgress();
              }
            }
          } else {
            errors.push(`Batch error: ${error.message}`);
            processed += batch.length;
            updateProgress();
          }
        } else {
          successful += data?.length || 0;
          processed += batch.length;
          updateProgress();
        }
      } catch (err) {
        errors.push(`Unexpected batch error: ${err}`);
        processed += batch.length;
        updateProgress();
      }
    }

    const successMessage = `Successfully created ${successful} invitations`;
    if (successful > 0) {
      errors.unshift(successMessage);
    }

    return {
      success: successful > 0,
      errors
    };
  }

  async getInvitationStats(): Promise<InvitationStats> {
    const { data: allInvitations, error } = await supabase
      .from('invited_users')
      .select('email_sent, signup_completed');

    if (error) {
      console.error('Error fetching invitation stats:', error);
      throw new Error(`Failed to fetch invitation stats: ${error.message}`);
    }

    const totalCreated = allInvitations?.length || 0;
    const emailsSent = allInvitations?.filter(inv => inv.email_sent).length || 0;
    const emailsPending = allInvitations?.filter(inv => !inv.email_sent).length || 0;
    const signupsCompleted = allInvitations?.filter(inv => inv.signup_completed).length || 0;
    const awaitingSignup = allInvitations?.filter(inv => inv.email_sent && !inv.signup_completed).length || 0;
    const conversionRate = emailsSent > 0 ? (signupsCompleted / emailsSent) * 100 : 0;

    return {
      totalCreated,
      emailsSent,
      emailsPending,
      signupsCompleted,
      awaitingSignup,
      conversionRate
    };
  }

  async getInvitationByToken(token: string): Promise<any> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('*')
      .eq('invitation_token', token)
      .eq('signup_completed', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error fetching invitation by token:', error);
      return null;
    }

    return data;
  }

  async getUserDetails(category: string, searchTerm?: string): Promise<UserDetail[]> {
    let query = supabase
      .from('invited_users')
      .select(`
        id, 
        email, 
        persona_type, 
        invited_at, 
        email_sent, 
        email_sent_at, 
        signup_completed, 
        completed_at, 
        persona_data,
        batch_id,
        send_attempts
      `);

    // Apply category filters
    switch (category) {
      case 'totalCreated':
        // No additional filter needed - all invitations
        break;
      case 'emailsSent':
        query = query.eq('email_sent', true);
        break;
      case 'emailsPending':
        query = query.eq('email_sent', false);
        break;
      case 'signupsCompleted':
        query = query.eq('signup_completed', true);
        break;
      case 'awaitingSignup':
        query = query.eq('email_sent', true).eq('signup_completed', false);
        break;
    }

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,persona_data->>First-Name.ilike.%${searchTerm}%,persona_data->>Last-Name.ilike.%${searchTerm}%`);
    }

    query = query.order('invited_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user details:', error);
      throw new Error(`Failed to fetch user details: ${error.message}`);
    }

    // Transform the data to match UserDetail interface
    return (data || []).map(item => ({
      ...item,
      persona_data: item.persona_data as Record<string, any>
    }));
  }

  async getUserDetailWithBlakQube(userId: string): Promise<UserDetail | null> {
    // First get the invitation data
    const { data: invitation, error: invError } = await supabase
      .from('invited_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (invError) {
      console.error('Error fetching invitation:', invError);
      return null;
    }

    let personaData = null;
    let userAuthId = null;

    // If user has signed up, try to get their current persona data
    if (invitation.signup_completed) {
      console.log('User has signed up, fetching current persona data for:', invitation.email, 'type:', invitation.persona_type);
      
      // Try to find user in the appropriate persona table based on invitation type
      if (invitation.persona_type === 'knyt') {
        const { data: knyvData, error: knytError } = await supabase
          .from('knyt_personas')
          .select('user_id, *')
          .eq('Email', invitation.email)
          .maybeSingle();

        if (!knytError && knyvData) {
          userAuthId = knyvData.user_id;
          personaData = knyvData;
          console.log('Found KNYT persona data:', knyvData);
        }
      } else {
        const { data: qryptoData, error: qryptoError } = await supabase
          .from('qripto_personas')
          .select('user_id, *')
          .eq('Email', invitation.email)
          .maybeSingle();

        if (!qryptoError && qryptoData) {
          userAuthId = qryptoData.user_id;
          personaData = qryptoData;
          console.log('Found Qrypto persona data:', qryptoData);
        }
      }
    }

    return {
      ...invitation,
      persona_data: invitation.persona_data as Record<string, any>,
      blak_qube_data: personaData, // This is now the current persona data, not legacy blak_qube
      user_id: userAuthId
    };
  }

  async getPendingEmailSend(limit?: number): Promise<PendingInvitation[]> {
    let query = supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', false)
      .eq('signup_completed', false)
      .gte('expires_at', new Date().toISOString())
      .order('invited_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pending email send:', error);
      throw new Error(`Failed to fetch pending email send: ${error.message}`);
    }

    return data || [];
  }

  async getEmailsSent(): Promise<PendingInvitation[]> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts, signup_completed')
      .eq('email_sent', true)
      .order('email_sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent emails:', error);
      throw new Error(`Failed to fetch sent emails: ${error.message}`);
    }

    return data || [];
  }

  async getAwaitingSignup(): Promise<PendingInvitation[]> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('email_sent', true)
      .eq('signup_completed', false)
      .gte('expires_at', new Date().toISOString())
      .order('email_sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching awaiting signup:', error);
      throw new Error(`Failed to fetch awaiting signup: ${error.message}`);
    }

    return data || [];
  }

  async getEmailBatches(): Promise<EmailBatch[]> {
    const { data, error } = await supabase
      .from('email_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email batches:', error);
      throw new Error(`Failed to fetch email batches: ${error.message}`);
    }

    return (data || []).map(batch => ({
      ...batch,
      status: batch.status as 'pending' | 'in_progress' | 'completed' | 'failed'
    }));
  }

  async createEmailBatch(emails: string[]): Promise<string> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error: batchError } = await supabase
      .from('email_batches')
      .insert({
        batch_id: batchId,
        total_emails: emails.length,
        status: 'pending'
      });

    if (batchError) {
      console.error('Error creating email batch:', batchError);
      throw new Error(`Failed to create email batch: ${batchError.message}`);
    }

    // Update invited_users with batch_id
    const { error: updateError } = await supabase
      .from('invited_users')
      .update({ batch_id: batchId })
      .in('email', emails)
      .eq('email_sent', false);

    if (updateError) {
      console.error('Error updating invitations with batch_id:', updateError);
      throw new Error(`Failed to update invitations with batch_id: ${updateError.message}`);
    }

    return batchId;
  }

  async sendInvitationEmails(emails: string[], testMode: boolean = false): Promise<{ success: boolean; errors: string[]; batchId?: string }> {
    try {
      // Create batch for tracking
      const batchId = await this.createEmailBatch(emails);

      // Update batch status to in_progress
      await supabase
        .from('email_batches')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('batch_id', batchId);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-invitations', {
        body: { emails, testMode, batchId }
      });

      if (error) {
        // Update batch status to failed
        await supabase
          .from('email_batches')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('batch_id', batchId);

        throw error;
      }

      // Update batch with final results
      await supabase
        .from('email_batches')
        .update({ 
          status: data.success ? 'completed' : 'failed',
          emails_sent: data.sent || 0,
          emails_failed: (data.total || 0) - (data.sent || 0),
          completed_at: new Date().toISOString()
        })
        .eq('batch_id', batchId);

      return { 
        success: data.success, 
        errors: data.errors || [], 
        batchId 
      };
    } catch (error: any) {
      console.error('Error sending invitation emails:', error);
      return { 
        success: false, 
        errors: [`Failed to send emails: ${error.message}`] 
      };
    }
  }

  async getPendingInvitations(): Promise<PendingInvitation[]> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('signup_completed', false)
      .gte('expires_at', new Date().toISOString())
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending invitations:', error);
      throw new Error(`Failed to fetch pending invitations: ${error.message}`);
    }

    return data || [];
  }

  async getCompletedInvitations(): Promise<PendingInvitation[]> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('id, email, persona_type, invited_at, email_sent, email_sent_at, batch_id, send_attempts')
      .eq('signup_completed', true)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed invitations:', error);
      throw new Error(`Failed to fetch completed invitations: ${error.message}`);
    }

    return data || [];
  }
}

export const invitationService = new InvitationService();
