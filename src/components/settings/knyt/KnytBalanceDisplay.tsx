
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wallet } from 'lucide-react';
import { walletConnectionService } from '@/services/wallet-connection-service';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { toast } from 'sonner';

interface KnytBalanceDisplayProps {
  onBalanceUpdate?: () => void;
}

const KnytBalanceDisplay = ({ onBalanceUpdate }: KnytBalanceDisplayProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { connections, connectionData } = useServiceConnections();

  const handleRefreshBalance = async () => {
    if (!connections.wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRefreshing(true);
    try {
      const success = await walletConnectionService.refreshKnytBalance();
      if (success && onBalanceUpdate) {
        onBalanceUpdate();
        // Dispatch event to notify other components
        const event = new CustomEvent('privateDataUpdated');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error refreshing KNYT balance:', error);
      toast.error('Failed to refresh KNYT balance');
    } finally {
      setIsRefreshing(false);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>KNYT Token Balance</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Current Balance</label>
          <p className="text-lg font-semibold">{getKnytBalance()}</p>
        </div>
        {getLastUpdated() && (
          <div>
            <label className="text-sm font-medium text-gray-600">Last Updated</label>
            <p className="text-sm text-muted-foreground">{getLastUpdated()}</p>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Balance automatically syncs when connecting wallet or completing transactions
        </div>
      </CardContent>
    </Card>
  );
};

export default KnytBalanceDisplay;
