
import { supabase } from '@/integrations/supabase/client';
import { BlakQube } from '@/lib/types';
import { toast } from 'sonner';

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
      
      console.log('Fetching BlakQube data for user:', user.user.id);
      
      // Use type assertion to work around TypeScript issues
      const { data, error } = await (supabase as any)
        .from('blak_qubes')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching BlakQube data:', error);
        return null;
      }
      
      console.log('BlakQube data fetched:', data);
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
      
      console.log('Updating BlakQube from connections for user:', user.user.id);
      
      // Get current BlakQube data
      const { data: blakQube, error: blakQubeError } = await (supabase as any)
        .from('blak_qubes')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (blakQubeError && blakQubeError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching BlakQube data:', blakQubeError);
        return false;
      }
      
      // Get user connections
      const { data: connections, error: connectionsError } = await (supabase as any)
        .from('user_connections')
        .select('service, connection_data')
        .eq('user_id', user.user.id);
      
      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
        return false;
      }
      
      console.log('User connections:', connections);
      
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
        "Wallets-of-Interest": [],
        "LinkedIn-ID": "",
        "LinkedIn-Profile-URL": "",
        "Twitter-Handle": "",
        "Telegram-Handle": "",
        "Discord-Handle": "",
        "Instagram-Handle": "",
        "GitHub-Handle": ""
      };
      
      // Update BlakQube based on connections
      if (connections) {
        for (const connection of connections) {
          console.log('Processing connection:', connection.service, connection.connection_data);
          
          if (connection.service === 'linkedin' && connection.connection_data?.profile) {
            console.log('Processing LinkedIn connection data:', connection.connection_data.profile);
            
            // Extract LinkedIn profile data
            const profile = connection.connection_data.profile;
            if (profile.id) {
              newBlakQube["LinkedIn-ID"] = profile.id;
            }
            if (profile.profileUrl) {
              newBlakQube["LinkedIn-Profile-URL"] = profile.profileUrl;
            }
            
            // Extract profession from LinkedIn (if available)
            if (profile.headline) {
              newBlakQube["Profession"] = profile.headline;
            }
            
            // Extract location from LinkedIn (if available)
            if (profile.location?.preferredGeoPlace?.name) {
              newBlakQube["Local-City"] = profile.location.preferredGeoPlace.name;
            }
            
            // Use LinkedIn email if available
            if (connection.connection_data.email) {
              newBlakQube["Email"] = connection.connection_data.email;
            }
          }
          
          if (connection.service === 'wallet' && connection.connection_data?.address) {
            console.log('Setting EVM public key:', connection.connection_data.address);
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
          
          if (connection.service === 'twitter' && connection.connection_data?.profile) {
            // Extract Twitter handle
            if (connection.connection_data.profile.username) {
              newBlakQube["Twitter-Handle"] = `@${connection.connection_data.profile.username}`;
            }
            
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
          
          if (connection.service === 'telegram' && connection.connection_data?.profile) {
            // Extract Telegram handle
            if (connection.connection_data.profile.username) {
              newBlakQube["Telegram-Handle"] = `@${connection.connection_data.profile.username}`;
            }
          }
          
          if (connection.service === 'discord' && connection.connection_data?.profile) {
            // Extract Discord handle
            if (connection.connection_data.profile.username) {
              newBlakQube["Discord-Handle"] = connection.connection_data.profile.username;
            }
          }
        }
      }
      
      console.log('Updated BlakQube data:', newBlakQube);
      
      // Save updated BlakQube
      const { error: updateError } = await (supabase as any)
        .from('blak_qubes')
        .upsert({
          user_id: user.user.id,
          ...newBlakQube
        });
      
      if (updateError) {
        console.error('Error updating BlakQube:', updateError);
        return false;
      }
      
      console.log('BlakQube updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateBlakQubeFromConnections:', error);
      return false;
    }
  }
};
