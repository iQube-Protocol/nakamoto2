
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, MetaQube } from '@/lib/types';
import MetaQubeHeader from './MetaQubeHeader';
import ConnectionsTab from './ConnectionsTab';
import IQubeManagementTab from './IQubeManagementTab';
import PreferencesTab from './PreferencesTab';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsInterfaceProps {
  userSettings: UserSettings;
  metaQube: MetaQube;
  activeQubes: {[key: string]: boolean};
  onToggleIQubeActive: (qubeName: string) => void;
}

const SettingsInterface = ({ userSettings, metaQube, activeQubes, onToggleIQubeActive }: SettingsInterfaceProps) => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    ...userSettings,
    theme: theme as 'dark' | 'light'
  });
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("connections");

  // Create different private data sets for different iQubes
  const [mondaiPrivateData, setMondaiPrivateData] = useState({
    "Profession": "Software Developer",
    "Web3-Interests": ["DeFi", "NFTs", "DAOs"],
    "Local-City": "San Francisco",
    "Email": "user@example.com",
    "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "BTC-Public-Key": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "Tokens-of-Interest": ["ETH", "BTC", "MATIC"],
    "Chain-IDs": ["1", "137"],
    "Wallets-of-Interest": ["MetaMask", "Rainbow"]
  });

  const [metisPrivateData, setMetisPrivateData] = useState({
    "AI-Capabilities": ["Data Analysis", "NLP", "Blockchain Insights"],
    "Model Weights": "Transformer 12B",
    "Training Data": ["Web3 Data", "Financial Markets", "Public Data"],
    "Model-Version": "1.3.7",
    "API Key": "••••••••••••••••",
    "Access-Control": "Permissioned",
    "Data-Sources": ["On-chain", "User Input", "External APIs"],
    "Refresh-Interval": "24h",
    "Trustworthiness": "Verified"
  });

  const [gdrivePrivateData, setGdrivePrivateData] = useState({
    "Storage-Quota": "15GB",
    "Connected-Email": "user@example.com",
    "Auto-Sync": "Enabled",
    "Sharing-Permissions": "Private",
    "Cached-Files": ["Doc1.pdf", "Presentation.ppt"],
    "API-Key": "••••••••••••••••",
    "Last-Sync": "2023-05-01T12:00:00Z",
    "Default-View": "List",
    "File-Count": "128"
  });

  // Determine which private data to show based on selected iQube
  const getPrivateData = () => {
    if (metaQube["iQube-Identifier"] === "Metis iQube") {
      return metisPrivateData;
    } else if (metaQube["iQube-Identifier"] === "GDrive iQube") {
      return gdrivePrivateData;
    } else {
      return mondaiPrivateData;
    }
  };

  const handleConnectService = (service: keyof UserSettings['connected']) => {
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

  const handleUpdatePrivateData = (newData: any) => {
    if (metaQube["iQube-Identifier"] === "Metis iQube") {
      setMetisPrivateData(newData);
    } else if (metaQube["iQube-Identifier"] === "GDrive iQube") {
      setGdrivePrivateData(newData);
    } else {
      setMondaiPrivateData(newData);
    }

    toast({
      title: `${metaQube["iQube-Identifier"]} Data Updated`,
      description: "Private data has been updated successfully",
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
    if (qubeName === "MonDAI iQube") return activeQubes["MonDAI"];
    if (qubeName === "Metis iQube") return activeQubes["Metis"];
    if (qubeName === "GDrive iQube") return activeQubes["GDrive"];
    return false;
  };

  const toggleActive = () => {
    let qubeName = "";
    if (metaQube["iQube-Identifier"] === "MonDAI iQube") qubeName = "MonDAI";
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
            privateData={getPrivateData()}
            onUpdatePrivateData={handleUpdatePrivateData}
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
          <TabsTrigger value="iqube" data-tab="iqube">iQube Management</TabsTrigger>
          <TabsTrigger value="preferences" data-tab="preferences">Preferences</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SettingsInterface;
