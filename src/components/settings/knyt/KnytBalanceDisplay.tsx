
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wallet, Plus, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { walletConnectionService } from '@/services/wallet-connection-service';
import { knytTokenService, KNYT_TOKEN_CONFIG } from '@/services/knyt-token-service';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { toast } from 'sonner';
import { withTimeout, TimeoutError, CircuitBreaker } from '@/utils/async-timeout';

interface KnytBalanceDisplayProps {
  onBalanceUpdate?: () => void;
}

// Circuit breaker for balance operations
const balanceCircuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 minute reset

const KnytBalanceDisplay = ({ onBalanceUpdate }: KnytBalanceDisplayProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [stableBalance, setStableBalance] = useState<string>('Not available');
  const { connections, connectionData, refreshConnections } = useServiceConnections();
  
  // Refs to prevent multiple simultaneous refreshes and handle operation cleanup
  const refreshInProgress = useRef(false);
  const lastSuccessfulBalance = useRef<string>('Not available');
  const abortControllerRef = useRef<AbortController | null>(null);
  const operationIdRef = useRef<string>('');

  // Force reset all states
  const forceResetState = () => {
    console.log('🔄 Force resetting KnytBalanceDisplay state');
    setIsRefreshing(false);
    setIsAddingToken(false);
    refreshInProgress.current = false;
    setDebugInfo('');
    
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

  // Enhanced refresh balance function with comprehensive timeout and error handling
  const handleRefreshBalance = async () => {
    if (!connections.wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check circuit breaker
    if (!balanceCircuitBreaker.canExecute()) {
      const status = balanceCircuitBreaker.getStatus();
      toast.error(`Too many failed refresh attempts (${status.failures}). Please wait before trying again.`);
      return;
    }

    if (refreshInProgress.current || isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    // Create new operation
    abortControllerRef.current = new AbortController();
    const operationId = `balance-refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    operationIdRef.current = operationId;

    refreshInProgress.current = true;
    setIsRefreshing(true);
    setDebugInfo('Starting balance refresh...');
    
    try {
      console.log(`=== BALANCE REFRESH UI START [${operationId}] ===`);
      setDebugInfo('Validating network and updating wallet data...');
      
      // First update wallet with KNYT balance - with timeout
      const updateSuccess = await withTimeout(
        walletConnectionService.updateWalletWithKnytBalance(),
        {
          timeoutMs: 8000,
          timeoutMessage: 'Wallet update operation timed out',
          onTimeout: () => {
            console.warn('⏰ Wallet update timeout reached');
            setDebugInfo('⏰ Wallet update timed out');
          }
        }
      );
      
      console.log('Wallet update success:', updateSuccess);
      setDebugInfo(updateSuccess ? '✅ Wallet data updated' : '❌ Wallet update failed');
      
      // Then refresh the balance - with timeout
      setDebugInfo('Refreshing balance data...');
      const refreshSuccess = await withTimeout(
        walletConnectionService.refreshKnytBalance(),
        {
          timeoutMs: 8000,
          timeoutMessage: 'Balance refresh operation timed out',
          onTimeout: () => {
            console.warn('⏰ Balance refresh timeout reached');
            setDebugInfo('⏰ Balance refresh timed out');
          }
        }
      );
      
      console.log('Balance refresh success:', refreshSuccess);
      setDebugInfo(refreshSuccess ? '✅ Balance refreshed' : '❌ Balance refresh failed');
      
      if (updateSuccess || refreshSuccess) {
        // Refresh connections to get latest data - with timeout
        setDebugInfo('Updating UI with latest data...');
        await withTimeout(
          refreshConnections(),
          {
            timeoutMs: 5000,
            timeoutMessage: 'UI refresh timed out',
            onTimeout: () => console.warn('⏰ UI refresh timeout')
          }
        );
        
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
        
        // Removed excessive event dispatching to prevent infinite loops
        // Events are now handled through direct service calls
        
        setDebugInfo('✅ Balance refresh completed successfully');
        toast.success('KNYT balance refreshed successfully');
        balanceCircuitBreaker.onSuccess();
      } else {
        throw new Error('Both wallet update and balance refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing KNYT balance:', error);
      balanceCircuitBreaker.onFailure();
      
      if (error instanceof TimeoutError) {
        setDebugInfo(`⏰ ${error.message}`);
        toast.error('Balance refresh timed out. Please try again.');
      } else {
        setDebugInfo(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error('Failed to refresh KNYT balance');
      }
    } finally {
      // Only reset state if this is still the current operation
      if (operationIdRef.current === operationId) {
        setIsRefreshing(false);
        refreshInProgress.current = false;
        abortControllerRef.current = null;
      }
      
      // Clear debug info after a delay
      setTimeout(() => {
        if (operationIdRef.current === operationId) {
          setDebugInfo('');
        }
      }, 5000);
      
      console.log(`=== BALANCE REFRESH UI END [${operationId}] ===`);
    }
  };

  const handleAddTokenToWallet = async () => {
    if (isAddingToken) return;
    
    setIsAddingToken(true);
    try {
      const success = await withTimeout(
        knytTokenService.addTokenToWallet(),
        {
          timeoutMs: 10000,
          timeoutMessage: 'Add token operation timed out'
        }
      );
      
      if (success) {
        // Refresh balance after adding token
        setTimeout(() => {
          handleRefreshBalance();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      if (error instanceof TimeoutError) {
        toast.error('Add token operation timed out. Please try again.');
      }
    } finally {
      setIsAddingToken(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      const success = await withTimeout(
        knytTokenService.switchToMainnet(),
        {
          timeoutMs: 10000,
          timeoutMessage: 'Network switch timed out'
        }
      );
      
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
      if (error instanceof TimeoutError) {
        toast.error('Network switch timed out. Please try again.');
      }
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

  // Debounced refresh function to prevent infinite loops
  const debouncedRefreshRef = useRef<NodeJS.Timeout | null>(null);
  
  // Listen for balance update events with enhanced logging and debouncing
  useEffect(() => {
    const handleBalanceUpdate = (event: any) => {
      console.log('Balance update event received:', event.detail);
      
      // Update stable balance with validation
      const newBalance = getKnytBalance();
      if (newBalance !== 'Not available' && newBalance !== '0 KNYT') {
        lastSuccessfulBalance.current = newBalance;
        setStableBalance(newBalance);
      }
      
      // Debounce refreshConnections to prevent infinite loops
      if (debouncedRefreshRef.current) {
        clearTimeout(debouncedRefreshRef.current);
      }
      
      debouncedRefreshRef.current = setTimeout(() => {
        console.log('🔄 Debounced refresh triggered');
        refreshConnections();
      }, 500); // 500ms debounce
    };

    // Removed infinite loop causing event listener
    // Balance updates are now handled through direct state management
    
    return () => {
      // Clean up debounce timer only
      if (debouncedRefreshRef.current) {
        clearTimeout(debouncedRefreshRef.current);
      }
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
