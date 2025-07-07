import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { blakQubeService } from '@/services/blakqube-service';
import { toast } from 'sonner';

interface KnytBlakQubeBalanceProps {
  onBalanceUpdate?: () => void;
}

const KnytBlakQubeBalance = ({ onBalanceUpdate }: KnytBlakQubeBalanceProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<string>('Loading...');
  const { connections, connectionData, refreshConnections } = useServiceConnections();

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
    
    setIsUpdating(true);
    console.log('🔄 Syncing KNYT persona data with wallet connection...');
    
    try {
      // Update both KNYT and Qrypto personas with wallet data
      const knytSuccess = await blakQubeService.updatePersonaFromConnections('knyt');
      const qryptoSuccess = await blakQubeService.updatePersonaFromConnections('qrypto');
      
      console.log('KNYT persona sync result:', knytSuccess);
      console.log('Qrypto persona sync result:', qryptoSuccess);
      
      if (knytSuccess || qryptoSuccess) {
        // Refresh connections to get updated data
        await refreshConnections();
        
        // Dispatch update events
        const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated'];
        events.forEach(eventName => {
          const event = new CustomEvent(eventName);
          window.dispatchEvent(event);
        });
        
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
        
        console.log('✅ Persona data synchronized successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error syncing persona data:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    const success = await syncPersonaData();
    if (success) {
      toast.success('KNYT balance synchronized with persona data');
    } else {
      toast.error('Failed to synchronize KNYT balance');
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