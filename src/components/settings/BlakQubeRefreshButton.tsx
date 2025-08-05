
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { blakQubeService } from '@/services/blakqube-service';
import { withTimeout, TimeoutError, CircuitBreaker } from '@/utils/async-timeout';

interface BlakQubeRefreshButtonProps {
  onRefresh?: () => void;
  personaType?: 'knyt' | 'qrypto';
}

// Circuit breaker instance per persona type
const circuitBreakers = new Map<string, CircuitBreaker>();

const BlakQubeRefreshButton = ({ onRefresh, personaType = 'qrypto' }: BlakQubeRefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const operationIdRef = useRef<string>('');

  // Get or create circuit breaker for this persona type
  const getCircuitBreaker = () => {
    if (!circuitBreakers.has(personaType)) {
      circuitBreakers.set(personaType, new CircuitBreaker(3, 30000));
    }
    return circuitBreakers.get(personaType)!;
  };

  // Cleanup function to ensure state is always reset
  const forceResetState = () => {
    console.log('🔄 Force resetting BlakQubeRefreshButton state');
    setIsRefreshing(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Reset state on component unmount
  useEffect(() => {
    return () => {
      forceResetState();
    };
  }, []);

  const handleRefresh = async () => {
    const circuitBreaker = getCircuitBreaker();
    
    // Check circuit breaker
    if (!circuitBreaker.canExecute()) {
      const status = circuitBreaker.getStatus();
      toast.error(`Too many failed attempts (${status.failures}). Please wait before trying again.`);
      return;
    }

    if (isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return;
    }
    
    // Create new abort controller for this operation
    abortControllerRef.current = new AbortController();
    const operationId = `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    operationIdRef.current = operationId;
    
    setIsRefreshing(true);
    
    try {
      console.log(`=== BLAKQUBE REFRESH START [${operationId}] ===`);
      console.log('🔄 Refreshing persona data for type:', personaType);
      
      // First ensure wallet data is updated with KNYT balance - with timeout
      const { walletConnectionService } = await import('@/services/wallet-connection-service');
      console.log('💰 Updating wallet with KNYT balance...');
      
      await withTimeout(
        walletConnectionService.updateWalletWithKnytBalance(),
        {
          timeoutMs: 10000,
          timeoutMessage: 'Wallet update timed out',
          onTimeout: () => console.warn('⏰ Wallet update timeout reached')
        }
      );
      
      // Add a small delay to ensure wallet data is properly saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update persona from connections with EXPLICIT type - with timeout
      console.log('🔄 Calling updatePersonaFromConnections with type:', personaType);
      const success = await withTimeout(
        blakQubeService.updatePersonaFromConnections(personaType),
        {
          timeoutMs: 12000,
          timeoutMessage: `Persona update timed out for ${personaType}`,
          onTimeout: () => console.warn('⏰ Persona update timeout reached')
        }
      );
      
      if (success) {
        console.log('✅ Persona data refresh successful for type:', personaType);
        toast.success(`${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data refreshed successfully!`);
        
        // Trigger immediate data refresh events
        const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated', 'walletDataRefreshed'];
        events.forEach(eventName => {
          console.log(`📡 Dispatching event: ${eventName}`);
          const event = new CustomEvent(eventName);
          window.dispatchEvent(event);
        });
        
        // Call the optional onRefresh callback immediately
        if (onRefresh) {
          onRefresh();
        }
        
        // Mark success in circuit breaker
        circuitBreaker.onSuccess();
      } else {
        throw new Error('Persona data refresh returned false');
      }
    } catch (error) {
      console.error('❌ Error refreshing persona data:', error);
      
      // Mark failure in circuit breaker
      circuitBreaker.onFailure();
      
      if (error instanceof TimeoutError) {
        toast.error(`Refresh timed out for ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona. Please try again.`);
      } else {
        toast.error(`Error refreshing ${personaType === 'knyt' ? 'KNYT' : 'Qrypto'} Persona data`);
      }
    } finally {
      // Always reset the loading state, even if there's an error
      // Double-check we're still dealing with the same operation
      if (operationIdRef.current === operationId) {
        setIsRefreshing(false);
        abortControllerRef.current = null;
      }
      console.log(`=== BLAKQUBE REFRESH END [${operationId}] ===`);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
};

export default BlakQubeRefreshButton;
