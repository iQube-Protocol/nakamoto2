
import { useState, useEffect } from 'react';
import { MetaQube, KNYTPersona, QryptoPersona } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { getPersonaType } from '@/services/blakqube/database-operations';
import { 
  knytPersonaToPrivateData, 
  qryptoPersonaToPrivateData,
  blakQubeToPrivateData 
} from '@/services/blakqube/data-transformers';
import { personaDataSync } from '@/services/persona-data-sync';

interface PrivateData {
  [key: string]: string | string[];
}

export const usePrivateData = (selectedIQube: MetaQube) => {
  const [privateData, setPrivateData] = useState<PrivateData>({});

  const fetchPrivateData = async () => {
    try {
      console.log('=== FETCHING PRIVATE DATA ===');
      console.log('📋 Selected iQube:', selectedIQube["iQube-Identifier"]);
      
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
          console.log('⚠️ No KNYT persona found in database');
          setPrivateData({});
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
          console.log('⚠️ No Qrypto persona found in database');
          setPrivateData({});
        }
      }
      
      console.log('=== PRIVATE DATA FETCH COMPLETE ===');
    } catch (error) {
      console.error('❌ Error fetching private data:', error);
      setPrivateData({});
    }
  };

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    try {
      console.log('=== UPDATING PRIVATE DATA ===');
      console.log('📋 New data to save:', newData);
      console.log('💰 KNYT-COYN-Owned in new data:', newData["KNYT-COYN-Owned"]);
      
      const personaType = getPersonaType(selectedIQube["iQube-Identifier"]);
      console.log('📋 Saving to persona type:', personaType);
      
      const success = await blakQubeService.saveManualPersonaData(newData, personaType);
      console.log('📋 Save result:', success);
      
      if (success) {
        setPrivateData(newData);
        console.log('✅ Private data updated successfully');
        
        // Force a fresh fetch to verify the save worked
        setTimeout(() => {
          console.log('🔄 Refetching data to verify save...');
          fetchPrivateData();
        }, 1000);
      } else {
        console.error('❌ Failed to update private data');
      }
      
      console.log('=== PRIVATE DATA UPDATE COMPLETE ===');
    } catch (error) {
      console.error('❌ Error updating private data:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPrivateData();
  }, [selectedIQube]);

  // Listen for data updates
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('📡 Received data update event, refetching...');
      fetchPrivateData();
    };

    // Listen to multiple event types
    const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
    events.forEach(eventName => {
      window.addEventListener(eventName, handleDataUpdate);
    });

    // Also use the persona data sync service
    const unsubscribe = personaDataSync.subscribe(handleDataUpdate);

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleDataUpdate);
      });
      unsubscribe();
    };
  }, [selectedIQube]);

  return {
    privateData,
    handleUpdatePrivateData
  };
};
