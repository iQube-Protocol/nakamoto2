
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
  const [retrying, setRetrying] = useState<ServiceType | null>(null);
  const [connecting, setConnecting] = useState<Set<ServiceType>>(new Set());
  const { user } = useAuth();
  
  // Fetch connection status for all services
  const fetchConnections = async (showLoading = true) => {
    if (!user) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log('Fetching user connections...');
      
      // Query user_connections table with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
  
  // Connect a service with improved error handling and duplicate prevention
  const connectService = async (service: ServiceType): Promise<boolean> => {
    // Prevent duplicate connections
    if (connecting.has(service)) {
      console.log(`${service} connection already in progress`);
      toast.error(`${service} connection is already in progress. Please wait.`);
      return false;
    }

    console.log(`Attempting to connect ${service}...`);
    setConnecting(prev => new Set([...prev, service]));
    setRetrying(service);
    
    try {
      if (service === 'wallet') {
        const success = await connectionService.connectWallet();
        if (success) {
          // Update BlakQube data after wallet connection
          await blakQubeService.updateBlakQubeFromConnections();
          // Refresh connections to get the latest data without page reload
          await fetchConnections(false);
          
          // Dispatch custom event to notify other components that private data has been updated
          const event = new CustomEvent('privateDataUpdated');
          window.dispatchEvent(event);
          
          return true;
        }
        return false;
      } else {
        try {
          // Clean up any incomplete OAuth attempts before starting new one
          connectionService.cleanupIncompleteOAuth();
          
          const success = await connectionService.startOAuthFlow(service);
          return success;
        } catch (error) {
          console.error(`Error starting OAuth flow for ${service}:`, error);
          
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
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(service);
        return newSet;
      });
      setRetrying(null);
    }
  };
  
  // Disconnect a service with improved error handling
  const disconnectService = async (service: ServiceType): Promise<boolean> => {
    if (connecting.has(service)) {
      console.log(`${service} disconnection blocked - connection in progress`);
      return false;
    }

    setConnecting(prev => new Set([...prev, service]));
    setRetrying(service);
    
    try {
      const success = await connectionService.disconnectService(service);
      if (success) {
        setConnections(prev => ({ ...prev, [service]: false }));
        setConnectionData(prev => ({ ...prev, [service]: null }));
        // Refresh data after disconnection without page reload
        await fetchConnections(false);
        
        // Dispatch custom event to notify other components that private data has been updated
        const event = new CustomEvent('privateDataUpdated');
        window.dispatchEvent(event);
      }
      return success;
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
      toast.error(`Failed to disconnect from ${service}. Please try again.`);
      return false;
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(service);
        return newSet;
      });
      setRetrying(null);
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
    return connecting.has(service) || retrying === service;
  };
  
  // Retry connection with exponential backoff
  const retryConnection = async (service: ServiceType, maxAttempts = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Retry attempt ${attempt} for ${service}`);
      
      const success = await connectService(service);
      if (success) {
        return true;
      }
      
      if (attempt < maxAttempts) {
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    toast.error(`Failed to connect to ${service} after ${maxAttempts} attempts. Please try again later.`);
    return false;
  };
  
  // Load connections when user changes
  useEffect(() => {
    if (user) {
      fetchConnections();
      
      // Clean up any incomplete OAuth attempts on load
      connectionService.cleanupIncompleteOAuth();
    }
  }, [user]);
  
  // Set up connection recovery on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Refresh connections when page becomes visible
        // This helps recover from OAuth redirects
        setTimeout(() => {
          fetchConnections(false);
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    getWalletAddress,
    isServiceProcessing,
    retryConnection
  };
}
