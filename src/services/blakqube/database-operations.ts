
import { supabase } from '@/integrations/supabase/client';
import { KNYTPersona, QryptoPersona, BlakQube } from '@/lib/types';
import { sessionManager } from '@/services/session-manager';
import { toast } from 'sonner';

// Cache for recently fetched persona data
const personaCache = new Map<string, { data: any; timestamp: number; type: 'knyt' | 'qrypto' }>();
const CACHE_DURATION = 60000; // 1 minute cache

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Determine which persona type to fetch based on the MetaQube identifier
export const getPersonaType = (metaQubeIdentifier: string): 'knyt' | 'qrypto' => {
  return metaQubeIdentifier === "KNYT Persona iQube" || metaQubeIdentifier === "KNYT Persona" ? 'knyt' : 'qrypto';
};

/**
 * Optimized session validation wrapper - only validates once per batch of operations
 */
async function withOptimizedSessionValidation<T>(
  operation: () => Promise<T>,
  operationName: string,
  skipValidation: boolean = false
): Promise<T> {
  try {
    // Skip validation if requested (for batched operations)
    if (!skipValidation) {
      const { isValid, error } = await sessionManager.validateSession();
      
      if (!isValid) {
        console.error(`❌ ${operationName}: Session validation failed:`, error);
        
        // Try to refresh session once
        const refreshSuccess = await sessionManager.forceRefreshSession();
        if (!refreshSuccess) {
          throw new Error(`Authentication required to ${operationName.toLowerCase()}`);
        }
      }
    }

    // Perform the operation
    return await operation();
  } catch (error) {
    console.error(`❌ Error in ${operationName}:`, error);
    throw error;
  }
}

/**
 * Get cached persona data if available and fresh
 */
function getCachedPersona(userId: string, type: 'knyt' | 'qrypto'): any | null {
  const cacheKey = `${userId}-${type}`;
  const cached = personaCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION && cached.type === type) {
    console.log(`📋 Using cached ${type} persona for user:`, userId);
    return cached.data;
  }
  
  return null;
}

/**
 * Cache persona data
 */
function cachePersona(userId: string, type: 'knyt' | 'qrypto', data: any): void {
  const cacheKey = `${userId}-${type}`;
  personaCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    type
  });
}

/**
 * Deduplicate requests to prevent multiple simultaneous fetches
 */
function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    console.log(`🔄 Deduplicating request for key: ${key}`);
    return pendingRequests.get(key)!;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

export const fetchKNYTPersonaFromDB = async (userId: string): Promise<KNYTPersona | null> => {
  // Check cache first
  const cached = getCachedPersona(userId, 'knyt');
  if (cached) return cached;

  // Deduplicate concurrent requests
  const requestKey = `knyt-${userId}`;
  return deduplicateRequest(requestKey, async () => {
    return withOptimizedSessionValidation(async () => {
      console.log('Fetching KNYT Persona data for user:', userId);
      
      const { data, error } = await (supabase as any)
        .from('knyt_personas')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching KNYT Persona data:', error);
        if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation');
        }
        return null;
      }
      
      console.log('KNYT Persona data fetched:', data);
      
      // Cache the result
      if (data) {
        cachePersona(userId, 'knyt', data);
      }
      
      return data as KNYTPersona;
    }, 'fetchKNYTPersonaFromDB');
  });
};

export const fetchQryptoPersonaFromDB = async (userId: string): Promise<QryptoPersona | null> => {
  // Check cache first
  const cached = getCachedPersona(userId, 'qrypto');
  if (cached) return cached;

  // Deduplicate concurrent requests
  const requestKey = `qrypto-${userId}`;
  return deduplicateRequest(requestKey, async () => {
    return withOptimizedSessionValidation(async () => {
      console.log('Fetching Qrypto Persona data for user:', userId);
      
      const { data, error } = await (supabase as any)
        .from('qrypto_personas')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching Qrypto Persona data:', error);
        if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation');
        }
        return null;
      }
      
      console.log('Qrypto Persona data fetched:', data);
      
      // Cache the result
      if (data) {
        cachePersona(userId, 'qrypto', data);
      }
      
      return data as QryptoPersona;
    }, 'fetchQryptoPersonaFromDB');
  });
};

/**
 * Batch fetch both personas efficiently
 */
export const fetchBothPersonas = async (userId: string): Promise<{ knyt: KNYTPersona | null; qrypto: QryptoPersona | null }> => {
  return withOptimizedSessionValidation(async () => {
    console.log('Batch fetching both personas for user:', userId);
    
    // Check cache first
    const cachedKnyt = getCachedPersona(userId, 'knyt');
    const cachedQrypto = getCachedPersona(userId, 'qrypto');
    
    // Only fetch what's not cached
    const promises: Promise<any>[] = [];
    
    if (!cachedKnyt) {
      promises.push(
        (supabase as any)
          .from('knyt_personas')
          .select('*')
          .eq('user_id', userId)
          .single()
          .then((result: any) => ({ type: 'knyt', ...result }))
      );
    }
    
    if (!cachedQrypto) {
      promises.push(
        (supabase as any)
          .from('qrypto_personas')
          .select('*')
          .eq('user_id', userId)
          .single()
          .then((result: any) => ({ type: 'qrypto', ...result }))
      );
    }
    
    // Execute remaining fetches in parallel
    const results = await Promise.allSettled(promises);
    
    let knytData = cachedKnyt;
    let qryptoData = cachedQrypto;
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.data) {
        if (result.value.type === 'knyt') {
          knytData = result.value.data;
          cachePersona(userId, 'knyt', knytData);
        } else if (result.value.type === 'qrypto') {
          qryptoData = result.value.data;
          cachePersona(userId, 'qrypto', qryptoData);
        }
      }
    });
    
    return { knyt: knytData, qrypto: qryptoData };
  }, 'fetchBothPersonas');
};

// Legacy function for backward compatibility
export const fetchBlakQubeFromDB = async (userId: string): Promise<BlakQube | null> => {
  console.warn('fetchBlakQubeFromDB is deprecated. Use fetchKNYTPersonaFromDB or fetchQryptoPersonaFromDB instead.');
  
  // Use the new batch fetch function
  const { knyt, qrypto } = await fetchBothPersonas(userId);
  
  if (knyt) {
    return {
      ...knyt,
      "Wallets-of-Interest": [], // KNYT doesn't have this field
      "GitHub-Handle": "", // KNYT doesn't have this field
      "Qrypto-ID": "" // KNYT personas don't have Qrypto-ID
    } as BlakQube;
  }
  
  if (qrypto) {
    return {
      ...qrypto,
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
  return withOptimizedSessionValidation(async () => {
    console.log('=== SAVING KNYT PERSONA TO DB ===');
    console.log('📋 User ID:', userId);
    console.log('📋 Persona data to save:', personaData);
    console.log('💰 KNYT-COYN-Owned in data:', personaData["KNYT-COYN-Owned"]);
    
    // Clear cache for this user
    const cacheKey = `${userId}-knyt`;
    personaCache.delete(cacheKey);
    
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
        if (insertError.message?.includes('row-level security') || insertError.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation on insert');
        }
        return false;
      }
    } else if (updateError) {
      console.error('❌ Error updating KNYT Persona data:', updateError);
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
      
      // Cache the verified data
      cachePersona(userId, 'knyt', verifyData);
    }
    
    console.log('✅ KNYT Persona data saved successfully');
    console.log('=== KNYT PERSONA SAVE COMPLETE ===');
    return true;
  }, 'saveKNYTPersonaToDB');
};

export const saveQryptoPersonaToDB = async (
  userId: string,
  personaData: Partial<QryptoPersona>
): Promise<boolean> => {
  return withOptimizedSessionValidation(async () => {
    console.log('Saving Qrypto Persona data for user:', userId, personaData);
    
    // Clear cache for this user
    const cacheKey = `${userId}-qrypto`;
    personaCache.delete(cacheKey);
    
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
        if (insertError.message?.includes('row-level security') || insertError.message?.includes('policy')) {
          throw new Error('Access denied: Row-level security policy violation on insert');
        }
        return false;
      }
    } else if (updateError) {
      console.error('Error updating Qrypto Persona data:', updateError);
      if (updateError.message?.includes('row-level security') || updateError.message?.includes('policy')) {
        throw new Error('Access denied: Row-level security policy violation on update');
      }
      return false;
    }
    
    console.log('Qrypto Persona data saved successfully');
    return true;
  }, 'saveQryptoPersonaToDB');
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
  return withOptimizedSessionValidation(async () => {
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
  }, 'fetchUserConnections');
};
