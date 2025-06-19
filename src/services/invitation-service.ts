
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

export interface DeduplicationStats {
  totalEntries: number;
  duplicatesFound: number;
  finalCount: number;
  mergedEmails: string[];
}

class InvitationService {
  // Create multiple invitations from CSV data
  async createInvitations(invitations: InvitationData[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const validInvitations: any[] = [];
    const skippedEmails: string[] = [];

    // First, check which emails already exist in the database
    const emails = invitations.map(inv => inv.email.toLowerCase().trim());
    const { data: existingInvitations } = await supabase
      .from('invited_users')
      .select('email')
      .in('email', emails);

    const existingEmails = new Set(existingInvitations?.map(inv => inv.email) || []);

    // Validate and prepare invitation records
    for (const invitation of invitations) {
      const email = invitation.email.toLowerCase().trim();

      if (!invitation.email || !invitation.email.includes('@')) {
        errors.push(`Invalid email: ${invitation.email}`);
        continue;
      }

      if (!invitation.personaType || !['knyt', 'qrypto'].includes(invitation.personaType)) {
        errors.push(`Invalid persona type for ${invitation.email}: ${invitation.personaType}`);
        continue;
      }

      // Skip emails that already exist in the database
      if (existingEmails.has(email)) {
        skippedEmails.push(email);
        continue;
      }

      validInvitations.push({
        email: email,
        persona_type: invitation.personaType,
        persona_data: invitation.personaData,
        invited_by: invitation.invitedBy || 'system'
      });
    }

    // Report skipped emails
    if (skippedEmails.length > 0) {
      errors.push(`Skipped ${skippedEmails.length} emails that already have invitations: ${skippedEmails.slice(0, 5).join(', ')}${skippedEmails.length > 5 ? '...' : ''}`);
    }

    if (validInvitations.length === 0) {
      if (skippedEmails.length > 0) {
        return { success: true, errors: [`All ${invitations.length} emails already have invitations - no new invitations created`] };
      }
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
      
      // Include both success and warning messages
      const successMessages = [`Successfully created ${validInvitations.length} new invitations`];
      if (skippedEmails.length > 0) {
        successMessages.push(`Skipped ${skippedEmails.length} existing emails`);
      }
      
      return { success: true, errors: successMessages };
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

  // Parse CSV content into invitation data with deduplication
  parseCSV(csvContent: string, personaType: 'knyt' | 'qrypto'): { invitations: InvitationData[]; stats: DeduplicationStats } {
    console.log('Starting CSV parsing with content:', csvContent.substring(0, 200));
    
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = this.parseCSVLine(lines[0]);
    const rawInvitations: InvitationData[] = [];

    console.log('Parsed headers:', headers);

    // First pass: parse all entries
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: column count mismatch (${values.length} vs ${headers.length})`);
        continue;
      }

      const personaData: Record<string, any> = {};
      let email = '';

      headers.forEach((header, index) => {
        const value = values[index];
        
        if (header.toLowerCase().includes('email') || header.toLowerCase() === 'e-mail') {
          email = value;
        }
        
        if (['Chain-IDs', 'Web3-Interests', 'Tokens-of-Interest', 'Wallets-of-Interest'].includes(header)) {
          personaData[header] = value ? value.split(';').map(v => v.trim()).filter(v => v) : [];
        } else {
          personaData[header] = value || '';
        }
      });

      if (email && email.includes('@')) {
        rawInvitations.push({
          email: email.toLowerCase().trim(),
          personaType,
          personaData
        });
      }
    }

    // Second pass: deduplicate and merge
    const { deduplicatedInvitations, stats } = this.deduplicateInvitations(rawInvitations);

    console.log(`Deduplication complete: ${stats.totalEntries} -> ${stats.finalCount} entries`);
    return { invitations: deduplicatedInvitations, stats };
  }

  // Deduplicate invitations and merge duplicate entries
  private deduplicateInvitations(invitations: InvitationData[]): { deduplicatedInvitations: InvitationData[]; stats: DeduplicationStats } {
    const emailGroups = new Map<string, InvitationData[]>();
    const mergedEmails: string[] = [];

    // Group by email
    invitations.forEach(invitation => {
      const email = invitation.email;
      if (!emailGroups.has(email)) {
        emailGroups.set(email, []);
      }
      emailGroups.get(email)!.push(invitation);
    });

    const deduplicatedInvitations: InvitationData[] = [];

    // Process each email group
    emailGroups.forEach((group, email) => {
      if (group.length > 1) {
        mergedEmails.push(email);
        console.log(`Merging ${group.length} entries for email: ${email}`);
      }

      const mergedInvitation = this.mergeInvitationGroup(group);
      deduplicatedInvitations.push(mergedInvitation);
    });

    const stats: DeduplicationStats = {
      totalEntries: invitations.length,
      duplicatesFound: invitations.length - deduplicatedInvitations.length,
      finalCount: deduplicatedInvitations.length,
      mergedEmails
    };

    return { deduplicatedInvitations, stats };
  }

  // Merge multiple invitation entries for the same email
  private mergeInvitationGroup(group: InvitationData[]): InvitationData {
    if (group.length === 1) {
      return group[0];
    }

    const merged = {
      email: group[0].email,
      personaType: group[0].personaType,
      personaData: {},
      invitedBy: group[0].invitedBy
    };

    // Get all unique keys from all entries
    const allKeys = new Set<string>();
    group.forEach(invitation => {
      Object.keys(invitation.personaData).forEach(key => allKeys.add(key));
    });

    // Merge each field according to its type and importance
    allKeys.forEach(key => {
      merged.personaData[key] = this.mergeField(key, group.map(inv => inv.personaData[key]));
    });

    return merged;
  }

  // Merge individual fields based on their type and business logic
  private mergeField(fieldName: string, values: any[]): any {
    const nonEmptyValues = values.filter(v => v !== undefined && v !== null && v !== '');

    if (nonEmptyValues.length === 0) {
      return '';
    }

    // Numeric fields that should be summed
    const sumFields = ['Total-Invested', 'Metaiye-Shares-Owned', 'KNYT-COYN-Owned', 
                      'Motion-Comics-Owned', 'Paper-Comics-Owned', 'Digital-Comics-Owned',
                      'KNYT-Posters-Owned', 'KNYT-Cards-Owned'];
    
    if (sumFields.includes(fieldName)) {
      return this.sumNumericValues(nonEmptyValues);
    }

    // Date fields - use earliest date
    if (fieldName === 'OM-Member-Since') {
      return this.getEarliestDate(nonEmptyValues);
    }

    // Array fields - merge and deduplicate
    const arrayFields = ['Chain-IDs', 'Web3-Interests', 'Tokens-of-Interest', 'Wallets-of-Interest'];
    if (arrayFields.includes(fieldName)) {
      return this.mergeArrays(nonEmptyValues);
    }

    // For other fields, use the first non-empty value
    return nonEmptyValues[0];
  }

  // Sum numeric values (handle currency formatting)
  private sumNumericValues(values: any[]): string {
    let total = 0;
    let hasValues = false;

    values.forEach(value => {
      if (typeof value === 'string' && value.trim()) {
        // Remove currency symbols and commas
        const numericValue = parseFloat(value.replace(/[$,]/g, ''));
        if (!isNaN(numericValue)) {
          total += numericValue;
          hasValues = true;
        }
      } else if (typeof value === 'number') {
        total += value;
        hasValues = true;
      }
    });

    if (!hasValues) {
      return '';
    }

    // Format back as currency if it looks like a monetary value
    const firstValue = values[0]?.toString() || '';
    if (firstValue.includes('$')) {
      return `$${total.toLocaleString()}`;
    }

    return total.toString();
  }

  // Get the earliest date from date strings
  private getEarliestDate(values: any[]): string {
    const dates = values
      .filter(v => v && typeof v === 'string')
      .map(dateStr => {
        // Try to parse various date formats
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      })
      .filter(d => d !== null);

    if (dates.length === 0) {
      return values[0] || '';
    }

    const earliestDate = new Date(Math.min(...dates.map(d => d!.getTime())));
    
    // Return in the same format as the original (try to preserve format)
    const originalFormat = values.find(v => {
      const date = new Date(v);
      return !isNaN(date.getTime()) && date.getTime() === earliestDate.getTime();
    });

    return originalFormat || earliestDate.toLocaleDateString();
  }

  // Merge and deduplicate arrays
  private mergeArrays(values: any[]): string[] {
    const merged = new Set<string>();

    values.forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'string' && item.trim()) {
            merged.add(item.trim());
          }
        });
      } else if (value && typeof value === 'string') {
        // Handle comma or semicolon separated values
        value.split(/[,;]/).forEach(item => {
          if (item && item.trim()) {
            merged.add(item.trim());
          }
        });
      }
    });

    return Array.from(merged);
  }

  // Parse CSV line handling quoted values
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
