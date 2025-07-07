import { supabase } from '@/integrations/supabase/client';
import { KNYTPersona, QryptoPersona, BlakQube } from '@/lib/types';
import { PrivateData } from './blakqube/types';
import { personaDataSync } from './persona-data-sync';
import { 
  privateDataToKNYTPersona, 
  privateDataToQryptoPersona,
  knytPersonaToPrivateData,
  qryptoPersonaToPrivateData,
  createDefaultKNYTPersona,
  createDefaultQryptoPersona,
  // Legacy functions
  privateDataToBlakQube, 
  blakQubeToPrivateData, 
  createDefaultBlakQube 
} from './blakqube/data-transformers';
import {
  processLinkedInConnection,
  processWalletConnection,
  processThirdWebConnection,
  processTwitterConnection,
  processSocialConnection
} from './blakqube/connection-processors';
import {
  fetchKNYTPersonaFromDB,
  fetchQryptoPersonaFromDB,
  saveKNYTPersonaToDB,
  saveQryptoPersonaToDB,
  getPersonaType,
  fetchUserConnections,
  // Legacy functions
  fetchBlakQubeFromDB,
  saveBlakQubeToDB
} from './blakqube/database-operations';

/**
 * Service for managing persona data (KNYT and Qrypto)
 */
export const blakQubeService = {
  /**
   * Get persona data for the current user based on persona type
   */
  getPersonaData: async (personaType: 'knyt' | 'qrypto'): Promise<KNYTPersona | QryptoPersona | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      
      if (personaType === 'knyt') {
        return await fetchKNYTPersonaFromDB(user.user.id);
      } else {
        return await fetchQryptoPersonaFromDB(user.user.id);
      }
    } catch (error) {
      console.error('Error in getPersonaData:', error);
      return null;
    }
  },

  /**
   * Get BlakQube data for the current user (legacy method)
   */
  getBlakQubeData: async (): Promise<BlakQube | null> => {
    console.warn('getBlakQubeData is deprecated. Use getPersonaData instead.');
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      
      return await fetchBlakQubeFromDB(user.user.id);
    } catch (error) {
      console.error('Error in getBlakQubeData:', error);
      return null;
    }
  },
  
  /**
   * Save manually edited persona data to the database
   */
  saveManualPersonaData: async (data: PrivateData, personaType: 'knyt' | 'qrypto'): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return false;
      }
      
      console.log('Saving manual persona data for user:', user.user.id, 'type:', personaType, data);
      
      let success: boolean;
      if (personaType === 'knyt') {
        const personaData = privateDataToKNYTPersona(data);
        console.log('Converted KNYT persona data for save:', personaData);
        success = await saveKNYTPersonaToDB(user.user.id, personaData);
      } else {
        const personaData = privateDataToQryptoPersona(data);
        console.log('Converted Qrypto persona data for save:', personaData);
        success = await saveQryptoPersonaToDB(user.user.id, personaData);
      }
      
      // Notify other components of the data update
      if (success) {
        personaDataSync.notifyDataUpdated();
      }
      
      return success;
    } catch (error) {
      console.error('Error in saveManualPersonaData:', error);
      return false;
    }
  },

  /**
   * Save manually edited BlakQube data to the database (legacy method)
   */
  saveManualBlakQubeData: async (data: PrivateData): Promise<boolean> => {
    console.warn('saveManualBlakQubeData is deprecated. Use saveManualPersonaData instead.');
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return false;
      }
      
      console.log('Saving manual BlakQube data for user:', user.user.id, data);
      
      // Convert PrivateData format to BlakQube format
      const blakQubeData = privateDataToBlakQube(data);
      
      console.log('Converted BlakQube data for save:', blakQubeData);
      
      return await saveBlakQubeToDB(user.user.id, blakQubeData);
    } catch (error) {
      console.error('Error in saveManualBlakQubeData:', error);
      return false;
    }
  },
  
  /**
   * Update persona data with information from connected services
   */
  updatePersonaFromConnections: async (personaType: 'knyt' | 'qrypto'): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      
      console.log('Updating persona from connections for user:', user.user.id, 'type:', personaType);
      
      // First, ensure wallet connection has KNYT balance data if it exists
      const { walletConnectionService } = await import('./wallet-connection-service');
      await walletConnectionService.updateWalletWithKnytBalance();
      
      // Get current persona data
      let currentPersona: KNYTPersona | QryptoPersona | null = null;
      if (personaType === 'knyt') {
        currentPersona = await fetchKNYTPersonaFromDB(user.user.id);
      } else {
        currentPersona = await fetchQryptoPersonaFromDB(user.user.id);
      }
      
      // Get user connections
      const connections = await fetchUserConnections(user.user.id);
      if (!connections) return false;
      
      // Start with existing persona or create new one with all fields
      let newPersona: Partial<KNYTPersona | QryptoPersona>;
      if (currentPersona) {
        newPersona = { ...currentPersona };
      } else {
        if (personaType === 'knyt') {
          newPersona = createDefaultKNYTPersona(user.user.email);
        } else {
          newPersona = createDefaultQryptoPersona(user.user.email);
        }
      }
      
      // Update persona based on connections
      for (const connection of connections) {
        console.log('Processing connection:', connection.service, connection.connection_data);
        
        switch (connection.service) {
          case 'linkedin':
            processLinkedInConnection(connection, newPersona as any);
            break;
          case 'wallet':
            processWalletConnection(connection, newPersona as any);
            break;
          case 'thirdweb':
            processThirdWebConnection(connection, newPersona as any);
            break;
          case 'twitter':
            processTwitterConnection(connection, newPersona as any);
            break;
          case 'telegram':
          case 'discord':
          case 'facebook':
          case 'youtube':
          case 'tiktok':
            processSocialConnection(connection.service, connection, newPersona as any);
            break;
        }
      }
      
      console.log('Updated persona data:', newPersona);
      
      let success: boolean;
      if (personaType === 'knyt') {
        success = await saveKNYTPersonaToDB(user.user.id, newPersona as Partial<KNYTPersona>);
      } else {
        success = await saveQryptoPersonaToDB(user.user.id, newPersona as Partial<QryptoPersona>);
      }
      
      // Notify other components of the data update
      if (success) {
        personaDataSync.notifyDataUpdated();
      }
      
      return success;
    } catch (error) {
      console.error('Error in updatePersonaFromConnections:', error);
      return false;
    }
  },

  /**
   * Update BlakQube data with information from connected services (legacy method)
   */
  updateBlakQubeFromConnections: async (): Promise<boolean> => {
    console.warn('updateBlakQubeFromConnections is deprecated. Use updatePersonaFromConnections instead.');
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      
      console.log('Updating BlakQube from connections for user:', user.user.id);
      
      // Get current BlakQube data
      const blakQube = await fetchBlakQubeFromDB(user.user.id);
      
      // Get user connections
      const connections = await fetchUserConnections(user.user.id);
      if (!connections) return false;
      
      // Start with existing BlakQube or create new one with all fields
      const newBlakQube: Partial<BlakQube> = blakQube ? 
        { ...blakQube } : 
        createDefaultBlakQube(user.user.email);
      
      // Update BlakQube based on connections
      for (const connection of connections) {
        console.log('Processing connection:', connection.service, connection.connection_data);
        
        switch (connection.service) {
          case 'linkedin':
            processLinkedInConnection(connection, newBlakQube);
            break;
          case 'wallet':
            processWalletConnection(connection, newBlakQube);
            break;
          case 'thirdweb':
            processThirdWebConnection(connection, newBlakQube);
            break;
          case 'twitter':
            processTwitterConnection(connection, newBlakQube);
            break;
          case 'telegram':
          case 'discord':
          case 'facebook':
          case 'youtube':
          case 'tiktok':
            processSocialConnection(connection.service, connection, newBlakQube);
            break;
        }
      }
      
      console.log('Updated BlakQube data:', newBlakQube);
      
      return await saveBlakQubeToDB(user.user.id, newBlakQube);
    } catch (error) {
      console.error('Error in updateBlakQubeFromConnections:', error);
      return false;
    }
  }
};
