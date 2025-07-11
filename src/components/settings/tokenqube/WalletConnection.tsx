
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Wallet, Loader2, RefreshCw } from 'lucide-react';
import { connectionStateManager } from '@/services/connection-state-manager';
import { connectionService } from '@/services/connection-service';
import { useServiceConnections } from '@/hooks/useServiceConnections';

interface WalletConnectionProps {
  // No longer need these props - component is now self-managing
}

const WalletConnection = ({ }: WalletConnectionProps) => {
  const [connectionState, setConnectionState] = useState<string>('idle');
  const { connections, connectService, disconnectService, connectionData } = useServiceConnections();
  
  // Get wallet connection data
  const isConnected = connections.wallet || false;
  const walletAddress = connectionData.wallet?.walletAddress || null;
  const knytBalance = connectionData.wallet?.knytBalance || null;

  useEffect(() => {
    const handleConnectionStateChange = (event: CustomEvent) => {
      if (event.detail.service === 'wallet') {
        setConnectionState(event.detail.state);
      }
    };

    window.addEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
    
    // Set initial state
    const initialState = connectionStateManager.getConnectionState('wallet');
    setConnectionState(initialState);

    return () => {
      window.removeEventListener('connectionStateChanged', handleConnectionStateChange as EventListener);
    };
  }, []);
  
  // Format the address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return "0x71C7656EC7...8976F";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  const getStatusText = () => {
    if (connectionState === 'connecting') return 'Connecting...';
    if (connectionState === 'disconnecting') return 'Disconnecting...';
    if (connectionState === 'error') return 'Connection error';
    return isConnected ? 'Connected' : 'Not connected';
  };

  const getButtonText = () => {
    if (connectionState === 'connecting') return 'Connecting...';
    if (connectionState === 'disconnecting') return 'Disconnecting...';
    return isConnected ? 'Disconnect' : 'Connect Wallet';
  };

  const isConnecting = connectionState === 'connecting' || connectionState === 'disconnecting';
  const hasError = connectionState === 'error';
  const isStuck = connectionState === 'error';

  const handleReset = () => {
    console.log('🔄 Manual reset requested for wallet');
    connectionStateManager.forceCleanupAllStates();
    connectionService.resetConnection('wallet');
    setConnectionState('idle');
  };

  const handleConnect = async () => {
    if (isConnected) {
      await disconnectService('wallet');
    } else {
      await connectService('wallet');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm">Connected Wallet</Label>
      {isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <div className="flex-1">
              <div className="font-mono text-xs truncate">
                {walletAddress ? formatAddress(walletAddress) : "0x71C7656EC7...8976F"}
              </div>
              {knytBalance && (
                <div className="text-xs text-muted-foreground mt-1">
                  <Wallet className="h-3 w-3 inline mr-1" />
                  {knytBalance}
                </div>
              )}
              {hasError && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Error
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isStuck && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleConnect} 
                disabled={isConnecting}
              >
                {isConnecting && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button 
          className="w-full bg-iqube-primary hover:bg-iqube-primary/90"
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
        >
          {isConnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Wallet className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        {getStatusText()}
      </p>
    </div>
  );
};

export default WalletConnection;
