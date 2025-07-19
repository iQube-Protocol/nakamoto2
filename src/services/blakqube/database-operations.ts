
import { supabase } from '@/integrations/supabase/client';
import { KNYTPersona, QryptoPersona, BlakQube } from '@/lib/types';

// Determine which persona type to fetch based on the MetaQube identifier
export const getPersonaType = (metaQubeIdentifier: string): 'knyt' | 'qrypto' => {
  return metaQubeIdentifier === "KNYT Persona iQube" || metaQubeIdentifier === "KNYT Persona" ? 'knyt' : 'qrypto';
};

export const fetchKNYTPersonaFromDB = async (userId: string): Promise<KNYTPersona | null> => {
  try {
    console.log('Fetching KNYT Persona data for user:', userId);
    
    // Verify authentication context before database operation
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Authentication required for database access:', authError);
      throw new Error('Authentication required to access KNYT persona data');
    }
    
    // Ensure user can only access their own data
    if (authData.user.id !== userId) {
      console.error('❌ Access denied: User attempting to access different user data');
      throw new Error('Access denied: You can only access your own data');
    }
    
    const { data, error } = await (supabase as any)
      .from('knyt_personas')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching KNYT Persona data:', error);
      // Check for RLS policy violations
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        throw new Error('Access denied: Row-level security policy violation');
      }
      return null;
    }
    
    console.log('KNYT Persona data fetched:', data);
    return data as KNYTPersona;
  } catch (error) {
    console.error('Error in fetchKNYTPersonaFromDB:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const fetchQryptoPersonaFromDB = async (userId: string): Promise<QryptoPersona | null> => {
  try {
    console.log('Fetching Qrypto Persona data for user:', userId);
    
    // Verify authentication context before database operation
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Authentication required for database access:', authError);
      throw new Error('Authentication required to access Qrypto persona data');
    }
    
    // Ensure user can only access their own data
    if (authData.user.id !== userId) {
      console.error('❌ Access denied: User attempting to access different user data');
      throw new Error('Access denied: You can only access your own data');
    }
    
    const { data, error } = await (supabase as any)
      .from('qrypto_personas')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching Qrypto Persona data:', error);
      // Check for RLS policy violations
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        throw new Error('Access denied: Row-level security policy violation');
      }
      return null;
    }
    
    console.log('Qrypto Persona data fetched:', data);
    return data as QryptoPersona;
  } catch (error) {
    console.error('Error in fetchQryptoPersonaFromDB:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Legacy function for backward compatibility
export const fetchBlakQubeFromDB = async (userId: string): Promise<BlakQube | null> => {
  console.warn('fetchBlakQubeFromDB is deprecated. Use fetchKNYTPersonaFromDB or fetchQryptoPersonaFromDB instead.');
  
  // Try to fetch from the old blak_qubes table first (if it still exists)
  try {
    const { data, error } = await (supabase as any)
      .from('blak_qubes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      return data as BlakQube;
    }
  } catch (error) {
    console.log('Old blak_qubes table not accessible, trying new tables');
  }
  
  // Fallback: try to construct from new tables
  const knytPersona = await fetchKNYTPersonaFromDB(userId);
  if (knytPersona) {
    // Convert KNYT persona to legacy format with all required BlakQube fields
    return {
      ...knytPersona,
      "Wallets-of-Interest": [], // KNYT doesn't have this field
      "GitHub-Handle": "", // KNYT doesn't have this field
      "Qrypto-ID": "" // KNYT personas don't have Qrypto-ID
    } as BlakQube;
  }
  
  const qryptoPersona = await fetchQryptoPersonaFromDB(userId);
  if (qryptoPersona) {
    // Convert Qrypto persona to legacy format with all required BlakQube fields
    return {
      ...qryptoPersona,
      "KNYT-ID": "",
      "Phone-Number": "",
      "Age": "",
      "Address": "",
      "ThirdWeb-Public-Key": "",
      "MetaKeep-Public-Key": "",
      "OM-Member-Since": "",
      "OM-Tier-Status": "",
      "Metaiye-Shares-Owned": "",
      "Total-Invested": "",
      "KNYT-COYN-Owned": "",
      "Motion-Comics-Owned": "",
      "Paper-Comics-Owned": "",
      "Digital-Comics-Owned": "",
      "KNYT-Posters-Owned": "",
      "KNYT-Cards-Owned": "",
      "Characters-Owned": ""
    } as BlakQube;
  }
  
  return null;
};

export const saveKNYTPersonaToDB = async (
  userId: string,
  personaData: Partial<KNYTPersona>
): Promise<boolean> => {
  try {
    console.log('=== SAVING KNYT PERSONA TO DB ===');
    console.log('📋 User ID:', userId);
    console.log('📋 Persona data to save:', personaData);
    console.log('💰 KNYT-COYN-Owned in data:', personaData["KNYT-COYN-Owned"]);
    
    // Verify authentication context before database operation
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Authentication required for database save:', authError);
      throw new Error('Authentication required to save KNYT persona data');
    }
    
    // Ensure user can only save their own data
    if (authData.user.id !== userId) {
      console.error('❌ Access denied: User attempting to save data for different user');
      throw new Error('Access denied: You can only save your own data');
    }
    
    // First try to update existing record
    const { data: updateResult, error: updateError } = await (supabase as any)
      .from('knyt_personas')
      .update({
        ...personaData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    console.log('📋 Update result:', updateResult);
    console.log('📋 Update error:', updateError);
    
    // If no rows were updated, insert a new one
    if (updateResult && updateResult.length === 0) {
      console.log('🆕 No existing KNYT Persona found, inserting new record');
      const { data: insertResult, error: insertError } = await (supabase as any)
        .from('knyt_personas')
        .insert({
          user_id: userId,
          ...personaData,
          updated_at: new Date().toISOString()
        })
        .select();
      
      console.log('📋 Insert result:', insertResult);
      console.log('📋 Insert error:', insertError);
      
      if (insertError) {
        console.error('❌ Error inserting new KNYT Persona data:', insertError);
        // Check for RLS policy violations
        if (insertError.message?.includes('row-level security') || insertError.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation on insert');
        }
        return false;
      }
    } else if (updateError) {
      console.error('❌ Error updating KNYT Persona data:', updateError);
      // Check for RLS policy violations
      if (updateError.message?.includes('row-level security') || updateError.message?.includes('policy')) {
        throw new Error('Access denied: Row-level security policy violation on update');
      }
      return false;
    }
    
    // Verify the data was actually saved by reading it back
    console.log('🔍 Verifying saved data...');
    const { data: verifyData, error: verifyError } = await (supabase as any)
      .from('knyt_personas')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying saved data:', verifyError);
    } else {
      console.log('✅ Verified saved KNYT Persona data:', verifyData);
      console.log('💰 Verified KNYT-COYN-Owned:', verifyData?.["KNYT-COYN-Owned"]);
    }
    
    console.log('✅ KNYT Persona data saved successfully');
    console.log('=== KNYT PERSONA SAVE COMPLETE ===');
    return true;
  } catch (error) {
    console.error('❌ Error in saveKNYTPersonaToDB:', error);
    console.log('=== KNYT PERSONA SAVE FAILED ===');
    return false;
  }
};

export const saveQryptoPersonaToDB = async (
  userId: string,
  personaData: Partial<QryptoPersona>
): Promise<boolean> => {
  try {
    console.log('Saving Qrypto Persona data for user:', userId, personaData);
    
    // Verify authentication context before database operation
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('❌ Authentication required for database save:', authError);
      throw new Error('Authentication required to save Qrypto persona data');
    }
    
    // Ensure user can only save their own data
    if (authData.user.id !== userId) {
      console.error('❌ Access denied: User attempting to save data for different user');
      throw new Error('Access denied: You can only save your own data');
    }
    
    // First try to update existing record
    const { data: updateResult, error: updateError } = await (supabase as any)
      .from('qrypto_personas')
      .update({
        ...personaData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    // If no rows were updated, insert a new one
    if (updateResult && updateResult.length === 0) {
      console.log('No existing Qrypto Persona found, inserting new record');
      const { error: insertError } = await (supabase as any)
        .from('qrypto_personas')
        .insert({
          user_id: userId,
          ...personaData,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error inserting new Qrypto Persona data:', insertError);
        // Check for RLS policy violations
        if (insertError.message?.includes('row-level security') || insertError.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation on insert');
        }
        return false;
      }
    } else if (updateError) {
      console.error('Error updating Qrypto Persona data:', updateError);
      // Check for RLS policy violations
      if (updateError.message?.includes('row-level security') || updateError.message?.includes('policy')) {
        throw new Error('Access denied: Row-level security policy violation on update');
      }
      return false;
    }
    
    console.log('Qrypto Persona data saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveQryptoPersonaToDB:', error);
    return false;
  }
};

// Legacy function for backward compatibility
export const saveBlakQubeToDB = async (
  userId: string,
  blakQubeData: Partial<BlakQube>
): Promise<boolean> => {
  console.warn('saveBlakQubeToDB is deprecated. Use saveKNYTPersonaToDB or saveQryptoPersonaToDB instead.');
  
  // Determine which table to save to based on the data
  if (blakQubeData['KNYT-ID']) {
    // Save to KNYT personas table
    return await saveKNYTPersonaToDB(userId, blakQubeData as Partial<KNYTPersona>);
  } else {
    // Save to Qrypto personas table
    return await saveQryptoPersonaToDB(userId, blakQubeData as Partial<QryptoPersona>);
  }
};

export const fetchUserConnections = async (userId: string) => {
  try {
    const { data: connections, error: connectionsError } = await (supabase as any)
      .from('user_connections')
      .select('service, connection_data')
      .eq('user_id', userId);
    
    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      return null;
    }
    
    console.log('User connections:', connections);
    return connections;
  } catch (error) {
    console.error('Error in fetchUserConnections:', error);
    return null;
  }
};
