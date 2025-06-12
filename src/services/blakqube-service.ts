
import { supabase } from '@/integrations/supabase/client';
import { BlakQube } from '@/lib/types';
import { PrivateData } from './blakqube/types';
import { 
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
  fetchBlakQubeFromDB,
  saveBlakQubeToDB,
  fetchUserConnections
} from './blakqube/database-operations';

/**
 * Service for managing BlakQube data
 */
export const blakQubeService = {
  /**
   * Get BlakQube data for the current user
   */
  getBlakQubeData: async (): Promise<BlakQube | null> => {
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
   * Save manually edited BlakQube data to the database
   */
  saveManualBlakQubeData: async (data: PrivateData): Promise<boolean> => {
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
   * Update BlakQube data with information from connected services
   */
  updateBlakQubeFromConnections: async (): Promise<boolean> => {
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
