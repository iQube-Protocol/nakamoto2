import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { connectionStateManager } from './connection-state-manager';

export type ServiceType = 'linkedin' | 'twitter' | 'telegram' | 'discord' | 'luma' | 'wallet' | 'facebook' | 'youtube' | 'tiktok' | 'instagram';

class ConnectionService {
  // Enhanced Brave browser detection
  private detectBrave(): boolean {
    const userAgent = navigator.userAgent;
    const isBraveUA = userAgent.includes('Brave') || userAgent.includes('brave');
    const hasBraveAPI = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
    
    console.log('🔍 Browser Detection Details:', {
      userAgent,
      isBraveUA,
      hasBraveAPI,
      finalResult: isBraveUA || hasBraveAPI
    });
    
    return isBraveUA || hasBraveAPI;
  }

  isServiceConnecting(service: ServiceType): boolean {
    const state = connectionStateManager.getConnectionState(service);
    return state === 'connecting' || state === 'disconnecting' || state === 'redirecting';
  }

  async connectWallet(): Promise<boolean> {
    const service = 'wallet';
    
    if (!connectionStateManager.canAttemptConnection(service)) {
      toast.error('Too many connection attempts. Please wait before trying again.');
      return false;
    }

    if (this.isServiceConnecting(service)) {
      toast.error('Wallet connection is already in progress. Please wait.');
      return false;
    }

    connectionStateManager.setConnectionState(service, 'connecting');
    connectionStateManager.recordConnectionAttempt(service);

    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      // Start connection timeout
      connectionStateManager.startConnectionTimeout(service, () => {
        connectionStateManager.setConnectionState(service, 'error');
      });

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      connectionStateManager.clearConnectionTimeout(service);

      if (!accounts || accounts.length === 0) {
        toast.error('No accounts found in MetaMask. Please create or import an account.');
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      const address = accounts[0];
      console.log('✅ Wallet connected:', address);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to connect your wallet.');
        connectionStateManager.setConnectionState(service, 'error');
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
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      connectionStateManager.setConnectionState(service, 'connected');
      toast.success('Wallet connected successfully!');
      return true;
    } catch (error: any) {
      connectionStateManager.clearConnectionTimeout(service);
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Wallet connection rejected by user.');
        connectionStateManager.setConnectionState(service, 'idle');
      } else if (error.code === -32002) {
        toast.error('Wallet connection request already pending. Please check MetaMask.');
        connectionStateManager.setConnectionState(service, 'error');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
        connectionStateManager.setConnectionState(service, 'error');
      }
      return false;
    }
  }

  cleanupIncompleteOAuth() {
    console.log('🧹 Cleaning up OAuth localStorage...');
    // Clean up any OAuth state stored in localStorage
    const keysToRemove = [
      'oauth_state',
      'oauth_code_verifier',
      'oauth_redirect_uri',
      'oauth_service',
      'linkedin_oauth_state',
      'linkedin_connection_attempt',
      'supabase.auth.token'
    ];
    
    let removedKeys = 0;
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedKeys++;
        console.log(`🗑️ Removed localStorage key: ${key}`);
      }
    });
    
    console.log(`✅ OAuth cleanup complete. Removed ${removedKeys} keys.`);
  }

  async startOAuthFlow(service: ServiceType): Promise<boolean> {
    console.log(`🔄 Starting OAuth flow for ${service}...`);
    
    // Enhanced debugging at the start
    const isBrave = this.detectBrave();
    console.log(`🚀 OAuth Flow Started - Service: ${service}, Browser: ${isBrave ? 'Brave' : 'Other'}`);
    
    if (!connectionStateManager.canAttemptConnection(service)) {
      toast.error(`Too many ${service} connection attempts. Please wait before trying again.`);
      return false;
    }

    if (this.isServiceConnecting(service)) {
      toast.error(`${service} connection is already in progress. Please wait.`);
      return false;
    }

    // Immediately clean up any residual OAuth state
    this.cleanupIncompleteOAuth();
    connectionStateManager.cleanupOAuthState(service);

    connectionStateManager.setConnectionState(service, 'connecting');
    connectionStateManager.recordConnectionAttempt(service);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to connect services.');
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      // Handle LinkedIn OAuth using the custom edge function implementation
      if (service === 'linkedin') {
        try {
          console.log('🔗 LinkedIn OAuth flow started...');
          
          if (isBrave) {
            console.log('🛡️ Brave browser detected, using enhanced OAuth handling');
            console.log('🛡️ Brave Browser Environment Check:', {
              userAgent: navigator.userAgent,
              cookiesEnabled: navigator.cookieEnabled,
              localStorageAvailable: typeof Storage !== 'undefined',
              sessionStorageAvailable: typeof sessionStorage !== 'undefined',
              windowLocationOrigin: window.location.origin,
              currentUrl: window.location.href
            });
            
            // Test storage capabilities for Brave
            try {
              localStorage.setItem('brave_test', 'test');
              localStorage.removeItem('brave_test');
              console.log('🛡️ Brave: localStorage working');
            } catch (e) {
              console.error('🛡️ Brave: localStorage failed', e);
              toast.error('Brave: Local storage blocked. Please disable Shields for this site.');
              connectionStateManager.setConnectionState(service, 'error');
              return false;
            }
            
            try {
              sessionStorage.setItem('brave_test', 'test');
              sessionStorage.removeItem('brave_test');
              console.log('🛡️ Brave: sessionStorage working');
            } catch (e) {
              console.error('🛡️ Brave: sessionStorage failed', e);
            }
          }
          
          // Start connection timeout (extended for Brave)
          const timeoutMs = isBrave ? 45000 : 30000; // 45s for Brave, 30s for others
          console.log(`⏰ Setting connection timeout: ${timeoutMs}ms`);
          
          connectionStateManager.startConnectionTimeout(service, () => {
            console.log('⏰ LinkedIn connection timed out, cleaning up...');
            this.cleanupIncompleteOAuth();
            connectionStateManager.setConnectionState(service, 'error');
            if (isBrave) {
              toast.error('LinkedIn connection timed out. Try disabling Brave Shields for this site.');
            } else {
              toast.error('LinkedIn connection timed out. Please try again.');
            }
          });
          
          // Generate new OAuth state for security
          const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
          console.log('🔐 Generated OAuth state:', state);
          
          // Store OAuth state for security verification
          localStorage.setItem('oauth_state', state);
          localStorage.setItem('oauth_service', service);
          localStorage.setItem('linkedin_connection_attempt', Date.now().toString());
          
          if (isBrave) {
            console.log('🛡️ Brave: Storing additional OAuth state');
            connectionStateManager.storeOAuthState(service, 'connecting');
            // Also store in sessionStorage for Brave as backup
            try {
              sessionStorage.setItem('oauth_state_backup', state);
              sessionStorage.setItem('oauth_service_backup', service);
            } catch (e) {
              console.warn('🛡️ Brave: Could not store backup state in sessionStorage', e);
            }
          }
          
          // Call the LinkedIn connection edge function
          console.log('📡 Calling LinkedIn connection edge function...');
          const { data, error } = await supabase.functions.invoke('connect-linkedin', {
            body: { state }
          });

          if (error) {
            console.error('❌ LinkedIn connection service error:', error);
            toast.error('Failed to initialize LinkedIn connection. Please try again.');
            this.cleanupIncompleteOAuth();
            connectionStateManager.setConnectionState(service, 'error');
            return false;
          }

          if (data?.authUrl) {
            console.log('🔄 Redirecting to LinkedIn OAuth:', data.authUrl);
            
            if (isBrave) {
              console.log('🛡️ Brave: Testing LinkedIn URL accessibility...');
              
              // Test if URL is accessible before redirecting
              try {
                const testController = new AbortController();
                setTimeout(() => testController.abort(), 3000);
                
                fetch(data.authUrl, { 
                  method: 'HEAD', 
                  mode: 'no-cors',
                  signal: testController.signal 
                })
                  .then(() => console.log('🛡️ Brave: LinkedIn URL accessible'))
                  .catch(e => {
                    console.log('🛡️ Brave: LinkedIn URL may be blocked:', e);
                    toast.warning('If connection fails, try disabling Brave Shields for LinkedIn');
                  });
              } catch (e) {
                console.log('🛡️ Brave: URL test failed:', e);
              }
              
              // Add longer delay for Brave to process state changes
              console.log('🛡️ Brave: Adding processing delay before redirect...');
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Set to redirecting state and store it persistently
            connectionStateManager.setConnectionState(service, 'redirecting');
            connectionStateManager.storeOAuthState(service, 'redirecting');
            
            // Clear timeout before redirect (will be handled by OAuth callback)
            connectionStateManager.clearConnectionTimeout(service);
            
            // Add delay to ensure state is saved before redirect
            const redirectDelay = isBrave ? 500 : 150;
            console.log(`🚀 Redirecting to LinkedIn in ${redirectDelay}ms...`);
            
            setTimeout(() => {
              console.log('🌐 Executing redirect to LinkedIn OAuth URL...');
              if (isBrave) {
                console.log('🛡️ Brave: Final redirect attempt');
              }
              window.location.href = data.authUrl;
            }, redirectDelay);
            
            return true;
          } else {
            console.error('❌ No auth URL received from LinkedIn service');
            toast.error('Failed to get LinkedIn authorization URL. Please try again.');
            this.cleanupIncompleteOAuth();
            connectionStateManager.setConnectionState(service, 'error');
            return false;
          }
        } catch (error) {
          console.error('❌ Error calling LinkedIn connection service:', error);
          if (isBrave) {
            console.error('🛡️ Brave: LinkedIn OAuth failed:', error);
            toast.error('LinkedIn connection failed in Brave. Try disabling Shields or use a different browser.');
          } else {
            toast.error('Failed to connect to LinkedIn service. Please try again.');
          }
          this.cleanupIncompleteOAuth();
          connectionStateManager.setConnectionState(service, 'error');
          return false;
        }
      }

      // For other services, show "coming soon" for now
      connectionStateManager.setConnectionState(service, 'idle');
      toast.info(`${service} connection is coming soon!`);
      return false;

    } catch (error) {
      console.error(`❌ Error starting OAuth flow for ${service}:`, error);
      toast.error(`Failed to connect to ${service}. Please try again.`);
      this.cleanupIncompleteOAuth();
      connectionStateManager.setConnectionState(service, 'error');
      return false;
    }
  }

  async disconnectService(service: ServiceType): Promise<boolean> {
    console.log(`🔌 Disconnecting ${service}...`);
    connectionStateManager.setConnectionState(service, 'disconnecting');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to disconnect services.');
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('service', service);

      if (error) {
        console.error(`❌ Error disconnecting ${service}:`, error);
        toast.error(`Failed to disconnect ${service}. Please try again.`);
        connectionStateManager.setConnectionState(service, 'error');
        return false;
      }

      // Clean up any OAuth state for this service
      if (service === 'linkedin') {
        this.cleanupIncompleteOAuth();
      }

      console.log(`✅ ${service} disconnected successfully`);
      toast.success(`${service} disconnected successfully!`);
      connectionStateManager.setConnectionState(service, 'idle');
      return true;
    } catch (error) {
      console.error(`❌ Error disconnecting ${service}:`, error);
      toast.error(`Failed to disconnect ${service}. Please try again.`);
      connectionStateManager.setConnectionState(service, 'error');
      return false;
    }
  }

  // Add manual reset function for stuck connections
  resetConnection(service: ServiceType) {
    console.log(`🔄 Manually resetting connection for ${service}`);
    connectionStateManager.resetConnectionState(service);
    this.cleanupIncompleteOAuth();
    toast.info(`${service} connection state has been reset.`);
  }

  // Add method to check and clean stale OAuth attempts
  checkAndCleanStaleOAuth() {
    const attempt = localStorage.getItem('linkedin_connection_attempt');
    if (attempt) {
      const attemptTime = parseInt(attempt);
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (now - attemptTime > maxAge) {
        console.log('🧹 Cleaning up stale LinkedIn OAuth attempt');
        this.cleanupIncompleteOAuth();
        connectionStateManager.resetConnectionState('linkedin');
      }
    }
  }
}

export const connectionService = new ConnectionService();
