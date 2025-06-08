
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useServiceConnections } from '@/hooks/useServiceConnections';

interface WalletConnectionProps {
  isConnected: boolean;
  onConnectWallet: () => void;
}

const WalletConnection = ({ isConnected, onConnectWallet }: WalletConnectionProps) => {
  const { getWalletAddress } = useServiceConnections();
  
  // Get the actual wallet address from the connections
  const walletAddress = getWalletAddress();
  
  // Format the address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return "0x71C7656EC7...8976F";
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  return (
    <div>
      <Label className="text-sm">Connected Wallet</Label>
      {isConnected ? (
        <div className="flex items-center mt-1 p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span className="font-mono text-xs truncate">
            {walletAddress ? formatAddress(walletAddress) : "0x71C7656EC7...8976F"}
          </span>
        </div>
      ) : (
        <Button 
          className="mt-1 w-full bg-iqube-primary hover:bg-iqube-primary/90"
          onClick={onConnectWallet}
          size="sm"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;
