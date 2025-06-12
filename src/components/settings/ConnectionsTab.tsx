
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/lib/types';
import ServiceConnection from './ServiceConnection';
import BlakQubeRefreshButton from './BlakQubeRefreshButton';
import { Linkedin, Wallet, Twitter, MessageCircle, MessageSquare, Calendar, Youtube, Facebook } from 'lucide-react';

interface ConnectionsTabProps {
  settings: UserSettings;
  onConnectService: (service: keyof UserSettings['connected']) => void;
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-1.32-.17A6.441 6.441 0 0 0 3.589 15.71c.002.036.003.143.003.180A6.441 6.441 0 0 0 9.589 22.3a6.373 6.373 0 0 0 2.445-.49v-3.91a2.789 2.789 0 0 1-.823.13 2.897 2.897 0 0 1-2.78-2.014l-.002-.006a2.882 2.882 0 0 1-.205-.967c0-.118.014-.234.041-.347a2.896 2.896 0 0 1 5.394-1.107l-.005.011.005-.011V22.3c.002 0 .004-.002.006-.002h3.448V9.83a8.18 8.18 0 0 0 4.77 1.526V7.911a4.786 4.786 0 0 1-2.099-.475z"/>
  </svg>
);

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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            comingSoon={true}
          />
          
          <ServiceConnection
            name="YouTube"
            icon={<Youtube className="h-4 w-4" />}
            connected={false}
            onConnect={() => {}}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="Facebook"
            icon={<Facebook className="h-4 w-4" />}
            connected={false}
            onConnect={() => {}}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="TikTok"
            icon={<TikTokIcon />}
            connected={false}
            onConnect={() => {}}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="ThirdWeb"
            icon={<Wallet className="h-4 w-4 text-purple-600" />}
            connected={false}
            onConnect={() => {}}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="Telegram"
            icon={<MessageCircle className="h-4 w-4" />}
            connected={settings.connected.telegram}
            onConnect={() => onConnectService('telegram')}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="Discord"
            icon={<MessageSquare className="h-4 w-4" />}
            connected={settings.connected.discord}
            onConnect={() => onConnectService('discord')}
            comingSoon={true}
          />
          
          <ServiceConnection
            name="Luma"
            icon={<Calendar className="h-4 w-4" />}
            connected={settings.connected.luma}
            onConnect={() => onConnectService('luma')}
            comingSoon={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
