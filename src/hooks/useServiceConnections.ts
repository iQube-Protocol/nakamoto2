
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ServiceType, connectionService } from '@/services/connection-service';
import { UserConnection } from '@/types/supabase';
import { toast } from 'sonner';

export interface ServiceConnection {
  service: ServiceType;
  connected: boolean;
  connectedAt?: string;
  connectionData?: any;
}

// Helper function to create a typed query builder for tables not in the Supabase types
function createSupabaseQueryBuilder<T = any>(tableName: string) {
  return supabase.from(tableName) as any;
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch connection status for all services
  const fetchConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use our custom query builder to avoid TypeScript errors with tables not in the types
      const { data, error } = await createSupabaseQueryBuilder<UserConnection>('user_connections')
        .select('service, connected_at, connection_data')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching connections:', error);
        return;
      }
      
      // Reset all connections to false first
      const newConnections = {
        linkedin: false,
        twitter: false,
        telegram: false,
        discord: false,
        luma: false,
        wallet: false
      };
      
      // Update connections based on database results
      if (data) {
        data.forEach(connection => {
          const serviceType = connection.service as ServiceType;
          if (Object.keys(newConnections).includes(serviceType)) {
            newConnections[serviceType] = true;
          }
        });
      }
      
      setConnections(newConnections);
    } catch (error) {
      console.error('Error in fetchConnections:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Connect a service
  const connectService = async (service: ServiceType): Promise<boolean> => {
    if (service === 'wallet') {
      const success = await connectionService.connectWallet();
      if (success) {
        setConnections(prev => ({ ...prev, [service]: true }));
        syncBlakQubeData(service);
      }
      return success;
    } else {
      return connectionService.startOAuthFlow(service);
    }
  };
  
  // Disconnect a service
  const disconnectService = async (service: ServiceType): Promise<boolean> => {
    const success = await connectionService.disconnectService(service);
    if (success) {
      setConnections(prev => ({ ...prev, [service]: false }));
    }
    return success;
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
    // In a real implementation, this would update the user's BlakQube data
    // based on the connected service data
    console.log(`Syncing BlakQube data from ${service}...`);
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
    loading,
    connectService,
    disconnectService,
    toggleConnection,
    refreshConnections: fetchConnections
  };
}
