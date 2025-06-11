
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/lib/types';
import ServiceConnection from './ServiceConnection';
import BlakQubeRefreshButton from './BlakQubeRefreshButton';

interface ConnectionsTabProps {
  settings: UserSettings;
  onConnectService: (service: keyof UserSettings['connected']) => void;
}

const ConnectionsTab = ({ settings, onConnectService }: ConnectionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Service Connections</CardTitle>
            <CardDescription>
              Connect external services to populate your iQube data automatically
            </CardDescription>
          </div>
          <BlakQubeRefreshButton />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ServiceConnection
          serviceName="LinkedIn"
          isConnected={settings.connected.linkedin}
          onToggle={() => onConnectService('linkedin')}
          description="Import professional profile data"
          icon="linkedin"
        />
        
        <ServiceConnection
          serviceName="MetaMask Wallet"
          isConnected={settings.connected.wallet}
          onToggle={() => onConnectService('wallet')}
          description="Connect your crypto wallet"
          icon="wallet"
        />
        
        <ServiceConnection
          serviceName="Twitter"
          isConnected={settings.connected.twitter}
          onToggle={() => onConnectService('twitter')}
          description="Connect your social media profile"
          icon="twitter"
        />
        
        <ServiceConnection
          serviceName="Telegram"
          isConnected={settings.connected.telegram}
          onToggle={() => onConnectService('telegram')}
          description="Connect your messaging account"
          icon="telegram"
        />
        
        <ServiceConnection
          serviceName="Discord"
          isConnected={settings.connected.discord}
          onToggle={() => onConnectService('discord')}
          description="Connect your Discord account"
          icon="discord"
        />
        
        <ServiceConnection
          serviceName="Luma"
          isConnected={settings.connected.luma}
          onToggle={() => onConnectService('luma')}
          description="Connect event management platform"
          icon="calendar"
        />
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
