
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Linkedin, MessageCircle, Twitter, Users, Wallet, Globe } from 'lucide-react';
import ServiceConnection from './ServiceConnection';
import { UserSettings } from '@/lib/types';

interface ConnectionsTabProps {
  settings: UserSettings;
  onConnectService: (service: keyof UserSettings['connected']) => void;
}

const ConnectionsTab = ({ settings, onConnectService }: ConnectionsTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">External Connections</CardTitle>
        <CardDescription>
          Connect external services to enhance your iQube data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServiceConnection 
            name="LinkedIn"
            icon={<Linkedin className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.linkedin}
            onConnect={() => onConnectService('linkedin')}
          />
          <ServiceConnection 
            name="Luma"
            icon={<Globe className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.luma}
            onConnect={() => onConnectService('luma')}
          />
          <ServiceConnection 
            name="Telegram"
            icon={<MessageCircle className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.telegram}
            onConnect={() => onConnectService('telegram')}
          />
          <ServiceConnection 
            name="Twitter"
            icon={<Twitter className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.twitter}
            onConnect={() => onConnectService('twitter')}
          />
          <ServiceConnection 
            name="Discord"
            icon={<Users className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.discord}
            onConnect={() => onConnectService('discord')}
          />
          <ServiceConnection 
            name="Wallet"
            icon={<Wallet className="h-5 w-5 text-iqube-primary" />}
            connected={settings.connected.wallet}
            onConnect={() => onConnectService('wallet')}
          />
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 text-sm">
          <h4 className="font-medium mb-1 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-amber-500" /> Data Privacy Notice
          </h4>
          <p className="text-muted-foreground">
            Connecting these services will import data into your iQube. All data is encrypted and stored
            in your private blakQube layer. You control what information is shared with the community.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
