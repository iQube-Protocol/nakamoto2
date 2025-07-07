
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wallet, Plus, Settings, AlertCircle } from 'lucide-react';
import { walletConnectionService } from '@/services/wallet-connection-service';
import { knytTokenService, KNYT_TOKEN_CONFIG } from '@/services/knyt-token-service';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { toast } from 'sonner';

interface KnytBalanceDisplayProps {
  onBalanceUpdate?: () => void;
}

const KnytBalanceDisplay = ({ onBalanceUpdate }: KnytBalanceDisplayProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const { connections, connectionData, refreshConnections } = useServiceConnections();

  // Enhanced refresh balance function
  const handleRefreshBalance = async () => {
    if (!connections.wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRefreshing(true);
    try {
      console.log('Starting balance refresh...');
      
      // First update wallet with KNYT balance
      const updateSuccess = await walletConnectionService.updateWalletWithKnytBalance();
      console.log('Wallet update success:', updateSuccess);
      
      // Then refresh the balance
      const refreshSuccess = await walletConnectionService.refreshKnytBalance();
      console.log('Balance refresh success:', refreshSuccess);
      
      if (updateSuccess || refreshSuccess) {
        // Refresh connections to get latest data
        await refreshConnections();
        
        // Update last refresh time
        setLastRefreshTime(new Date());
        
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
        
        // Dispatch comprehensive events
        const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated'];
        events.forEach(eventName => {
          const event = new CustomEvent(eventName);
          window.dispatchEvent(event);
        });
        
        toast.success('KNYT balance refreshed successfully');
      } else {
        toast.error('Failed to refresh KNYT balance');
      }
    } catch (error) {
      console.error('Error refreshing KNYT balance:', error);
      toast.error('Failed to refresh KNYT balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddTokenToWallet = async () => {
    setIsAddingToken(true);
    try {
      await knytTokenService.addTokenToWallet();
    } catch (error) {
      console.error('Error adding token to wallet:', error);
    } finally {
      setIsAddingToken(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await knytTokenService.switchToMainnet();
      // Refresh balance after network switch
      setTimeout(() => {
        handleRefreshBalance();
      }, 1000);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // Enhanced balance getting function
  const getKnytBalance = () => {
    if (!connectionData.wallet?.knytTokenBalance) {
      return 'Not available';
    }
    return connectionData.wallet.knytTokenBalance.formatted;
  };

  const getLastUpdated = () => {
    if (!connectionData.wallet?.knytTokenBalance?.lastUpdated) {
      return null;
    }
    return new Date(connectionData.wallet.knytTokenBalance.lastUpdated).toLocaleString();
  };

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('Balance update event received');
      refreshConnections();
    };

    const handlePersonaUpdate = () => {
      console.log('Persona update event received');
      refreshConnections();
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    window.addEventListener('personaDataUpdated', handlePersonaUpdate);
    window.addEventListener('privateDataUpdated', handleBalanceUpdate);
    window.addEventListener('walletDataRefreshed', handleBalanceUpdate);

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      window.removeEventListener('personaDataUpdated', handlePersonaUpdate);
      window.removeEventListener('privateDataUpdated', handleBalanceUpdate);
      window.removeEventListener('walletDataRefreshed', handleBalanceUpdate);
    };
  }, [refreshConnections]);

  if (!connections.wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>KNYT Token Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect your wallet to view KNYT balance</p>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = getKnytBalance();
  const isZeroBalance = currentBalance === '0 KNYT' || currentBalance === 'Not available';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>KNYT Token Balance</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTokenToWallet}
              disabled={isAddingToken}
              title="Add KNYT token to MetaMask"
            >
              <Plus className={`h-4 w-4 mr-2 ${isAddingToken ? 'animate-pulse' : ''}`} />
              Add Token
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Current Balance</label>
          <p className={`text-lg font-semibold ${isZeroBalance ? 'text-orange-600' : 'text-green-600'}`}>
            {currentBalance}
          </p>
          {isZeroBalance && (
            <div className="flex items-center space-x-2 mt-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-600">
                If you have KNYT tokens but balance shows 0, try the troubleshooting steps below.
              </p>
            </div>
          )}
        </div>
        
        {getLastUpdated() && (
          <div>
            <label className="text-sm font-medium text-gray-600">Last Updated</label>
            <p className="text-sm text-muted-foreground">{getLastUpdated()}</p>
          </div>
        )}

        {lastRefreshTime && (
          <div>
            <label className="text-sm font-medium text-gray-600">Last Refresh</label>
            <p className="text-sm text-muted-foreground">{lastRefreshTime.toLocaleString()}</p>
          </div>
        )}

        {isZeroBalance && (
          <div className="space-y-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800">Troubleshooting Steps:</h4>
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="flex items-center justify-between">
                <span>1. Switch to Ethereum Mainnet</span>
                <Button variant="outline" size="sm" onClick={handleSwitchNetwork}>
                  <Settings className="h-3 w-3 mr-1" />
                  Switch
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>2. Add KNYT token to MetaMask</span>
                <Button variant="outline" size="sm" onClick={handleAddTokenToWallet} disabled={isAddingToken}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div>3. Refresh balance after network/token changes</div>
              <div className="text-xs text-yellow-600 mt-2">
                Contract: {KNYT_TOKEN_CONFIG?.address || '0xe53dad36cd0A8EdC656448CE7912bba72beBECb4'}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Balance automatically syncs when connecting wallet or completing transactions.
          If balance appears incorrect, use the refresh button or troubleshooting steps above.
          {isRefreshing && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Refreshing balance and updating persona data...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KnytBalanceDisplay;
