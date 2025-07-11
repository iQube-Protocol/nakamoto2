
import React from 'react';
import { UserSettings } from '@/lib/types';
import WalletConnection from './tokenqube/WalletConnection';
import NetworkSettings from './tokenqube/NetworkSettings';
import AccessGrants from './tokenqube/AccessGrants';
import MintButton from './tokenqube/MintButton';

interface TokenQubeSectionProps {
  settings: UserSettings;
  onMintIQube: () => void;
  onAddAccessGrant: () => void;
}

const TokenQubeSection = ({ 
  settings, 
  onMintIQube,
  onAddAccessGrant
}: TokenQubeSectionProps) => {
  return (
    <div className="space-y-4">
      <WalletConnection />
      
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
