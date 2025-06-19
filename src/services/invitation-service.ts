
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
    console.log('Starting CSV parsing with content:', csvContent.substring(0, 200));
    
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // More flexible CSV parsing to handle different formats
    const headers = this.parseCSVLine(lines[0]);
    const invitations: InvitationData[] = [];

    console.log('Parsed headers:', headers);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = this.parseCSVLine(line);
      
      console.log(`Processing row ${i}: ${values.length} values vs ${headers.length} headers`);
      
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: column count mismatch (${values.length} vs ${headers.length})`);
        continue;
      }

      const personaData: Record<string, any> = {};
      let email = '';

      // Map CSV columns to persona data
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Find email field - be more flexible with column names
        if (header.toLowerCase().includes('email') || header.toLowerCase() === 'e-mail') {
          email = value;
        }
        
        // Handle array fields for specific columns
        if (['Chain-IDs', 'Web3-Interests', 'Tokens-of-Interest', 'Wallets-of-Interest'].includes(header)) {
          personaData[header] = value ? value.split(';').map(v => v.trim()).filter(v => v) : [];
        } else {
          personaData[header] = value || '';
        }
      });

      if (email && email.includes('@')) {
        invitations.push({
          email: email.toLowerCase().trim(),
          personaType,
          personaData
        });
        console.log(`Added invitation for: ${email}`);
      } else {
        console.warn(`Skipping row ${i + 1}: no valid email found (got: "${email}")`);
      }
    }

    console.log(`Parsed ${invitations.length} invitations from CSV`);
    return invitations;
  }

  // Helper method to parse CSV line handling quoted values
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
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
