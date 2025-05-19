
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceType = 'linkedin' | 'twitter' | 'telegram' | 'discord' | 'luma' | 'wallet';

// Helper function to create a typed query builder for tables not in the Supabase types
function createSupabaseQueryBuilder<T = any>(tableName: string) {
  return supabase.from(tableName as any) as any;
}

/**
 * Service for managing external service connections
 */
export const connectionService = {
  /**
   * Initialize OAuth flow for a service
   */
  startOAuthFlow: async (service: ServiceType): Promise<boolean> => {
    try {
      // In a real implementation, we would call a Supabase Edge Function to get an OAuth URL
      // For now, we'll simulate this process
      
      const { data, error } = await supabase.functions.invoke(`connect-${service}`, {
        body: { redirectUrl: `${window.location.origin}/settings?tab=connections` }
      });
      
      if (error) {
        console.error(`Error starting ${service} OAuth flow:`, error);
        toast.error(`Failed to connect to ${service}. Please try again.`);
        return false;
      }
      
      // Redirect to OAuth provider
      if (data?.authUrl) {
        window.location.href = data.authUrl;
        return true;
      } else {
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
      // Check if Web3 provider exists
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          
          // Save wallet connection to Supabase
          const { error } = await createSupabaseQueryBuilder('user_connections')
            .upsert({
              user_id: (await supabase.auth.getUser()).data.user?.id,
              service: 'wallet',
              connected_at: new Date().toISOString(),
              connection_data: { address: walletAddress }
            });
          
          if (error) {
            console.error('Error saving wallet connection:', error);
            toast.error('Failed to save wallet connection.');
            return false;
          }
          
          toast.success('Wallet connected successfully!');
          return true;
        }
      } else {
        toast.error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  },
  
  /**
   * Disconnect a service
   */
  disconnectService: async (service: ServiceType): Promise<boolean> => {
    try {
      const userResult = await supabase.auth.getUser();
      const userId = userResult.data.user?.id;
      
      if (!userId) {
        toast.error('You must be logged in to disconnect services.');
        return false;
      }
      
      const { error } = await createSupabaseQueryBuilder('user_connections')
        .delete()
        .eq('user_id', userId)
        .eq('service', service);
      
      if (error) {
        console.error(`Error disconnecting ${service}:`, error);
        toast.error(`Failed to disconnect ${service}.`);
        return false;
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
