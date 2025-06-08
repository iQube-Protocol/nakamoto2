
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ServiceType, connectionService } from '@/services/connection-service';
import { blakQubeService } from '@/services/blakqube-service';
import { toast } from 'sonner';

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
    wallet: false
  });
  const [connectionData, setConnectionData] = useState<Record<ServiceType, any>>({
    linkedin: null,
    twitter: null,
    telegram: null,
    discord: null,
    luma: null,
    wallet: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch connection status for all services
  const fetchConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user connections...');
      
      // Query user_connections table
      const { data, error: queryError } = await supabase
        .from('user_connections')
        .select('service, connected_at, connection_data')
        .eq('user_id', user.id);
      
      if (queryError) {
        console.error('Error fetching connections:', queryError);
        setError('Failed to load your connections. Please try again later.');
        setLoading(false);
        return;
      }
      
      console.log('Raw connection data:', data);
      
      // Reset all connections to false first
      const newConnections = {
        linkedin: false,
        twitter: false,
        telegram: false,
        discord: false,
        luma: false,
        wallet: false
      };

      const newConnectionData = {
        linkedin: null,
        twitter: null,
        telegram: null,
        discord: null,
        luma: null,
        wallet: null
      };
      
      // Update connections based on database results
      if (data) {
        data.forEach((connection: any) => {
          const serviceType = connection.service as ServiceType;
          if (Object.keys(newConnections).includes(serviceType)) {
            newConnections[serviceType] = true;
            newConnectionData[serviceType] = connection.connection_data;
            console.log(`${serviceType} is connected with data:`, connection.connection_data);
          }
        });
      }
      
      console.log('Final connections state:', newConnections);
      setConnections(newConnections);
      setConnectionData(newConnectionData);
    } catch (error) {
      console.error('Error in fetchConnections:', error);
      setError('An unexpected error occurred while loading your connections.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get wallet address from connection data
  const getWalletAddress = (): string | null => {
    return connectionData.wallet?.address || null;
  };
  
  // Connect a service
  const connectService = async (service: ServiceType): Promise<boolean> => {
    console.log(`Attempting to connect ${service}...`);
    
    if (service === 'wallet') {
      const success = await connectionService.connectWallet();
      if (success) {
        setConnections(prev => ({ ...prev, [service]: true }));
        // Update BlakQube data after wallet connection
        await blakQubeService.updateBlakQubeFromConnections();
        // Refresh connections to get the latest data
        await fetchConnections();
        // Trigger a refresh of the page data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      return success;
    } else {
      try {
        return await connectionService.startOAuthFlow(service);
      } catch (error) {
        console.error(`Error starting OAuth flow for ${service}:`, error);
        toast.error(`Failed to connect to ${service}. The service may not be configured properly.`);
        return false;
      }
    }
  };
  
  // Disconnect a service
  const disconnectService = async (service: ServiceType): Promise<boolean> => {
    try {
      const success = await connectionService.disconnectService(service);
      if (success) {
        setConnections(prev => ({ ...prev, [service]: false }));
        setConnectionData(prev => ({ ...prev, [service]: null }));
        // Refresh data after disconnection
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      return success;
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
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
  
  // Sync BlakQube data from connected service
  const syncBlakQubeData = async (service: ServiceType) => {
    console.log(`Syncing BlakQube data from ${service}...`);
    await blakQubeService.updateBlakQubeFromConnections();
    toast.success(`Data from ${service} synced to BlakQube`);
  };
  
  // Load connections when user changes
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);
  
  return {
    connections,
    connectionData,
    loading,
    error,
    connectService,
    disconnectService,
    toggleConnection,
    refreshConnections: fetchConnections,
    getWalletAddress
  };
}
