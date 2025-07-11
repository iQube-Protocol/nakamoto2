
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ExternalLink, Linkedin, Twitter, MessageCircle, Users, Wallet, Facebook, Youtube, Instagram, Zap } from 'lucide-react';
import { UserSettings } from '@/lib/types';
import ServiceConnection from './ServiceConnection';
import { Button } from '@/components/ui/button';
import { connectionService } from '@/services/connection-service';

interface ConnectionsTabProps {
  settings: UserSettings;
  onConnectService: (service: keyof UserSettings['connected']) => void;
}

const ConnectionsTab = ({ settings, onConnectService }: ConnectionsTabProps) => {
  // Debug function to test LinkedIn connection
  const testLinkedInConnection = () => {
    console.log('🧪 Debug: Testing LinkedIn connection...');
    onConnectService('linkedin');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Service Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug section - remove after testing */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Debug Tools</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={testLinkedInConnection}
            className="text-xs"
          >
            🧪 Test LinkedIn Connection
          </Button>
        </div>

        <ServiceConnection
          name="LinkedIn"
          icon={<Linkedin className="h-4 w-4 text-blue-600" />}
          connected={settings.connected.linkedin}
          onConnect={() => onConnectService('linkedin')}
        />
        
        <ServiceConnection
          name="MetaMask"
          icon={<Wallet className="h-4 w-4 text-orange-500" />}
          connected={settings.connected.wallet}
          onConnect={() => onConnectService('wallet')}
        />
        
        <ServiceConnection
          name="Twitter"
          icon={<Twitter className="h-4 w-4 text-blue-400" />}
          connected={settings.connected.twitter}
          onConnect={() => onConnectService('twitter')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="Telegram"
          icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
          connected={settings.connected.telegram}
          onConnect={() => onConnectService('telegram')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="Discord"
          icon={<Users className="h-4 w-4 text-indigo-500" />}
          connected={settings.connected.discord}
          onConnect={() => onConnectService('discord')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="Facebook"
          icon={<Facebook className="h-4 w-4 text-blue-600" />}
          connected={false}
          onConnect={() => console.log('Facebook coming soon')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="YouTube"
          icon={<Youtube className="h-4 w-4 text-red-500" />}
          connected={false}
          onConnect={() => console.log('YouTube coming soon')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="Instagram"
          icon={<Instagram className="h-4 w-4 text-pink-500" />}
          connected={false}
          onConnect={() => console.log('Instagram coming soon')}
          comingSoon={true}
        />
        
        <ServiceConnection
          name="TikTok"
          icon={<Zap className="h-4 w-4 text-black" />}
          connected={false}
          onConnect={() => console.log('TikTok coming soon')}
          comingSoon={true}
        />
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
