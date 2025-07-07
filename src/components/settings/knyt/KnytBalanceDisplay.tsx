import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wallet, Plus, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [stableBalance, setStableBalance] = useState<string>('Not available');
  const { connections, connectionData, refreshConnections } = useServiceConnections();
  
  // Refs to prevent multiple simultaneous refreshes
  const refreshInProgress = useRef(false);
  const lastSuccessfulBalance = useRef<string>('Not available');

  // Enhanced refresh balance function with stability logic
  const handleRefreshBalance = async () => {
    if (!connections.wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (refreshInProgress.current) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    refreshInProgress.current = true;
    setIsRefreshing(true);
    setDebugInfo('Starting balance refresh...');
    
    try {
      console.log('=== BALANCE REFRESH UI START ===');
      setDebugInfo('Validating network and updating wallet data...');
      
      // First update wallet with KNYT balance
      const updateSuccess = await walletConnectionService.updateWalletWithKnytBalance();
      console.log('Wallet update success:', updateSuccess);
      setDebugInfo(updateSuccess ? '✅ Wallet data updated' : '❌ Wallet update failed');
      
      // Then refresh the balance
      setDebugInfo('Refreshing balance data...');
      const refreshSuccess = await walletConnectionService.refreshKnytBalance();
      console.log('Balance refresh success:', refreshSuccess);
      setDebugInfo(refreshSuccess ? '✅ Balance refreshed' : '❌ Balance refresh failed');
      
      if (updateSuccess || refreshSuccess) {
        // Refresh connections to get latest data
        setDebugInfo('Updating UI with latest data...');
        await refreshConnections();
        
        // Update last refresh time
        setLastRefreshTime(new Date());
        
        // Update stable balance with validation
        const newBalance = getKnytBalance();
        if (newBalance !== 'Not available' && newBalance !== '0 KNYT') {
          lastSuccessfulBalance.current = newBalance;
          setStableBalance(newBalance);
        } else if (lastSuccessfulBalance.current !== 'Not available') {
          // If we get 0 but had a previous successful balance, show warning but keep the last good balance
          console.warn('Got 0 balance but had previous successful balance:', lastSuccessfulBalance.current);
          setStableBalance(lastSuccessfulBalance.current);
          setDebugInfo('⚠️ Got 0 balance - using last known good balance');
        } else {
          setStableBalance(newBalance);
        }
        
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
        
        // Dispatch comprehensive events
        const events = ['privateDataUpdated', 'personaDataUpdated', 'balanceUpdated'];
        events.forEach(eventName => {
          const event = new CustomEvent(eventName);
          window.dispatchEvent(event);
        });
        
        setDebugInfo('✅ Balance refresh completed successfully');
        toast.success('KNYT balance refreshed successfully');
      } else {
        setDebugInfo('❌ Balance refresh failed - check console for details');
        toast.error('Failed to refresh KNYT balance - check console for details');
      }
    } catch (error) {
      console.error('Error refreshing KNYT balance:', error);
      setDebugInfo(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to refresh KNYT balance');
    } finally {
      setIsRefreshing(false);
      refreshInProgress.current = false;
      // Clear debug info after a delay
      setTimeout(() => setDebugInfo(''), 5000);
    }
  };

  const handleAddTokenToWallet = async () => {
    setIsAddingToken(true);
    try {
      const success = await knytTokenService.addTokenToWallet();
      if (success) {
        // Refresh balance after adding token
        setTimeout(() => {
          handleRefreshBalance();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding token to wallet:', error);
    } finally {
      setIsAddingToken(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      const success = await knytTokenService.switchToMainnet();
      if (success) {
        // Clear any cached balances when switching networks
        const walletAddress = connectionData.wallet?.address;
        if (walletAddress) {
          knytTokenService.clearBalanceCache(walletAddress);
        }
        
        // Refresh balance after network switch
        setTimeout(() => {
          handleRefreshBalance();
        }, 1000);
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // Enhanced balance getting function with stability check
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

  // Initialize stable balance on component mount
  useEffect(() => {
    const currentBalance = getKnytBalance();
    if (currentBalance !== 'Not available' && currentBalance !== '0 KNYT') {
      lastSuccessfulBalance.current = currentBalance;
      setStableBalance(currentBalance);
    }
  }, [connectionData.wallet?.knytTokenBalance]);

  // Listen for balance update events with enhanced logging
  useEffect(() => {
    const handleBalanceUpdate = (event: any) => {
      console.log('Balance update event received:', event.detail);
      
      // Update stable balance with validation
      const newBalance = getKnytBalance();
      if (newBalance !== 'Not available' && newBalance !== '0 KNYT') {
        lastSuccessfulBalance.current = newBalance;
        setStableBalance(newBalance);
      }
      
      refreshConnections();
    };

    const handlePersonaUpdate = (event: any) => {
      console.log('Persona update event received:', event.detail);
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
  const displayBalance = stableBalance; // Use stable balance for display
  const isZeroBalance = displayBalance === '0 KNYT' || displayBalance === 'Not available';
  const walletAddress = connectionData.wallet?.address;

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
        {/* Wallet Address Display */}
        {walletAddress && (
          <div>
            <label className="text-sm font-medium text-gray-600">Connected Wallet</label>
            <p className="text-sm font-mono text-muted-foreground">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        {/* Balance Display */}
        <div>
          <label className="text-sm font-medium text-gray-600">Current Balance</label>
          <div className="flex items-center space-x-2">
            <p className={`text-lg font-semibold ${isZeroBalance ? 'text-orange-600' : 'text-green-600'}`}>
              {displayBalance}
            </p>
            {isZeroBalance ? (
              <XCircle className="h-4 w-4 text-orange-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {isRefreshing && (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            )}
          </div>
          {currentBalance !== displayBalance && (
            <p className="text-xs text-blue-600 mt-1">
              (Showing stable balance - raw: {currentBalance})
            </p>
          )}
          {isZeroBalance && (
            <div className="flex items-center space-x-2 mt-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-600">
                Balance shows 0. Try the troubleshooting steps below or check console for details.
              </p>
            </div>
          )}
        </div>
        
        {/* Debug Information Display */}
        {debugInfo && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-mono">{debugInfo}</p>
          </div>
        )}
        
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

        {/* Enhanced Troubleshooting Section */}
        {isZeroBalance && (
          <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Troubleshooting Steps:
            </h4>
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
              <div>3. Clear cache and refresh balance</div>
              <div>4. Check browser console for detailed error logs</div>
              <div className="text-xs text-yellow-600 mt-2">
                <strong>Contract:</strong> {KNYT_TOKEN_CONFIG?.address}
              </div>
              <div className="text-xs text-yellow-600">
                <strong>Network:</strong> Ethereum Mainnet (Chain ID: {KNYT_TOKEN_CONFIG?.chainId})
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="text-xs text-muted-foreground">
          Balance automatically syncs when connecting wallet or completing transactions.
          If balance appears incorrect, use the refresh button or troubleshooting steps above.
          Check browser console for detailed debug information.
          
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
