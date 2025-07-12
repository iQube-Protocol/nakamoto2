
import { useState, useEffect } from 'react';
import { MetaQube, KNYTPersona, QryptoPersona } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { getPersonaType } from '@/services/blakqube/database-operations';
import { 
  knytPersonaToPrivateData, 
  qryptoPersonaToPrivateData,
  blakQubeToPrivateData,
  createDefaultKNYTPersona,
  createDefaultQryptoPersona
} from '@/services/blakqube/data-transformers';
import { personaDataSync } from '@/services/persona-data-sync';
import { supabase } from '@/integrations/supabase/client';

interface PrivateData {
  [key: string]: string | string[];
}

export const usePrivateData = (selectedIQube: MetaQube) => {
  const [privateData, setPrivateData] = useState<PrivateData>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchPrivateData = async () => {
    try {
      console.log('=== FETCHING PRIVATE DATA ===');
      console.log('📋 Selected iQube:', selectedIQube["iQube-Identifier"]);
      
      // Step 1: Verify authentication context
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('❌ Authentication error:', authError);
        setAuthError('Authentication required to fetch private data');
        setPrivateData({});
        return;
      }
      
      console.log('✅ Authenticated user:', authData.user.email);
      setAuthError(null);
      
      const personaType = getPersonaType(selectedIQube["iQube-Identifier"]);
      console.log('📋 Determined persona type:', personaType);
      
      if (personaType === 'knyt') {
        console.log('🔍 Fetching KNYT persona data...');
        const knytPersona = await blakQubeService.getPersonaData('knyt') as KNYTPersona;
        console.log('📋 Raw KNYT persona from DB:', knytPersona);
        
        if (knytPersona) {
          console.log('💰 KNYT-COYN-Owned from DB:', knytPersona["KNYT-COYN-Owned"]);
          const transformedData = knytPersonaToPrivateData(knytPersona);
          console.log('📋 Transformed KNYT data:', transformedData);
          console.log('💰 KNYT-COYN-Owned after transform:', transformedData["KNYT-COYN-Owned"]);
          setPrivateData(transformedData);
        } else {
          console.log('⚠️ No KNYT persona found in database, creating empty template');
          // Show empty KNYT persona schema for users to fill
          const defaultKnytPersona = createDefaultKNYTPersona(authData.user.email);
          const emptyKnytData = knytPersonaToPrivateData(defaultKnytPersona as KNYTPersona);
          setPrivateData(emptyKnytData);
        }
      } else {
        console.log('🔍 Fetching Qrypto persona data...');
        const qryptoPersona = await blakQubeService.getPersonaData('qrypto') as QryptoPersona;
        console.log('📋 Raw Qrypto persona from DB:', qryptoPersona);
        
        if (qryptoPersona) {
          const transformedData = qryptoPersonaToPrivateData(qryptoPersona);
          console.log('📋 Transformed Qrypto data:', transformedData);
          setPrivateData(transformedData);
        } else {
          console.log('⚠️ No Qrypto persona found in database, creating empty template');
          // Show empty Qrypto persona schema for users to fill
          const defaultQryptoPersona = createDefaultQryptoPersona(authData.user.email);
          const emptyQryptoData = qryptoPersonaToPrivateData(defaultQryptoPersona as QryptoPersona);
          setPrivateData(emptyQryptoData);
        }
      }
      
      console.log('=== PRIVATE DATA FETCH COMPLETE ===');
    } catch (error) {
      console.error('❌ Error fetching private data:', error);
      
      // Check for specific RLS policy violations
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('row-level security') || errorMessage.includes('policy')) {
          setAuthError('Access denied: You can only view your own data');
        } else {
          setAuthError(`Database error: ${errorMessage}`);
        }
      } else {
        setAuthError('Failed to fetch private data');
      }
      
      setPrivateData({});
    }
  };

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    try {
      console.log('=== UPDATING PRIVATE DATA ===');
      console.log('📋 New data to save:', newData);
      console.log('💰 KNYT-COYN-Owned in new data:', newData["KNYT-COYN-Owned"]);
      
      // Step 1: Verify authentication context before updating
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('❌ Authentication error during update:', authError);
        setAuthError('Authentication required to update private data');
        return;
      }
      
      console.log('✅ Authenticated user for update:', authData.user.email);
      setAuthError(null);
      
      const personaType = getPersonaType(selectedIQube["iQube-Identifier"]);
      console.log('📋 Saving to persona type:', personaType);
      
      const success = await blakQubeService.saveManualPersonaData(newData, personaType);
      console.log('📋 Save result:', success);
      
      if (success) {
        setPrivateData(newData);
        console.log('✅ Private data updated successfully');
        
        // Trigger a refetch after a brief delay
        setTimeout(() => {
          console.log('🔄 Refetching data to verify save...');
          fetchPrivateData();
        }, 500);
      } else {
        console.error('❌ Failed to update private data');
        setAuthError('Failed to save changes to database');
      }
      
      console.log('=== PRIVATE DATA UPDATE COMPLETE ===');
    } catch (error) {
      console.error('❌ Error updating private data:', error);
      
      // Handle RLS policy violations on update
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('row-level security') || errorMessage.includes('policy')) {
          setAuthError('Access denied: You can only update your own data');
        } else {
          setAuthError(`Update failed: ${errorMessage}`);
        }
      } else {
        setAuthError('Failed to update private data');
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPrivateData();
  }, [selectedIQube]);

  // Listen for data updates with simplified debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleDataUpdate = () => {
      console.log('📡 Received data update event, scheduling refetch...');
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Debounce the refetch with a shorter delay
      timeoutId = setTimeout(() => {
        fetchPrivateData();
      }, 500);
    };

    // Listen to multiple event types
    const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
    events.forEach(eventName => {
      window.addEventListener(eventName, handleDataUpdate);
    });

    // Also use the persona data sync service
    const unsubscribe = personaDataSync.subscribe(handleDataUpdate);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleDataUpdate);
      });
      unsubscribe();
    };
  }, [selectedIQube]);

  return {
    privateData,
    handleUpdatePrivateData,
    authError,
    clearAuthError: () => setAuthError(null)
  };
};
