
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock, Wallet } from 'lucide-react';
import { UserSettings, MetaQube } from '@/lib/types';
import BlakQubeSection from './BlakQubeSection';
import TokenQubeSection from './TokenQubeSection';

interface PrivateData {
  [key: string]: string | string[];
}

interface IQubeManagementTabProps {
  settings: UserSettings;
  privateData: PrivateData;
  onUpdatePrivateData: (newData: PrivateData) => void;
  onConnectWallet: () => void;
  onMintIQube: () => void;
  onAddAccessGrant: () => void;
  metaQube: MetaQube;
  walletAddress: string | null;
  knytBalance: string | null;
}

const IQubeManagementTab = ({ 
  settings, 
  privateData,
  onUpdatePrivateData,
  onConnectWallet,
  onMintIQube,
  onAddAccessGrant,
  metaQube,
  walletAddress,
  knytBalance
}: IQubeManagementTabProps) => {
  const isAgentQube = metaQube["iQube-Type"] === "AgentQube";
  const borderColor = isAgentQube ? "border-t-purple-500" : "border-t-iqube-primary";
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className={`border-t-4 ${borderColor}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Lock className="h-5 w-5 mr-2 text-iqube-primary" />
            blakQube Management
          </CardTitle>
          <CardDescription>
            Manage your private encrypted data for {metaQube["iQube-Identifier"]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlakQubeSection 
            privateData={privateData} 
            onUpdatePrivateData={onUpdatePrivateData}
            metaQube={metaQube}
          />
        </CardContent>
      </Card>
      
      <Card className={`border-t-4 ${borderColor}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-iqube-accent" />
            TokenQube Management
          </CardTitle>
          <CardDescription>
            Manage blockchain ownership and access rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenQubeSection 
            settings={settings}
            onConnectWallet={onConnectWallet}
            onMintIQube={onMintIQube}
            onAddAccessGrant={onAddAccessGrant}
            walletAddress={walletAddress}
            knytBalance={knytBalance}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IQubeManagementTab;
