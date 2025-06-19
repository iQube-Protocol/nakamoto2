
import { supabase } from '@/integrations/supabase/client';

export interface InvitationData {
  email: string;
  personaType: 'knyt' | 'qrypto';
  personaData: Record<string, any>;
  invitedBy?: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  expires_at: string;
  signup_completed: boolean;
  invitation_token: string;
}

class InvitationService {
  // Create multiple invitations from CSV data
  async createInvitations(invitations: InvitationData[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const validInvitations: any[] = [];

    // Validate and prepare invitation records
    for (const invitation of invitations) {
      if (!invitation.email || !invitation.email.includes('@')) {
        errors.push(`Invalid email: ${invitation.email}`);
        continue;
      }

      if (!invitation.personaType || !['knyt', 'qrypto'].includes(invitation.personaType)) {
        errors.push(`Invalid persona type for ${invitation.email}: ${invitation.personaType}`);
        continue;
      }

      validInvitations.push({
        email: invitation.email.toLowerCase().trim(),
        persona_type: invitation.personaType,
        persona_data: invitation.personaData,
        invited_by: invitation.invitedBy || 'system'
      });
    }

    if (validInvitations.length === 0) {
      return { success: false, errors: ['No valid invitations to create'] };
    }

    try {
      const { error } = await supabase
        .from('invited_users')
        .insert(validInvitations);

      if (error) {
        console.error('Error creating invitations:', error);
        return { success: false, errors: [`Database error: ${error.message}`] };
      }

      console.log(`Successfully created ${validInvitations.length} invitations`);
      return { success: true, errors };
    } catch (error) {
      console.error('Unexpected error creating invitations:', error);
      return { success: false, errors: [`Unexpected error: ${error}`] };
    }
  }

  // Get pending invitations
  async getPendingInvitations(): Promise<PendingInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, expires_at, signup_completed, invitation_token')
        .eq('signup_completed', false)
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching invitations:', error);
      return [];
    }
  }

  // Get completed invitations
  async getCompletedInvitations(): Promise<PendingInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, expires_at, signup_completed, invitation_token')
        .eq('signup_completed', true)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching completed invitations:', error);
      return [];
    }
  }

  // Send invitation emails (calls edge function)
  async sendInvitationEmails(emails: string[]): Promise<{ success: boolean; errors: string[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitations', {
        body: { emails }
      });

      if (error) {
        console.error('Error sending invitation emails:', error);
        return { success: false, errors: [error.message] };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error sending emails:', error);
      return { success: false, errors: [`Unexpected error: ${error}`] };
    }
  }

  // Parse CSV content into invitation data
  parseCSV(csvContent: string, personaType: 'knyt' | 'qrypto'): InvitationData[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const invitations: InvitationData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: column count mismatch`);
        continue;
      }

      const personaData: Record<string, any> = {};
      let email = '';

      // Map CSV columns to persona data
      headers.forEach((header, index) => {
        const value = values[index];
        
        if (header.toLowerCase().includes('email')) {
          email = value;
        }
        
        // Handle array fields
        if (['Chain-IDs', 'Web3-Interests', 'Tokens-of-Interest', 'Wallets-of-Interest'].includes(header)) {
          personaData[header] = value ? value.split(';').map(v => v.trim()) : [];
        } else {
          personaData[header] = value || '';
        }
      });

      if (email) {
        invitations.push({
          email,
          personaType,
          personaData
        });
      }
    }

    return invitations;
  }

  // Get invitation by token (for signup flow)
  async getInvitationByToken(token: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('invited_users')
        .select('*')
        .eq('invitation_token', token)
        .eq('signup_completed', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Error fetching invitation by token:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching invitation:', error);
      return null;
    }
  }
}

export const invitationService = new InvitationService();
