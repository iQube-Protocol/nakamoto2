
import { useState, useEffect } from 'react';
import { MetaQube } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  knytPersonaToPrivateData, 
  qryptoPersonaToPrivateData,
  createDefaultKNYTPersona,
  createDefaultQryptoPersona,
  // Legacy functions
  blakQubeToPrivateData, 
  createDefaultBlakQube 
} from '@/services/blakqube/data-transformers';
import { getPersonaType } from '@/services/blakqube/database-operations';
import { personaDataSync } from '@/services/persona-data-sync';

interface PrivateData {
  [key: string]: string | string[];
}

export const usePrivateData = (selectedIQube: MetaQube) => {
  const { user } = useAuth();
  const [privateData, setPrivateData] = useState<PrivateData>({});
  const [loading, setLoading] = useState(true);

  // Determine persona type based on the selected iQube
  const personaType = getPersonaType(selectedIQube["iQube-Identifier"]);

  // Load real persona data from database
  const loadPersonaData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('usePrivateData: Loading persona data for user:', user.email, 'persona type:', personaType);
      const personaData = await blakQubeService.getPersonaData(personaType);
      
      if (personaData) {
        console.log('usePrivateData: Persona data loaded:', {
          user_id: personaData.user_id,
          email: personaData.Email,
          first_name: personaData['First-Name'],
          last_name: personaData['Last-Name'],
          data_keys: Object.keys(personaData)
        });
        
        // Convert persona data to privateData format
        let formattedData: PrivateData;
        if (personaType === 'knyt') {
          formattedData = knytPersonaToPrivateData(personaData as any);
        } else {
          formattedData = qryptoPersonaToPrivateData(personaData as any);
        }
        
        console.log('usePrivateData: Formatted private data:', {
          formatted_keys: Object.keys(formattedData),
          first_name: formattedData['First-Name'],
          last_name: formattedData['Last-Name'],
          email: formattedData['Email']
        });
        
        setPrivateData(formattedData);
      } else {
        console.log('usePrivateData: No persona data found, using defaults for type:', personaType);
        // Set default empty data if no persona exists
        let defaultData;
        if (personaType === 'knyt') {
          defaultData = createDefaultKNYTPersona(user.email);
          const formattedData = knytPersonaToPrivateData(defaultData as any);
          setPrivateData(formattedData);
        } else {
          defaultData = createDefaultQryptoPersona(user.email);
          const formattedData = qryptoPersonaToPrivateData(defaultData as any);
          setPrivateData(formattedData);
        }
      }
    } catch (error) {
      console.error('usePrivateData: Error loading persona data:', error);
      // Fallback to empty data
      let defaultData;
      if (personaType === 'knyt') {
        defaultData = createDefaultKNYTPersona(user?.email);
        const formattedData = knytPersonaToPrivateData(defaultData as any);
        setPrivateData(formattedData);
      } else {
        defaultData = createDefaultQryptoPersona(user?.email);
        const formattedData = qryptoPersonaToPrivateData(defaultData as any);
        setPrivateData(formattedData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonaData();
  }, [user, personaType]);

  // Listen for private data updates from wallet connections
  useEffect(() => {
    const handlePrivateDataUpdate = () => {
      console.log('Private data update event received, reloading persona data...');
      loadPersonaData();
    };

    window.addEventListener('privateDataUpdated', handlePrivateDataUpdate);
    
    return () => {
      window.removeEventListener('privateDataUpdated', handlePrivateDataUpdate);
    };
  }, [user, personaType]);

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    console.log('Updating private data for persona type:', personaType, newData);
    
    try {
      // Update local state immediately for UI responsiveness
      setPrivateData(newData);
      
      // Save to database using the new persona service
      const success = await blakQubeService.saveManualPersonaData(newData, personaType);
      
      if (success) {
        console.log('Private data saved successfully to database');
        toast.success(`${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data saved successfully`);
        
        // Also trigger connection updates to maintain consistency
        console.log('Triggering connection updates after manual save...');
        await blakQubeService.updatePersonaFromConnections(personaType);
        
        // Trigger a final refresh to ensure data consistency
        await loadPersonaData();
        
        // Notify all components listening for persona data updates
        personaDataSync.notifyDataUpdated();
      } else {
        console.error('Failed to save private data to database');
        toast.error(`Failed to save ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data. Please try again.`);
        
        // Revert local state on failure
        await loadPersonaData();
      }
    } catch (error) {
      console.error('Error saving private data:', error);
      toast.error(`Error saving ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data. Please try again.`);
      
      // Revert local state on error
      await loadPersonaData();
    }
  };

  return {
    privateData,
    handleUpdatePrivateData,
    loading,
    refreshData: loadPersonaData,
    personaType
  };
};
