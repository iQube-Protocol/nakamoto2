
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceType = 'linkedin' | 'twitter' | 'telegram' | 'discord' | 'luma' | 'wallet';

// Track active OAuth flows to prevent duplicates
const activeOAuthFlows = new Set<ServiceType>();

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
      
      // Prevent duplicate OAuth flows
      if (activeOAuthFlows.has(service)) {
        console.log(`OAuth flow for ${service} already in progress, skipping`);
        toast.error(`${service} connection is already in progress. Please wait.`);
        return false;
      }
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        toast.error('You must be logged in to connect services.');
        return false;
      }
      
      // Validate service is supported
      if (service !== 'linkedin') {
        console.error(`Service ${service} OAuth not yet implemented`);
        toast.error(`${service} connection is not yet available. Coming soon!`);
        return false;
      }
      
      // Mark OAuth flow as active
      activeOAuthFlows.add(service);
      
      console.log(`Calling connect-${service} edge function...`);
      
      // Call a Supabase Edge Function to get an OAuth URL
      const { data, error } = await supabase.functions.invoke(`connect-${service}`, {
        body: { 
          redirectUrl: `${window.location.origin}/oauth-callback?service=${service}` 
        }
      });
      
      if (error) {
        console.error(`Error starting ${service} OAuth flow:`, error);
        
        // Clean up active flow tracking
        activeOAuthFlows.delete(service);
        
        // Provide specific error messages based on the error type
        if (error.message?.includes('not configured')) {
          toast.error(`${service} connection is not properly configured. Please contact support.`);
        } else if (error.message?.includes('not found')) {
          toast.error(`${service} connection service is currently unavailable. Please try again later.`);
        } else {
          toast.error(`Failed to connect to ${service}. Please try again in a few moments.`);
        }
        return false;
      }
      
      console.log(`OAuth response for ${service}:`, data);
      
      // Validate response and redirect to OAuth provider
      if (data?.authUrl && typeof data.authUrl === 'string') {
        console.log(`Redirecting to: ${data.authUrl}`);
        
        // Store connection attempt in localStorage for recovery
        const connectionAttempt = {
          service,
          timestamp: Date.now(),
          userId: user.id
        };
        localStorage.setItem('oauth_attempt', JSON.stringify(connectionAttempt));
        
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
        return true;
      } else {
        console.error(`Invalid authUrl received from ${service} service:`, data);
        activeOAuthFlows.delete(service);
        toast.error(`Invalid response from ${service} connection service. Please try again.`);
        return false;
      }
    } catch (error) {
      console.error(`Unexpected error in ${service} connection:`, error);
      
      // Clean up any stored connection attempt and active flow tracking
      activeOAuthFlows.delete(service);
      localStorage.removeItem('oauth_attempt');
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          toast.error(`Network error connecting to ${service}. Please check your connection and try again.`);
        } else {
          toast.error(`An unexpected error occurred: ${error.message}`);
        }
      } else {
        toast.error(`Failed to connect to ${service}. Please try again.`);
      }
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
      
      // Clean up any stored connection attempts and active flow tracking
      activeOAuthFlows.delete(service);
      const storedAttempt = localStorage.getItem('oauth_attempt');
      if (storedAttempt) {
        try {
          const attempt = JSON.parse(storedAttempt);
          if (attempt.service === service && attempt.userId === userId) {
            localStorage.removeItem('oauth_attempt');
          }
        } catch (e) {
          // Clean up invalid stored attempts
          localStorage.removeItem('oauth_attempt');
        }
      }
      
      toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected successfully.`);
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
      toast.error(`Failed to disconnect ${service}.`);
      return false;
    }
  },

  /**
   * Check for incomplete OAuth attempts and clean them up
   */
  cleanupIncompleteOAuth: () => {
    try {
      const storedAttempt = localStorage.getItem('oauth_attempt');
      if (storedAttempt) {
        const attempt = JSON.parse(storedAttempt);
        const timeDiff = Date.now() - attempt.timestamp;
        
        // Clean up attempts older than 10 minutes and clear active flows
        if (timeDiff > 10 * 60 * 1000) {
          localStorage.removeItem('oauth_attempt');
          activeOAuthFlows.delete(attempt.service);
          console.log('Cleaned up old OAuth attempt');
        }
      }
      
      // Clear any stale active flows on app start
      activeOAuthFlows.clear();
    } catch (e) {
      // Clean up invalid stored attempts
      localStorage.removeItem('oauth_attempt');
      activeOAuthFlows.clear();
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
