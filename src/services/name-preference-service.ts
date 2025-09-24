import { supabase } from "@/integrations/supabase/client";

export interface NamePreference {
  id: string;
  user_id: string;
  persona_type: 'knyt' | 'qripto' | 'blak';
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
  personaType: 'knyt' | 'qripto' | 'blak';
  invitationName?: { firstName?: string; lastName?: string };
  linkedinName?: { firstName?: string; lastName?: string };
  currentName?: { firstName?: string; lastName?: string };
}

export class NamePreferenceService {
  static async getNamePreference(personaType: 'knyt' | 'qripto' | 'blak'): Promise<NamePreference | null> {
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

  static async saveNamePreference(preference: Partial<NamePreference>): Promise<{ success: boolean; error?: string }> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // First check if preference exists
      const existingPref = await this.getNamePreference(preference.persona_type!);
      
      if (existingPref) {
        // Update existing preference
        const { error } = await supabase
          .from('user_name_preferences')
          .update({
            name_source: preference.name_source!,
            custom_first_name: preference.custom_first_name || null,
            custom_last_name: preference.custom_last_name || null,
            linkedin_first_name: preference.linkedin_first_name || null,
            linkedin_last_name: preference.linkedin_last_name || null,
            invitation_first_name: preference.invitation_first_name || null,
            invitation_last_name: preference.invitation_last_name || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('persona_type', preference.persona_type!);

        if (error) {
          console.error('Error updating name preference:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Create new preference
        const { error } = await supabase
          .from('user_name_preferences')
          .insert({
            user_id: user.id,
            persona_type: preference.persona_type!,
            name_source: preference.name_source!,
            custom_first_name: preference.custom_first_name || null,
            custom_last_name: preference.custom_last_name || null,
            linkedin_first_name: preference.linkedin_first_name || null,
            linkedin_last_name: preference.linkedin_last_name || null,
            invitation_first_name: preference.invitation_first_name || null,
            invitation_last_name: preference.invitation_last_name || null,
          });

        if (error) {
          console.error('Error creating name preference:', error);
          return { success: false, error: error.message };
        }
      }

      // Update the corresponding persona table
      const updatedPreference = { ...preference, user_id: user.id } as NamePreference;
      await this.updatePersonaNames(user.id, updatedPreference);

      console.log('✅ Successfully saved name preference for', preference.persona_type);
      return { success: true };
    } catch (error: any) {
      console.error('Error saving name preference:', error);
      return { success: false, error: error.message };
    }
  }

  static async detectNameConflict(
    personaType: 'knyt' | 'qripto' | 'blak',
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

    // For Qrypto personas, only show conflict if user wants to override LinkedIn with custom/invitation
    if (personaType === 'qripto' && linkedinData) {
      // Always provide the option to change, but default to LinkedIn
      return {
        personaType,
        invitationName: invitationData,
        linkedinName: linkedinData,
        currentName: currentData,
      };
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
    console.log('🏷️ Processing LinkedIn names for user:', userId);
    
    // Check which personas exist for this user
    const [knytResult, qryptoResult] = await Promise.all([
      supabase.from('knyt_personas').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('qripto_personas').select('id').eq('user_id', userId).maybeSingle()
    ]);

    // Process each persona type separately
    if (knytResult.data) {
      await this.processLinkedInForPersona(userId, 'knyt', firstName, lastName);
    }
    
    if (qryptoResult.data) {
      await this.processLinkedInForPersona(userId, 'qripto', firstName, lastName);
    }
  }

  private static async processLinkedInForPersona(
    userId: string, 
    personaType: 'knyt' | 'qripto', 
    firstName: string, 
    lastName: string
  ): Promise<void> {
    console.log(`🏷️ Processing LinkedIn names for ${personaType} persona`);
    
    // Get existing name preference for this persona type
    let namePrefs = await this.getNamePreference(personaType);
    
    if (!namePrefs) {
      console.log(`💡 Creating new name preferences for ${personaType} persona`);
      
      // For KNYT: default to invitation source, store LinkedIn data
      // For Qrypto: default to LinkedIn source, apply automatically
      const defaultSource = personaType === 'knyt' ? 'invitation' : 'linkedin';
      
      namePrefs = await this.createNamePreferences(userId, {
        persona_type: personaType,
        linkedin_first_name: firstName,
        linkedin_last_name: lastName,
        name_source: defaultSource
      });
      
      if (namePrefs) {
        console.log(`✅ Created ${personaType} name preferences with source: ${defaultSource}`);
        // Only update persona names for Qrypto (which defaults to linkedin)
        // For KNYT, names should come from invitation data
        if (personaType === 'qripto') {
          await this.updatePersonaNames(userId, namePrefs);
        }
      }
      return;
    }
    
    console.log(`📋 Current ${personaType} name preferences:`, namePrefs);
    
    // Update LinkedIn fields in existing preference
    const updatedPrefs = {
      ...namePrefs,
      linkedin_first_name: firstName,
      linkedin_last_name: lastName
    };
    
    // For KNYT: preserve existing source, DO NOT update persona names automatically
    // For Qrypto: switch to LinkedIn source and update names
    if (personaType === 'qripto' && namePrefs.name_source !== 'custom') {
      updatedPrefs.name_source = 'linkedin';
      console.log(`💡 ${personaType}: Switching to LinkedIn as name source`);
      
      // Update preferences in database
      await this.updateNamePreferences(userId, updatedPrefs);
      
      // Update persona names for Qrypto
      await this.updatePersonaNames(userId, updatedPrefs);
      console.log(`✅ Updated ${personaType} persona names`);
    } else if (personaType === 'knyt') {
      // Keep existing source for KNYT - only store LinkedIn data, don't apply it
      console.log(`🛡️ ${personaType}: Preserving existing name source: ${namePrefs.name_source}, storing LinkedIn data`);
      
      // Update preferences in database (but don't update persona names)
      await this.updateNamePreferences(userId, updatedPrefs);
      console.log(`✅ Stored LinkedIn data for ${personaType} but preserved existing names`);
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
    // Determine default name source based on persona type
    const defaultSource: 'invitation' | 'linkedin' = preferences.persona_type === 'qripto' ? 'linkedin' : 'invitation';
    const defaultPersonaType: 'knyt' | 'qripto' = 'knyt';
    
    const { data, error } = await supabase
      .from('user_name_preferences')
      .insert({
        user_id: userId,
        persona_type: preferences.persona_type || defaultPersonaType,
        name_source: preferences.name_source || defaultSource,
        custom_first_name: preferences.custom_first_name || null,
        custom_last_name: preferences.custom_last_name || null,
        linkedin_first_name: preferences.linkedin_first_name || null,
        linkedin_last_name: preferences.linkedin_last_name || null,
        invitation_first_name: preferences.invitation_first_name || null,
        invitation_last_name: preferences.invitation_last_name || null,
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
    const defaultPersonaType: 'knyt' | 'qripto' = 'knyt';
    const defaultNameSource: 'invitation' | 'linkedin' = 'linkedin';
    
    const updateData = {
      user_id: userId,
      persona_type: preferences.persona_type || defaultPersonaType,
      name_source: preferences.name_source || defaultNameSource,
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

    // Only update the specific persona type that this preference belongs to
    const tableName = preferences.persona_type === 'knyt' ? 'knyt_personas' : 'qripto_personas';
    
    const { error } = await supabase
      .from(tableName)
      .update({
        'First-Name': firstName || '',
        'Last-Name': lastName || ''
      })
      .eq('user_id', userId);

    if (error) {
      console.error(`Error updating ${preferences.persona_type} persona names:`, error);
      throw error;
    }
    
    console.log(`✅ Updated ${preferences.persona_type} persona names: ${firstName} ${lastName}`);
  }
}