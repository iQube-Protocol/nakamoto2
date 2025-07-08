
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { blakQubeService } from '@/services/blakqube-service';
import { toast } from 'sonner';
import { withTimeout, TimeoutError, CircuitBreaker } from '@/utils/async-timeout';

interface KnytBlakQubeBalanceProps {
  onBalanceUpdate?: () => void;
}

// Circuit breaker for KNYT balance operations
const knytCircuitBreaker = new CircuitBreaker(3, 30000);

const KnytBlakQubeBalance = ({ onBalanceUpdate }: KnytBlakQubeBalanceProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<string>('Loading...');
  const { connections, connectionData, refreshConnections } = useServiceConnections();
  const abortControllerRef = useRef<AbortController | null>(null);
  const operationIdRef = useRef<string>('');

  // Force reset state function
  const forceResetState = () => {
    console.log('🔄 Force resetting KnytBlakQubeBalance state');
    setIsUpdating(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceResetState();
    };
  }, []);

  // Get balance from wallet connection data (immediate fallback)
  const getWalletBalance = () => {
    if (!connectionData.wallet?.knytTokenBalance) {
      return null;
    }
    return connectionData.wallet.knytTokenBalance.formatted;
  };

  // Sync persona data with wallet connection
  const syncPersonaData = async () => {
    if (!connections.wallet) return false;
    
    // Check circuit breaker
    if (!knytCircuitBreaker.canExecute()) {
      const status = knytCircuitBreaker.getStatus();
      toast.error(`Too many failed sync attempts (${status.failures}). Please wait before trying again.`);
      return false;
    }
    
    // Create new operation
    abortControllerRef.current = new AbortController();
    const operationId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    operationIdRef.current = operationId;
    
    setIsUpdating(true);
    console.log(`🔄 Syncing KNYT persona data with wallet connection... [${operationId}]`);
    
    try {
      // Force update wallet data first - with timeout
      const { walletConnectionService } = await import('@/services/wallet-connection-service');
      await withTimeout(
        walletConnectionService.updateWalletWithKnytBalance(),
        {
          timeoutMs: 8000,
          timeoutMessage: 'Wallet KNYT balance update timed out',
          onTimeout: () => console.warn('⏰ Wallet balance update timeout')
        }
      );
      
      // Update KNYT persona with wallet data - with timeout
      const knytSuccess = await withTimeout(
        blakQubeService.updatePersonaFromConnections('knyt'),
        {
          timeoutMs: 10000,
          timeoutMessage: 'KNYT persona sync timed out',
          onTimeout: () => console.warn('⏰ KNYT persona sync timeout')
        }
      );
      
      console.log('KNYT persona sync result:', knytSuccess);
      
      if (knytSuccess) {
        // Refresh connections to get updated data
        await refreshConnections();
        
        // Force refresh the persona data display
        setTimeout(() => {
          const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated'];
          events.forEach(eventName => {
            const event = new CustomEvent(eventName);
            window.dispatchEvent(event);
          });
        }, 500);
        
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
        
        console.log('✅ KNYT persona data synchronized successfully');
        knytCircuitBreaker.onSuccess();
        return true;
      }
      
      throw new Error('KNYT persona sync returned false');
    } catch (error) {
      console.error('❌ Error syncing persona data:', error);
      knytCircuitBreaker.onFailure();
      
      if (error instanceof TimeoutError) {
        toast.error('KNYT balance sync timed out. Please try again.');
      } else {
        toast.error('Failed to synchronize KNYT balance');
      }
      return false;
    } finally {
      // Only reset state if this is still the current operation
      if (operationIdRef.current === operationId) {
        setIsUpdating(false);
        abortControllerRef.current = null;
      }
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isUpdating) {
      console.log('Sync already in progress, skipping...');
      return;
    }
    
    const success = await syncPersonaData();
    if (success) {
      toast.success('KNYT balance synchronized with persona data');
    }
  };

  // Initialize and sync on component mount
  useEffect(() => {
    const initializeBalance = async () => {
      // Show wallet balance immediately as fallback
      const walletBalance = getWalletBalance();
      if (walletBalance) {
        setDisplayBalance(walletBalance);
      }
      
      // Then sync persona data in background
      if (connections.wallet) {
        await syncPersonaData();
      }
    };

    initializeBalance();
  }, [connections.wallet]);

  // Update display when connection data changes
  useEffect(() => {
    const walletBalance = getWalletBalance();
    if (walletBalance) {
      setDisplayBalance(walletBalance);
    } else if (!connections.wallet) {
      setDisplayBalance('Wallet not connected');
    } else {
      setDisplayBalance('0 KNYT');
    }
  }, [connectionData.wallet]);

  if (!connections.wallet) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">KNYT Balance:</span>
        <span className="text-sm text-orange-600">Connect wallet to view balance</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">KNYT Balance:</span>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${
          displayBalance === '0 KNYT' || displayBalance === 'Loading...' 
            ? 'text-orange-600' 
            : 'text-green-600'
        }`}>
          {displayBalance}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isUpdating}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default KnytBlakQubeBalance;
