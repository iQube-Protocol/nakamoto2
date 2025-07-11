import { supabase } from "@/integrations/supabase/client";

export interface NamePreference {
  id: string;
  user_id: string;
  persona_type: 'knyt' | 'qrypto' | 'blak';
  name_source: 'invitation' | 'linkedin' | 'custom';
  custom_first_name?: string;
  custom_last_name?: string;
  linkedin_first_name?: string;
  linkedin_last_name?: string;
  invitation_first_name?: string;
  invitation_last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface NameConflictData {
  personaType: 'knyt' | 'qrypto' | 'blak';
  invitationName?: { firstName?: string; lastName?: string };
  linkedinName?: { firstName?: string; lastName?: string };
  currentName?: { firstName?: string; lastName?: string };
}

export class NamePreferenceService {
  static async getNamePreference(personaType: 'knyt' | 'qrypto' | 'blak'): Promise<NamePreference | null> {
    const { data, error } = await supabase
      .from('user_name_preferences')
      .select('*')
      .eq('persona_type', personaType)
      .maybeSingle();

    if (error) {
      console.error('Error fetching name preference:', error);
      return null;
    }

    return data as NamePreference | null;
  }

  static async saveNamePreference(preference: Partial<NamePreference>): Promise<boolean> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    const { error } = await supabase
      .from('user_name_preferences')
      .upsert({
        user_id: user.id,
        persona_type: preference.persona_type!,
        name_source: preference.name_source!,
        custom_first_name: preference.custom_first_name,
        custom_last_name: preference.custom_last_name,
        linkedin_first_name: preference.linkedin_first_name,
        linkedin_last_name: preference.linkedin_last_name,
        invitation_first_name: preference.invitation_first_name,
        invitation_last_name: preference.invitation_last_name,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving name preference:', error);
      return false;
    }

    return true;
  }

  static async detectNameConflict(
    personaType: 'knyt' | 'qrypto' | 'blak',
    linkedinData: { firstName?: string; lastName?: string },
    invitationData?: { firstName?: string; lastName?: string },
    currentData?: { firstName?: string; lastName?: string }
  ): Promise<NameConflictData | null> {
    // For KNYT personas, check if LinkedIn data conflicts with invitation data
    if (personaType === 'knyt' && invitationData) {
      const hasConflict = 
        (linkedinData.firstName && invitationData.firstName && linkedinData.firstName !== invitationData.firstName) ||
        (linkedinData.lastName && invitationData.lastName && linkedinData.lastName !== invitationData.lastName);

      if (hasConflict) {
        return {
          personaType,
          invitationName: invitationData,
          linkedinName: linkedinData,
          currentName: currentData,
        };
      }
    }

    return null;
  }

  static async getInvitationData(email: string): Promise<{ firstName?: string; lastName?: string } | null> {
    const { data, error } = await supabase
      .from('invited_users')
      .select('persona_data')
      .eq('email', email)
      .eq('signup_completed', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      firstName: data.persona_data?.['First-Name'],
      lastName: data.persona_data?.['Last-Name'],
    };
  }

  /**
   * Get the effective first name based on name preference
   */
  static getEffectiveName(preference: NamePreference): string {
    switch (preference.name_source) {
      case 'custom':
        return preference.custom_first_name || '';
      case 'linkedin':
        return preference.linkedin_first_name || '';
      case 'invitation':
        return preference.invitation_first_name || '';
      default:
        return '';
    }
  }
}