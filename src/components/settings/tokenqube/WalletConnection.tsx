
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, Wallet, RefreshCw } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { walletConnectionService } from '@/services/wallet-connection-service';
import { connectionStateManager } from '@/services/connection-state-manager';

// Remove props dependency - make completely self-managing like ServiceConnection
const WalletConnection = () => {
  const { connections, getWalletAddress, connectionData, refreshConnections, connectService } = useServiceConnections();
  const [connectionState, setConnectionState] = useState<string>('idle');
  
  // Use only direct connection data - no props
  const isConnected = connections.wallet;
  const walletAddress = getWalletAddress();
  const knytBalance = connectionData.wallet?.knytTokenBalance?.formatted || null;
  
  // Add event listeners like ServiceConnection does
  useEffect(() => {
    const handleConnectionStateChange = (event: CustomEvent) => {
      if (event.detail.service === 'wallet') {
        console.log('🔄 WalletConnection: Connection state changed', event.detail);
        setConnectionState(event.detail.state);
      }
    };

    const handleDataUpdates = (event: CustomEvent) => {
      console.log('📊 WalletConnection: Data updated', event.detail);
      // Force refresh when data updates
      refreshConnections(false);
    };

    // Listen to multiple events
    window.addEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
    window.addEventListener('privateDataUpdated', handleDataUpdates as EventListener);
    window.addEventListener('personaDataUpdated', handleDataUpdates as EventListener);
    window.addEventListener('balanceUpdated', handleDataUpdates as EventListener);
    window.addEventListener('walletDataRefreshed', handleDataUpdates as EventListener);
    
    // Set initial state
    const initialState = connectionStateManager.getConnectionState('wallet');
    setConnectionState(initialState);

    return () => {
      window.removeEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
      window.removeEventListener('privateDataUpdated', handleDataUpdates as EventListener);
      window.removeEventListener('personaDataUpdated', handleDataUpdates as EventListener);
      window.removeEventListener('balanceUpdated', handleDataUpdates as EventListener);
      window.removeEventListener('walletDataRefreshed', handleDataUpdates as EventListener);
    };
  }, [refreshConnections]);
  
  // Debug logging to track state changes
  useEffect(() => {
    console.log('🔍 WalletConnection: State Update', {
      isConnected,
      walletAddress,
      knytBalance,
      connectionState,
      connectionData: connectionData.wallet
    });
  }, [isConnected, walletAddress, knytBalance, connectionState, connectionData.wallet]);
  
  const handleConnectWallet = async () => {
    console.log('🔗 WalletConnection: Connect button clicked');
    await connectService('wallet');
  };
  
  const handleRefreshBalance = async () => {
    console.log('🔄 WalletConnection: Manual refresh requested');
    const success = await walletConnectionService.refreshKnytBalance();
    if (success) {
      // Force refresh the connection data
      await refreshConnections(false);
    }
  };
  
  // Format the address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  const isConnecting = connectionState === 'connecting' || connectionState === 'redirecting';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Connected Wallet</Label>
        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshBalance}
            className="h-auto p-1 text-xs"
            disabled={isConnecting}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isConnecting ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      {isConnected && walletAddress ? (
        <div className="space-y-2">
          <div className="flex items-center p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <div className="flex-1">
              <div className="font-mono text-xs truncate">
                {formatAddress(walletAddress)}
              </div>
              {knytBalance && (
                <div className="text-xs text-muted-foreground mt-1">
                  <Wallet className="h-3 w-3 inline mr-1" />
                  {knytBalance}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Button 
          className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
          onClick={handleConnectWallet}
          size="sm"
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;
