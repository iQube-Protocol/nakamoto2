import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, MetaQube } from '@/lib/types';
import MetaQubeHeader from './MetaQubeHeader';
import ConnectionsTab from './ConnectionsTab';
import IQubeManagementTab from './IQubeManagementTab';
import PreferencesTab from './PreferencesTab';
import { useTheme } from '@/contexts/ThemeContext';
import { useServiceConnections } from '@/hooks/useServiceConnections';

interface PrivateData {
  [key: string]: string | string[];
}

interface SettingsInterfaceProps {
  userSettings: UserSettings;
  metaQube: MetaQube;
  activeQubes: {[key: string]: boolean};
  onToggleIQubeActive: (qubeName: string) => void;
  privateData: PrivateData;
  onUpdatePrivateData: (newData: PrivateData) => void;
}

const SettingsInterface = ({ 
  userSettings, 
  metaQube, 
  activeQubes, 
  onToggleIQubeActive,
  privateData,
  onUpdatePrivateData 
}: SettingsInterfaceProps) => {
  const { theme } = useTheme();
  const { connections, connectService, disconnectService } = useServiceConnections();
  
  // Sync settings with actual connection state
  const [settings, setSettings] = useState<UserSettings>({
    ...userSettings,
    theme: theme as 'dark' | 'light',
    connected: {
      ...userSettings.connected,
      // Override with actual connection states
      wallet: connections.wallet,
      linkedin: connections.linkedin,
      twitter: connections.twitter,
      telegram: connections.telegram,
      discord: connections.discord,
      luma: connections.luma
    }
  });
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("connections");

  // Update settings when connections change
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      connected: {
        ...prev.connected,
        wallet: connections.wallet,
        linkedin: connections.linkedin,
        twitter: connections.twitter,
        telegram: connections.telegram,
        discord: connections.discord,
        luma: connections.luma
      }
    }));
  }, [connections]);

  const handleConnectService = async (service: keyof UserSettings['connected']) => {
    // For wallet connections, check if already connected and decide whether to connect or disconnect
    if (service === 'wallet') {
      console.log('Wallet connection state:', connections.wallet);
      
      if (connections.wallet) {
        // Wallet is connected, so disconnect it
        console.log('Disconnecting wallet...');
        const success = await disconnectService('wallet');
        if (success) {
          toast({
            title: "Wallet disconnected",
            description: "Your wallet has been successfully disconnected",
          });
        } else {
          toast({
            title: "Disconnection failed",
            description: "Failed to disconnect wallet. Please try again.",
          });
        }
      } else {
        // Wallet is not connected, so connect it
        console.log('Connecting wallet...');
        const success = await connectService('wallet');
        if (success) {
          toast({
            title: "Wallet connected",
            description: "Your wallet has been successfully connected and verified",
          });
        } else {
          toast({
            title: "Connection failed",
            description: "Failed to connect wallet. Please try again.",
          });
        }
      }
      return;
    }

    // For LinkedIn, handle the OAuth flow and update BlakQube
    if (service === 'linkedin') {
      console.log('LinkedIn connection state:', connections.linkedin);
      
      if (connections.linkedin) {
        // LinkedIn is connected, so disconnect it
        console.log('Disconnecting LinkedIn...');
        const success = await disconnectService('linkedin');
        if (success) {
          toast({
            title: "LinkedIn disconnected",
            description: "Your LinkedIn account has been successfully disconnected",
          });
        } else {
          toast({
            title: "Disconnection failed",
            description: "Failed to disconnect LinkedIn. Please try again.",
          });
        }
      } else {
        // LinkedIn is not connected, so connect it
        console.log('Connecting LinkedIn...');
        const success = await connectService('linkedin');
        if (success) {
          // Import and trigger BlakQube update
          const { blakQubeService } = await import('@/services/blakqube-service');
          const updateSuccess = await blakQubeService.updateBlakQubeFromConnections();
          
          toast({
            title: "LinkedIn connected",
            description: updateSuccess 
              ? "Your LinkedIn account has been connected and profile data imported to your BlakQube"
              : "Your LinkedIn account has been connected",
          });
        } else {
          toast({
            title: "Connection failed",
            description: "Failed to connect LinkedIn. Please try again.",
          });
        }
      }
      return;
    }

    // For other services, toggle the local state and show toast
    setSettings(prev => ({
      ...prev,
      connected: {
        ...prev.connected,
        [service]: !prev.connected[service]
      }
    }));

    toast({
      title: settings.connected[service] ? `${service} disconnected` : `${service} connected`,
      description: settings.connected[service] 
        ? `Your ${service} account has been disconnected` 
        : `Your ${service} account has been successfully connected`,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };

  const handleMintIQube = () => {
    toast({
      title: `${metaQube["iQube-Identifier"]} Minted`,
      description: `Your ${metaQube["iQube-Identifier"]} has been minted successfully to the blockchain`,
    });
  };

  const handleAddAccessGrant = () => {
    toast({
      title: "Access Grant Added",
      description: `New access grant has been added for ${metaQube["iQube-Identifier"]}`,
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const isActive = (qubeName: string) => {
    if (qubeName === "Qrypto Persona iQube") return activeQubes["Qrypto Persona"];
    if (qubeName === "Metis iQube") return activeQubes["Metis"];
    if (qubeName === "GDrive iQube") return activeQubes["GDrive"];
    return false;
  };

  const toggleActive = () => {
    let qubeName = "";
    if (metaQube["iQube-Identifier"] === "Qrypto Persona iQube") qubeName = "Qrypto Persona";
    else if (metaQube["iQube-Identifier"] === "Metis iQube") qubeName = "Metis";
    else if (metaQube["iQube-Identifier"] === "GDrive iQube") qubeName = "GDrive";
    
    if (qubeName) {
      onToggleIQubeActive(qubeName);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <MetaQubeHeader 
        metaQube={metaQube} 
        isActive={isActive(metaQube["iQube-Identifier"])}
        onToggleActive={toggleActive}
      />
      
      <Tabs defaultValue="connections" value={activeTab} onValueChange={handleTabChange}>
        <TabsContent value="connections" className="mt-4">
          <ConnectionsTab 
            settings={settings} 
            onConnectService={handleConnectService} 
          />
        </TabsContent>

        <TabsContent value="iqube" className="mt-4">
          <IQubeManagementTab 
            settings={settings}
            privateData={privateData}
            onUpdatePrivateData={onUpdatePrivateData}
            onConnectWallet={() => handleConnectService('wallet')}
            onMintIQube={handleMintIQube}
            onAddAccessGrant={handleAddAccessGrant}
            metaQube={metaQube}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <PreferencesTab 
            settings={settings} 
            onSaveSettings={handleSaveSettings} 
          />
        </TabsContent>
        
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="connections" data-tab="connections">Connections</TabsTrigger>
          <TabsTrigger value="iqube" data-tab="iqube">iQubes</TabsTrigger>
          <TabsTrigger value="preferences" data-tab="preferences">Preferences</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SettingsInterface;
