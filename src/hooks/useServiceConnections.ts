import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ServiceType, connectionService } from '@/services/connection-service';
import { blakQubeService } from '@/services/blakqube-service';
import { toast } from 'sonner';
import { connectionStateManager } from '@/services/connection-state-manager';

export interface ServiceConnection {
  service: ServiceType;
  connected: boolean;
  connectedAt?: string;
  connectionData?: any;
}

export function useServiceConnections() {
  const [connections, setConnections] = useState<Record<ServiceType, boolean>>({
    linkedin: false,
    twitter: false,
    telegram: false,
    discord: false,
    luma: false,
    wallet: false,
    facebook: false,
    youtube: false,
    tiktok: false,
    instagram: false
  });
  const [connectionData, setConnectionData] = useState<Record<ServiceType, any>>({
    linkedin: null,
    twitter: null,
    telegram: null,
    discord: null,
    luma: null,
    wallet: null,
    facebook: null,
    youtube: null,
    tiktok: null,
    instagram: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch connection status for all services
  const fetchConnections = async (showLoading = true) => {
    if (!user) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log('🔄 Fetching user connections...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data, error: queryError } = await supabase
        .from('user_connections')
        .select('service, connected_at, connection_data')
        .eq('user_id', user.id);
      
      clearTimeout(timeoutId);
      
      if (queryError) {
        console.error('Error fetching connections:', queryError);
        setError('Failed to load your connections. Please try again later.');
        if (showLoading) {
          setLoading(false);
        }
        return;
      }
      
      console.log('✅ Raw connection data:', data);
      
      // Reset all connections to false first
      const newConnections = {
        linkedin: false,
        twitter: false,
        telegram: false,
        discord: false,
        luma: false,
        wallet: false,
        facebook: false,
        youtube: false,
        tiktok: false,
        instagram: false
      };

      const newConnectionData = {
        linkedin: null,
        twitter: null,
        telegram: null,
        discord: null,
        luma: null,
        wallet: null,
        facebook: null,
        youtube: null,
        tiktok: null,
        instagram: null
      };
      
      // Update connections based on database results
      if (data) {
        data.forEach((connection: any) => {
          const serviceType = connection.service as ServiceType;
          if (Object.keys(newConnections).includes(serviceType)) {
            newConnections[serviceType] = true;
            newConnectionData[serviceType] = connection.connection_data;
            // Update connection state manager
            connectionStateManager.setConnectionState(serviceType, 'connected');
            console.log(`✅ ${serviceType} is connected with data:`, connection.connection_data);
          }
        });
      }
      
      console.log('✅ Final connections state:', newConnections);
      setConnections(newConnections);
      setConnectionData(newConnectionData);
    } catch (error) {
      console.error('❌ Error in fetchConnections:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred while loading your connections.');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  // Get wallet address from connection data
  const getWalletAddress = (): string | null => {
    return connectionData.wallet?.address || null;
  };
  
  // Connect a service with optimistic updates
  const connectService = async (service: ServiceType): Promise<boolean> => {
    console.log(`🔄 Attempting to connect ${service}...`);
    
    try {
      let success = false;
      
      if (service === 'wallet') {
        success = await connectionService.connectWallet();
        if (success) {
          // Optimistic update
          setConnections(prev => ({ ...prev, [service]: true }));
          
          // Update BlakQube data after wallet connection
          console.log('💰 Wallet connected, updating BlakQube...');
          const qryptoUpdateSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
          const knytUpdateSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
          
          // Refresh connections to get the latest data
          await fetchConnections(false);
          
          // Dispatch custom event
          const event = new CustomEvent('privateDataUpdated');
          window.dispatchEvent(event);
        }
      } else {
        try {
          // Clean up any stale OAuth attempts before starting new one
          if (service === 'linkedin') {
            connectionService.checkAndCleanStaleOAuth();
          }
          
          success = await connectionService.startOAuthFlow(service);
          if (success && service === 'linkedin') {
            // For LinkedIn, the redirect happens immediately, so we don't update state here
            console.log('🔗 LinkedIn OAuth redirect initiated...');
          }
        } catch (error) {
          console.error(`❌ Error starting OAuth flow for ${service}:`, error);
          
          if (error instanceof Error) {
            if (error.message.includes('not configured')) {
              toast.error(`${service} connection is not properly configured. Please contact support.`);
            } else if (error.message.includes('Network')) {
              toast.error(`Network error connecting to ${service}. Please check your connection.`);
            } else {
              toast.error(`Failed to connect to ${service}: ${error.message}`);
            }
          } else {
            toast.error(`Failed to connect to ${service}. Please try again.`);
          }
          return false;
        }
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error connecting ${service}:`, error);
      toast.error(`Failed to connect to ${service}. Please try again.`);
      return false;
    }
  };
  
  // Disconnect a service with optimistic updates
  const disconnectService = async (service: ServiceType): Promise<boolean> => {
    try {
      // Optimistic update - immediately update UI
      setConnections(prev => ({ ...prev, [service]: false }));
      setConnectionData(prev => ({ ...prev, [service]: null }));
      
      const success = await connectionService.disconnectService(service);
      if (success) {
        // Refresh data after successful disconnection
        await fetchConnections(false);
        
        // Dispatch custom event
        const event = new CustomEvent('privateDataUpdated');
        window.dispatchEvent(event);
      } else {
        // Revert optimistic update on failure
        await fetchConnections(false);
      }
      return success;
    } catch (error) {
      console.error(`❌ Error disconnecting ${service}:`, error);
      // Revert optimistic update on error
      await fetchConnections(false);
      toast.error(`Failed to disconnect from ${service}. Please try again.`);
      return false;
    }
  };
  
  // Toggle connection state
  const toggleConnection = async (service: ServiceType): Promise<boolean> => {
    if (connections[service]) {
      return disconnectService(service);
    } else {
      return connectService(service);
    }
  };
  
  // Check if a service is currently being processed
  const isServiceProcessing = (service: ServiceType): boolean => {
    const state = connectionStateManager.getConnectionState(service);
    return state === 'connecting' || state === 'disconnecting' || state === 'redirecting';
  };
  
  // Load connections when user changes
  useEffect(() => {
    if (user) {
      fetchConnections();
      
      // Clean up any incomplete OAuth attempts on load
      connectionService.cleanupIncompleteOAuth();
      connectionService.checkAndCleanStaleOAuth();
    }
  }, [user]);
  
  // Set up connection recovery on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Detect Brave browser for enhanced cleanup
        const isBrave = (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
        if (isBrave) {
          console.log('🛡️ Brave browser: Enhanced OAuth cleanup on visibility change');
          // Force cleanup of any stuck states in Brave
          Object.keys(connections).forEach(service => {
            const state = connectionStateManager.getConnectionState(service as ServiceType);
            if (state === 'connecting' || state === 'redirecting') {
              console.log(`🛡️ Brave: Resetting stuck ${service} state`);
              connectionStateManager.setConnectionState(service as ServiceType, 'idle');
            }
          });
        }
        
        // Clean up stale OAuth attempts when page becomes visible
        connectionService.checkAndCleanStaleOAuth();
        
        // Refresh connections when page becomes visible
        setTimeout(() => {
          fetchConnections(false);
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, connections]);

  // Listen for connection update events from OAuth callback
  useEffect(() => {
    const handleConnectionsUpdated = () => {
      console.log('🔄 Connections updated event received, refreshing...');
      fetchConnections(false);
    };

    window.addEventListener('connectionsUpdated', handleConnectionsUpdated);
    return () => window.removeEventListener('connectionsUpdated', handleConnectionsUpdated);
  }, []);
  
  return {
    connections,
    connectionData,
    loading,
    error,
    connectService,
    disconnectService,
    toggleConnection,
    refreshConnections: fetchConnections,
    getWalletAddress,
    isServiceProcessing
  };
}
