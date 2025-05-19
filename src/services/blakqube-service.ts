
import { supabase } from '@/integrations/supabase/client';
import { BlakQube } from '@/lib/types';
import { toast } from 'sonner';

// Helper function to create a typed query builder for tables not in the Supabase types
function createSupabaseQueryBuilder<T = any>(tableName: string) {
  return supabase.from(tableName as any) as any;
}

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
      
      // Use our custom query builder to avoid TypeScript errors
      const { data, error } = await createSupabaseQueryBuilder('blak_qubes')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching BlakQube data:', error);
        return null;
      }
      
      return data as BlakQube;
    } catch (error) {
      console.error('Error in getBlakQubeData:', error);
      return null;
    }
  },
  
  /**
   * Update BlakQube data with information from connected services
   */
  updateBlakQubeFromConnections: async (): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      
      // Get current BlakQube data
      const { data: blakQube, error: blakQubeError } = await createSupabaseQueryBuilder('blak_qubes')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (blakQubeError && blakQubeError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching BlakQube data:', blakQubeError);
        return false;
      }
      
      // Get user connections
      const { data: connections, error: connectionsError } = await createSupabaseQueryBuilder('user_connections')
        .select('service, connection_data')
        .eq('user_id', user.user.id);
      
      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
        return false;
      }
      
      // Start with existing BlakQube or create new one
      const newBlakQube: Partial<BlakQube> = blakQube ? { ...blakQube } : {
        "Profession": "",
        "Web3-Interests": [],
        "Local-City": "",
        "Email": user.user.email || "",
        "EVM-Public-Key": "",
        "BTC-Public-Key": "",
        "Tokens-of-Interest": [],
        "Chain-IDs": [],
        "Wallets-of-Interest": []
      };
      
      // Update BlakQube based on connections
      if (connections) {
        for (const connection of connections) {
          if (connection.service === 'linkedin' && connection.connection_data?.profile) {
            // Extract profession from LinkedIn
            if (connection.connection_data.profile.headline) {
              newBlakQube["Profession"] = connection.connection_data.profile.headline;
            }
            
            // Extract location from LinkedIn
            if (connection.connection_data.profile.location?.preferredGeoPlace?.name) {
              newBlakQube["Local-City"] = connection.connection_data.profile.location.preferredGeoPlace.name;
            }
          }
          
          if (connection.service === 'wallet' && connection.connection_data?.address) {
            // Set EVM public key
            newBlakQube["EVM-Public-Key"] = connection.connection_data.address;
            
            // Add MetaMask to wallets of interest if not already there
            if (!newBlakQube["Wallets-of-Interest"]?.includes("MetaMask")) {
              newBlakQube["Wallets-of-Interest"] = [
                ...(newBlakQube["Wallets-of-Interest"] || []),
                "MetaMask"
              ];
            }
          }
          
          if (connection.service === 'twitter' && connection.connection_data?.interests) {
            // Extract interests from Twitter
            const twitterInterests = connection.connection_data.interests || [];
            const web3Interests = twitterInterests
              .filter((interest: string) => interest.toLowerCase().includes('blockchain') || 
                                            interest.toLowerCase().includes('crypto') || 
                                            interest.toLowerCase().includes('web3') || 
                                            interest.toLowerCase().includes('nft'));
            
            if (web3Interests.length > 0) {
              newBlakQube["Web3-Interests"] = [
                ...(newBlakQube["Web3-Interests"] || []),
                ...web3Interests
              ];
              
              // Remove duplicates
              newBlakQube["Web3-Interests"] = [...new Set(newBlakQube["Web3-Interests"])];
            }
          }
          
          // Similar logic for other services...
        }
      }
      
      // Save updated BlakQube
      const { error: updateError } = await createSupabaseQueryBuilder('blak_qubes')
        .upsert({
          user_id: user.user.id,
          ...newBlakQube
        });
      
      if (updateError) {
        console.error('Error updating BlakQube:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateBlakQubeFromConnections:', error);
      return false;
    }
  }
};
