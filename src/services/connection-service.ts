
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceType = 'linkedin' | 'twitter' | 'telegram' | 'discord' | 'luma' | 'wallet' | 'facebook' | 'youtube' | 'tiktok' | 'instagram';

interface ConnectionState {
  [key: string]: boolean;
}

class ConnectionService {
  private connectingServices: ConnectionState = {};

  isServiceConnecting(service: ServiceType): boolean {
    return this.connectingServices[service] || false;
  }

  private setServiceConnecting(service: ServiceType, connecting: boolean) {
    this.connectingServices[service] = connecting;
  }

  async connectWallet(): Promise<boolean> {
    if (this.isServiceConnecting('wallet')) {
      return false;
    }

    this.setServiceConnecting('wallet', true);

    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found in MetaMask. Please create or import an account.');
        return false;
      }

      const address = accounts[0];
      console.log('Wallet connected:', address);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to connect your wallet.');
        return false;
      }

      // Save connection to database
      const { error } = await supabase
        .from('user_connections')
        .upsert({
          user_id: user.id,
          service: 'wallet',
          connection_data: {
            address: address,
            connectedAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Error saving wallet connection:', error);
        toast.error('Failed to save wallet connection. Please try again.');
        return false;
      }

      toast.success('Wallet connected successfully!');
      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Wallet connection rejected by user.');
      } else if (error.code === -32002) {
        toast.error('Wallet connection request already pending. Please check MetaMask.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      return false;
    } finally {
      this.setServiceConnecting('wallet', false);
    }
  }

  cleanupIncompleteOAuth() {
    // Clean up any OAuth state stored in localStorage
    const keysToRemove = [
      'oauth_state',
      'oauth_code_verifier',
      'oauth_redirect_uri',
      'oauth_service'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  async startOAuthFlow(service: ServiceType): Promise<boolean> {
    if (this.isServiceConnecting(service)) {
      return false;
    }

    this.setServiceConnecting(service, true);

    try {
      // Clean up any previous OAuth attempts
      this.cleanupIncompleteOAuth();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to connect services.');
        return false;
      }

      // Handle LinkedIn OAuth using Supabase's built-in provider
      if (service === 'linkedin') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'linkedin_oidc',
          options: {
            redirectTo: `${window.location.origin}/settings?tab=connections`,
            scopes: 'openid profile email'
          }
        });

        if (error) {
          console.error('LinkedIn OAuth error:', error);
          toast.error('Failed to connect to LinkedIn. Please try again.');
          return false;
        }

        // The OAuth flow will handle the redirect
        return true;
      }

      // For other services, show "coming soon" for now
      toast.info(`${service} connection is coming soon!`);
      return false;

    } catch (error) {
      console.error(`Error starting OAuth flow for ${service}:`, error);
      toast.error(`Failed to connect to ${service}. Please try again.`);
      return false;
    } finally {
      this.setServiceConnecting(service, false);
    }
  }

  async disconnectService(service: ServiceType): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to disconnect services.');
        return false;
      }

      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('service', service);

      if (error) {
        console.error(`Error disconnecting ${service}:`, error);
        toast.error(`Failed to disconnect ${service}. Please try again.`);
        return false;
      }

      toast.success(`${service} disconnected successfully!`);
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
      toast.error(`Failed to disconnect ${service}. Please try again.`);
      return false;
    }
  }
}

export const connectionService = new ConnectionService();
