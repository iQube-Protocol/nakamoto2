
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/lib/types';
import ServiceConnection from './ServiceConnection';
import BlakQubeRefreshButton from './BlakQubeRefreshButton';
import { Linkedin, Wallet, Twitter, MessageCircle, MessageSquare, Calendar } from 'lucide-react';

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
          name="LinkedIn"
          icon={<Linkedin className="h-4 w-4" />}
          connected={settings.connected.linkedin}
          onConnect={() => onConnectService('linkedin')}
        />
        
        <ServiceConnection
          name="MetaMask Wallet"
          icon={<Wallet className="h-4 w-4" />}
          connected={settings.connected.wallet}
          onConnect={() => onConnectService('wallet')}
        />
        
        <ServiceConnection
          name="Twitter"
          icon={<Twitter className="h-4 w-4" />}
          connected={settings.connected.twitter}
          onConnect={() => onConnectService('twitter')}
        />
        
        <ServiceConnection
          name="Telegram"
          icon={<MessageCircle className="h-4 w-4" />}
          connected={settings.connected.telegram}
          onConnect={() => onConnectService('telegram')}
        />
        
        <ServiceConnection
          name="Discord"
          icon={<MessageSquare className="h-4 w-4" />}
          connected={settings.connected.discord}
          onConnect={() => onConnectService('discord')}
        />
        
        <ServiceConnection
          name="Luma"
          icon={<Calendar className="h-4 w-4" />}
          connected={settings.connected.luma}
          onConnect={() => onConnectService('luma')}
        />
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
