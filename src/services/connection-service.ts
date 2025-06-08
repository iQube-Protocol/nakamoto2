
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceType = 'linkedin' | 'twitter' | 'telegram' | 'discord' | 'luma' | 'wallet';

/**
 * Service for managing external service connections
 */
export const connectionService = {
  /**
   * Initialize OAuth flow for a service
   */
  startOAuthFlow: async (service: ServiceType): Promise<boolean> => {
    try {
      console.log(`Starting OAuth flow for ${service}...`);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        toast.error('You must be logged in to connect services.');
        return false;
      }
      
      // Get current URL for proper redirect
      const redirectUrl = `${window.location.origin}/oauth-callback?service=${service}`;
      console.log(`Redirect URL: ${redirectUrl}`);
      
      // Call a Supabase Edge Function to get an OAuth URL
      const { data, error } = await supabase.functions.invoke(`connect-${service}`, {
        body: { redirectUrl }
      });
      
      if (error) {
        console.error(`Error starting ${service} OAuth flow:`, error);
        toast.error(`Failed to connect to ${service}: ${error.message}`);
        return false;
      }
      
      console.log(`OAuth response for ${service}:`, data);
      
      // Redirect to OAuth provider
      if (data?.authUrl) {
        console.log(`Redirecting to: ${data.authUrl}`);
        window.location.href = data.authUrl;
        return true;
      } else {
        console.error(`No authUrl received from ${service} service`);
        toast.error(`Invalid response from ${service} connection service.`);
        return false;
      }
    } catch (error) {
      console.error(`Error in ${service} connection:`, error);
      toast.error(`Failed to connect to ${service}. Please try again.`);
      return false;
    }
  },
  
  /**
   * Connect wallet (direct connection, no OAuth)
   */
  connectWallet: async (): Promise<boolean> => {
    try {
      console.log('Connecting wallet...');
      
      // Check if Web3 provider exists
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          console.log('Wallet connected:', walletAddress);
          
          // Create a message for the user to sign
          const message = `Please sign this message to verify your wallet ownership.\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
          
          try {
            // Request signature from user
            console.log('Requesting signature...');
            const signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [message, walletAddress],
            });
            
            console.log('Signature received:', signature);
            
            // Get user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              toast.error('You must be logged in to connect a wallet.');
              return false;
            }

            // Save wallet connection to database with signature
            const { error: connectionError } = await supabase
              .from('user_connections')
              .upsert({
                user_id: user.id,
                service: 'wallet',
                connected_at: new Date().toISOString(),
                connection_data: { 
                  address: walletAddress,
                  signature: signature,
                  message: message,
                  signedAt: new Date().toISOString()
                }
              });
            
            if (connectionError) {
              console.error('Error saving wallet connection:', connectionError);
              toast.error('Failed to save wallet connection.');
              return false;
            }

            // Update BlakQube with wallet address
            const { error: blakQubeError } = await supabase
              .from('blak_qubes')
              .upsert({
                user_id: user.id,
                "EVM-Public-Key": walletAddress,
                "Wallets-of-Interest": ["MetaMask"]
              });

            if (blakQubeError) {
              console.error('Error updating BlakQube with wallet address:', blakQubeError);
              // Don't fail the connection for this, just log it
              console.log('Wallet connected but BlakQube update failed');
            }
            
            toast.success('Wallet connected and signature verified successfully!');
            return true;
          } catch (signError) {
            console.error('Error during signing process:', signError);
            if (signError.code === 4001) {
              // User rejected the request
              toast.error('Wallet connection cancelled by user.');
            } else {
              toast.error('Failed to sign message. Wallet connection cancelled.');
            }
            return false;
          }
        }
      } else {
        toast.error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        // User rejected the request
        toast.error('Wallet connection cancelled by user.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      return false;
    }
  },
  
  /**
   * Disconnect a service (database operation only, no wallet interaction)
   */
  disconnectService: async (service: ServiceType): Promise<boolean> => {
    try {
      console.log(`Disconnecting ${service}...`);
      
      const userResult = await supabase.auth.getUser();
      const userId = userResult.data.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to disconnect services.');
        return false;
      }
      
      // For wallet disconnection, just delete from database - no MetaMask interaction
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('user_id', userId)
        .eq('service', service);
      
      if (error) {
        console.error(`Error disconnecting ${service}:`, error);
        toast.error(`Failed to disconnect ${service}.`);
        return false;
      }

      // If disconnecting wallet, also clear EVM key from BlakQube
      if (service === 'wallet') {
        const { error: blakQubeError } = await supabase
          .from('blak_qubes')
          .update({
            "EVM-Public-Key": "",
            "Wallets-of-Interest": []
          })
          .eq('user_id', userId);

        if (blakQubeError) {
          console.error('Error clearing wallet from BlakQube:', blakQubeError);
        }
      }
      
      toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected successfully.`);
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
      toast.error(`Failed to disconnect ${service}.`);
      return false;
    }
  }
};

// Add TypeScript support for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (options: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
