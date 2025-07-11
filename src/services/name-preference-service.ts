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

  static async processLinkedInNames(userId: string, firstName: string, lastName: string): Promise<void> {
    console.log('🏷️ Processing LinkedIn names for user:', userId);
    console.log('📝 LinkedIn names:', { firstName, lastName });
    
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LinkedIn name processing timeout')), 5000)
      );

      const processingPromise = this.doProcessLinkedInNames(userId, firstName, lastName);
      
      await Promise.race([processingPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('❌ Error processing LinkedIn names:', error);
      // Don't throw - this is now called asynchronously and shouldn't block OAuth
    }
  }

  private static async doProcessLinkedInNames(userId: string, firstName: string, lastName: string): Promise<void> {
    // Get or create name preferences
    let namePrefs = await this.getNamePreferences(userId);
    
    if (!namePrefs) {
      console.log('💡 Creating new name preferences for LinkedIn connection');
      // Create new preferences with LinkedIn data
      namePrefs = await this.createNamePreferences(userId, {
        linkedin_first_name: firstName,
        linkedin_last_name: lastName,
        name_source: 'linkedin'
      });
      
      if (namePrefs) {
        console.log('✅ Created name preferences with LinkedIn data');
        await this.updatePersonaNames(userId, namePrefs);
      }
      return;
    }
    
    console.log('📋 Current name preferences:', namePrefs);
    
    // Update LinkedIn fields
    const updatedPrefs = {
      ...namePrefs,
      linkedin_first_name: firstName,
      linkedin_last_name: lastName
    };
    
    // Simplified logic for source switching
    if (namePrefs.name_source === 'linkedin') {
      updatedPrefs.name_source = 'linkedin';
      console.log('💡 Using LinkedIn as name source');
    } else {
      console.log('🛡️ Preserving existing name source:', namePrefs.name_source);
    }
    
    // Update preferences in database
    await this.updateNamePreferences(userId, updatedPrefs);
    
    // Update persona names if LinkedIn is the source
    if (updatedPrefs.name_source === 'linkedin') {
      await this.updatePersonaNames(userId, updatedPrefs);
      console.log('✅ Updated persona names with LinkedIn data');
    }
  }

  static async getNamePreferences(userId: string): Promise<NamePreference | null> {
    const { data, error } = await supabase
      .from('user_name_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching name preferences:', error);
      return null;
    }

    return data as NamePreference | null;
  }

  static async createNamePreferences(userId: string, preferences: Partial<NamePreference>): Promise<NamePreference | null> {
    const { data, error } = await supabase
      .from('user_name_preferences')
      .insert({
        user_id: userId,
        persona_type: 'knyt' as const, // Default to knyt for now
        name_source: 'linkedin' as const, // Default source
        ...preferences
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating name preferences:', error);
      return null;
    }

    return data as NamePreference;
  }

  static async updateNamePreferences(userId: string, preferences: Partial<NamePreference>): Promise<void> {
    const updateData = {
      user_id: userId,
      persona_type: preferences.persona_type || 'knyt' as const,
      name_source: preferences.name_source || 'linkedin' as const,
      custom_first_name: preferences.custom_first_name,
      custom_last_name: preferences.custom_last_name,
      linkedin_first_name: preferences.linkedin_first_name,
      linkedin_last_name: preferences.linkedin_last_name,
      invitation_first_name: preferences.invitation_first_name,
      invitation_last_name: preferences.invitation_last_name,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_name_preferences')
      .upsert(updateData);

    if (error) {
      console.error('Error updating name preferences:', error);
      throw error;
    }
  }

  static async updatePersonaNames(userId: string, preferences: NamePreference): Promise<void> {
    const firstName = this.getEffectiveName(preferences);
    const lastName = preferences.name_source === 'custom' ? preferences.custom_last_name :
                    preferences.name_source === 'linkedin' ? preferences.linkedin_last_name :
                    preferences.invitation_last_name;

    // Update both persona types for compatibility
    await Promise.all([
      supabase
        .from('knyt_personas')
        .update({
          'First-Name': firstName || '',
          'Last-Name': lastName || ''
        })
        .eq('user_id', userId),
      
      supabase
        .from('qrypto_personas')
        .update({
          'First-Name': firstName || '',
          'Last-Name': lastName || ''
        })
        .eq('user_id', userId)
    ]);
  }
}