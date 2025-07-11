
import React from 'react';
import { UserSettings } from '@/lib/types';
import WalletConnection from './tokenqube/WalletConnection';
import NetworkSettings from './tokenqube/NetworkSettings';
import AccessGrants from './tokenqube/AccessGrants';
import MintButton from './tokenqube/MintButton';

interface TokenQubeSectionProps {
  settings: UserSettings;
  onConnectWallet: () => void;
  onMintIQube: () => void;
  onAddAccessGrant: () => void;
  walletAddress: string | null;
  knytBalance: string | null;
}

const TokenQubeSection = ({ 
  settings, 
  onConnectWallet, 
  onMintIQube,
  onAddAccessGrant,
  walletAddress,
  knytBalance
}: TokenQubeSectionProps) => {
  return (
    <div className="space-y-4">
      <WalletConnection 
        isConnected={settings.connected.wallet}
        onConnectWallet={onConnectWallet}
        walletAddress={walletAddress}
        knytBalance={knytBalance}
      />
      
      <NetworkSettings 
        defaultNetwork="ethereum"
        defaultTokenStandard="erc721"
      />
      
      <AccessGrants 
        onAddAccessGrant={onAddAccessGrant}
      />
      
      <MintButton 
        onMintIQube={onMintIQube}
      />
    </div>
  );
};

export default TokenQubeSection;
