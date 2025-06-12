import { supabase } from '@/integrations/supabase/client';
import { BlakQube } from '@/lib/types';
import { toast } from 'sonner';

interface PrivateData {
  [key: string]: string | string[];
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
      const blakQubeData: Partial<BlakQube> = {
        "First-Name": data["First-Name"] as string || "",
        "Last-Name": data["Last-Name"] as string || "",
        "Qrypto-ID": data["Qrypto-ID"] as string || "",
        "Profession": data["Profession"] as string || "",
        "Local-City": data["Local-City"] as string || "",
        "Email": data["Email"] as string || "",
        "LinkedIn-ID": data["LinkedIn-ID"] as string || "",
        "LinkedIn-Profile-URL": data["LinkedIn-Profile-URL"] as string || "",
        "Twitter-Handle": data["Twitter-Handle"] as string || "",
        "Telegram-Handle": data["Telegram-Handle"] as string || "",
        "Discord-Handle": data["Discord-Handle"] as string || "",
        "Instagram-Handle": data["Instagram-Handle"] as string || "",
        "GitHub-Handle": data["GitHub-Handle"] as string || "",
        "YouTube-ID": data["YouTube-ID"] as string || "",
        "Facebook-ID": data["Facebook-ID"] as string || "",
        "TikTok-Handle": data["TikTok-Handle"] as string || "",
        "Web3-Interests": Array.isArray(data["Web3-Interests"]) ? data["Web3-Interests"] as string[] : [],
        "EVM-Public-Key": data["EVM-Public-Key"] as string || "",
        "BTC-Public-Key": data["BTC-Public-Key"] as string || "",
        "ThirdWeb-Public-Key": data["ThirdWeb-Public-Key"] as string || "",
        "Tokens-of-Interest": Array.isArray(data["Tokens-of-Interest"]) ? data["Tokens-of-Interest"] as string[] : [],
        "Chain-IDs": Array.isArray(data["Chain-IDs"]) ? data["Chain-IDs"] as string[] : [],
        "Wallets-of-Interest": Array.isArray(data["Wallets-of-Interest"]) ? data["Wallets-of-Interest"] as string[] : []
      };
      
      console.log('Converted BlakQube data for save:', blakQubeData);
      
      // First try to update existing record
      const { data: updateResult, error: updateError } = await (supabase as any)
        .from('blak_qubes')
        .update({
          ...blakQubeData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .select();
      
      // If no rows were updated (user doesn't have a BlakQube yet), insert a new one
      if (updateResult && updateResult.length === 0) {
        console.log('No existing BlakQube found, inserting new record');
        const { error: insertError } = await (supabase as any)
          .from('blak_qubes')
          .insert({
            user_id: user.user.id,
            ...blakQubeData,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting new BlakQube data:', insertError);
          return false;
        }
      } else if (updateError) {
        console.error('Error updating BlakQube data:', updateError);
        return false;
      }
      
      console.log('Manual BlakQube data saved successfully');
      return true;
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
      
      // Start with existing BlakQube or create new one with all fields including new ones
      const newBlakQube: Partial<BlakQube> = blakQube ? { ...blakQube } : {
        "First-Name": "",
        "Last-Name": "",
        "Qrypto-ID": "",
        "Profession": "",
        "Web3-Interests": [],
        "Local-City": "",
        "Email": user.user.email || "",
        "EVM-Public-Key": "",
        "BTC-Public-Key": "",
        "ThirdWeb-Public-Key": "",
        "Tokens-of-Interest": [],
        "Chain-IDs": [],
        "Wallets-of-Interest": [],
        "LinkedIn-ID": "",
        "LinkedIn-Profile-URL": "",
        "Twitter-Handle": "",
        "Telegram-Handle": "",
        "Discord-Handle": "",
        "Instagram-Handle": "",
        "GitHub-Handle": "",
        "YouTube-ID": "",
        "Facebook-ID": "",
        "TikTok-Handle": ""
      };
      
      // Update BlakQube based on connections
      if (connections) {
        for (const connection of connections) {
          console.log('Processing connection:', connection.service, connection.connection_data);
          
          if (connection.service === 'linkedin' && connection.connection_data?.profile) {
            console.log('Processing LinkedIn connection data:', connection.connection_data.profile);
            
            // Extract LinkedIn profile data
            const profile = connection.connection_data.profile;
            const email = connection.connection_data.email;
            
            // CRITICAL FIX: Extract first name and last name properly from the available data
            if (profile.firstName) {
              newBlakQube["First-Name"] = profile.firstName;
              console.log('Set First-Name from LinkedIn:', profile.firstName);
            }
            
            if (profile.lastName) {
              newBlakQube["Last-Name"] = profile.lastName;
              console.log('Set Last-Name from LinkedIn:', profile.lastName);
            }
            
            // Extract LinkedIn ID properly (should be the actual LinkedIn user ID)
            if (profile.id) {
              newBlakQube["LinkedIn-ID"] = profile.id;
              console.log('Set LinkedIn ID:', profile.id);
            }
            
            // Extract the LinkedIn profile URL - handle multiple possible formats
            let profileUrl = null;
            if (profile.publicProfileUrl) {
              profileUrl = profile.publicProfileUrl;
              console.log('Using publicProfileUrl:', profileUrl);
            } else if (profile.profileUrl) {
              profileUrl = profile.profileUrl;
              console.log('Using profileUrl:', profileUrl);
            } else if (profile.vanityName) {
              profileUrl = `https://www.linkedin.com/in/${profile.vanityName}`;
              console.log('Constructed URL from vanityName:', profileUrl);
            } else if (profile.id) {
              // Fallback to ID-based URL if no other options
              profileUrl = `https://www.linkedin.com/in/${profile.id}`;
              console.log('Constructed URL from ID:', profileUrl);
            }
            
            if (profileUrl) {
              newBlakQube["LinkedIn-Profile-URL"] = profileUrl;
              console.log('Set LinkedIn Profile URL:', profileUrl);
            }
            
            // Use email from LinkedIn if available and not already set
            if (email && (!newBlakQube["Email"] || newBlakQube["Email"] === user.user.email)) {
              newBlakQube["Email"] = email;
              console.log('Set Email from LinkedIn:', email);
            }
            
            // Set profession from headline if available
            if (profile.headline && !newBlakQube["Profession"]) {
              newBlakQube["Profession"] = profile.headline;
              console.log('Set Profession from LinkedIn headline:', profile.headline);
            }
            
            // Extract location from various possible fields
            let locationName = null;
            if (profile.locationName) {
              locationName = profile.locationName;
            } else if (profile.location?.name) {
              locationName = profile.location.name;
            } else if (profile.location?.preferredGeoPlace?.name) {
              locationName = profile.location.preferredGeoPlace.name;
            }
            
            if (locationName && !newBlakQube["Local-City"]) {
              newBlakQube["Local-City"] = locationName;
              console.log('Set Local City from LinkedIn:', locationName);
            }
            
            // Enhanced Web3 interest detection from industry
            const industryName = profile.industryName || profile.industry;
            if (industryName) {
              const industry = industryName.toLowerCase();
              const web3Keywords = [
                'blockchain', 'crypto', 'cryptocurrency', 'web3', 'defi', 'decentralized finance',
                'nft', 'non-fungible token', 'bitcoin', 'ethereum', 'fintech', 'financial technology',
                'digital assets', 'smart contracts', 'dapp', 'decentralized', 'tokenization'
              ];
              
              if (web3Keywords.some(keyword => industry.includes(keyword))) {
                const currentInterests = newBlakQube["Web3-Interests"] || [];
                if (!currentInterests.includes(industryName)) {
                  newBlakQube["Web3-Interests"] = [...currentInterests, industryName];
                  console.log('Added Web3 interest from LinkedIn industry:', industryName);
                }
              }
            }
            
            // Extract skills if they're Web3 related (if available in future API versions)
            if (profile.skills && Array.isArray(profile.skills)) {
              const web3Skills = profile.skills.filter((skill: string) => {
                const skillLower = skill.toLowerCase();
                return skillLower.includes('blockchain') || skillLower.includes('crypto') || 
                       skillLower.includes('web3') || skillLower.includes('smart contract') ||
                       skillLower.includes('solidity') || skillLower.includes('defi') ||
                       skillLower.includes('nft') || skillLower.includes('ethereum') ||
                       skillLower.includes('bitcoin');
              });
              
              if (web3Skills.length > 0) {
                const currentInterests = newBlakQube["Web3-Interests"] || [];
                const uniqueInterests = [...new Set([...currentInterests, ...web3Skills])];
                newBlakQube["Web3-Interests"] = uniqueInterests;
                console.log('Added Web3 interests from LinkedIn skills:', web3Skills);
              }
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
            
            // Add common tokens of interest for wallet connections
            const commonTokens = ["ETH", "BTC", "USDC", "USDT"];
            const currentTokens = newBlakQube["Tokens-of-Interest"] || [];
            const newTokens = commonTokens.filter(token => !currentTokens.includes(token));
            if (newTokens.length > 0) {
              newBlakQube["Tokens-of-Interest"] = [...currentTokens, ...newTokens];
              console.log('Added common tokens of interest:', newTokens);
            }
          }
          
          if (connection.service === 'thirdweb' && connection.connection_data?.address) {
            console.log('Setting ThirdWeb public key:', connection.connection_data.address);
            newBlakQube["ThirdWeb-Public-Key"] = connection.connection_data.address;
            
            // Add ThirdWeb to wallets of interest if not already there
            if (!newBlakQube["Wallets-of-Interest"]?.includes("ThirdWeb")) {
              newBlakQube["Wallets-of-Interest"] = [
                ...(newBlakQube["Wallets-of-Interest"] || []),
                "ThirdWeb"
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
          
          if (connection.service === 'facebook' && connection.connection_data?.profile) {
            // Extract Facebook ID
            if (connection.connection_data.profile.id) {
              newBlakQube["Facebook-ID"] = connection.connection_data.profile.id;
            }
          }
          
          if (connection.service === 'youtube' && connection.connection_data?.profile) {
            // Extract YouTube ID
            if (connection.connection_data.profile.id) {
              newBlakQube["YouTube-ID"] = connection.connection_data.profile.id;
            }
          }
          
          if (connection.service === 'tiktok' && connection.connection_data?.profile) {
            // Extract TikTok handle
            if (connection.connection_data.profile.username) {
              newBlakQube["TikTok-Handle"] = `@${connection.connection_data.profile.username}`;
            }
          }
        }
      }
      
      console.log('Updated BlakQube data:', newBlakQube);
      
      // Save updated BlakQube using the same logic as manual save
      const { data: updateResult, error: updateError } = await (supabase as any)
        .from('blak_qubes')
        .update({
          ...newBlakQube,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .select();
      
      // If no rows were updated (user doesn't have a BlakQube yet), insert a new one
      if (updateResult && updateResult.length === 0) {
        console.log('No existing BlakQube found, inserting new record for connections update');
        const { error: insertError } = await (supabase as any)
          .from('blak_qubes')
          .insert({
            user_id: user.user.id,
            ...newBlakQube,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting BlakQube from connections:', insertError);
          return false;
        }
      } else if (updateError) {
        console.error('Error updating BlakQube from connections:', updateError);
        return false;
      }
      
      console.log('BlakQube updated successfully from connections');
      return true;
    } catch (error) {
      console.error('Error in updateBlakQubeFromConnections:', error);
      return false;
    }
  }
};
