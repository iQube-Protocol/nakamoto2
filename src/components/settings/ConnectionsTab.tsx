
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Linkedin, MessageCircle, Twitter, Users, Wallet, Globe, AlertCircle } from 'lucide-react';
import ServiceConnection from './ServiceConnection';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { UserSettings } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface ConnectionsTabProps {
  settings: UserSettings;
  onConnectService: (service: keyof UserSettings['connected']) => void;
}

const ConnectionsTab = ({ settings, onConnectService }: ConnectionsTabProps) => {
  const { connections, loading, error, refreshConnections } = useServiceConnections();
  
  const handleServiceToggle = async (service: keyof UserSettings['connected']) => {
    try {
      // Use the established connection flow from SettingsInterface
      await onConnectService(service);
      
      // Force refresh the connections state to update the UI immediately
      await refreshConnections();
    } catch (error) {
      console.error(`Error toggling ${service} connection:`, error);
      toast.error(`Failed to ${connections[service as any] ? 'disconnect' : 'connect'} ${service}`);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">External Connections</CardTitle>
        <CardDescription>
          Connect external services to enhance your iQube data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-iqube-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ServiceConnection 
              name="LinkedIn"
              icon={<Linkedin className="h-5 w-5 text-iqube-primary" />}
              connected={connections.linkedin}
              onConnect={() => handleServiceToggle('linkedin')}
            />
            <ServiceConnection 
              name="Luma"
              icon={<Globe className="h-5 w-5 text-iqube-primary" />}
              connected={connections.luma}
              onConnect={() => handleServiceToggle('luma')}
            />
            <ServiceConnection 
              name="Telegram"
              icon={<MessageCircle className="h-5 w-5 text-iqube-primary" />}
              connected={connections.telegram}
              onConnect={() => handleServiceToggle('telegram')}
            />
            <ServiceConnection 
              name="Twitter"
              icon={<Twitter className="h-5 w-5 text-iqube-primary" />}
              connected={connections.twitter}
              onConnect={() => handleServiceToggle('twitter')}
            />
            <ServiceConnection 
              name="Discord"
              icon={<Users className="h-5 w-5 text-iqube-primary" />}
              connected={connections.discord}
              onConnect={() => handleServiceToggle('discord')}
            />
            <ServiceConnection 
              name="Wallet"
              icon={<Wallet className="h-5 w-5 text-iqube-primary" />}
              connected={connections.wallet}
              onConnect={() => handleServiceToggle('wallet')}
            />
          </div>
        )}
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 text-sm">
          <h4 className="font-medium mb-1 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-amber-500" /> Data Privacy Notice
          </h4>
          <p className="text-muted-foreground mb-2">
            Connecting these services will import data into your iQube. All data is encrypted and stored
            in your private blakQube layer. You control what information is shared with the community.
          </p>
          <Link 
            to="/privacy" 
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Read our full Privacy Policy →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionsTab;
