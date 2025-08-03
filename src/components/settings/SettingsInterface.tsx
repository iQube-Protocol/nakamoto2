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
import { blakQubeService } from '@/services/blakqube-service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

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
  const { connections, connectService, disconnectService, toggleConnection } = useServiceConnections();
  const { user } = useAuth();
  
  // State for profile images
  const [profileImages, setProfileImages] = useState<{
    knyt: string | null;
    qrypto: string | null;
  }>({
    knyt: null,
    qrypto: null
  });
  
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

  // Load profile images for personas
  useEffect(() => {
    const loadProfileImages = async () => {
      if (!user) return;

      try {
        // Fetch KNYT persona profile image
        const { data: knytData } = await supabase
          .from('knyt_personas')
          .select('profile_image_url')
          .eq('user_id', user.id)
          .single();

        // Fetch Qrypto persona profile image
        const { data: qryptoData } = await supabase
          .from('qrypto_personas')
          .select('profile_image_url')
          .eq('user_id', user.id)
          .single();

        setProfileImages({
          knyt: knytData?.profile_image_url || null,
          qrypto: qryptoData?.profile_image_url || null
        });
      } catch (error) {
        console.error('Error loading profile images:', error);
      }
    };

    loadProfileImages();
  }, [user]);

  const handleConnectService = async (service: keyof UserSettings['connected']) => {
    console.log(`🔄 HandleConnectService called for ${service}`);
    
    try {
      const isConnected = connections[service as keyof typeof connections];
      
      if (isConnected) {
        // Service is connected, so disconnect it
        console.log(`🔌 Disconnecting ${service}...`);
        const success = await disconnectService(service as any);
        if (success) {
          toast({
            title: `${service} disconnected`,
            description: `Your ${service} account has been successfully disconnected`,
          });
          
          // Trigger private data update event
          const event = new CustomEvent('privateDataUpdated');
          window.dispatchEvent(event);
        }
      } else {
        // Service is not connected, so connect it
        console.log(`🔗 Connecting ${service}...`);
        const success = await connectService(service as any);
        
        if (success) {
          if (service === 'wallet') {
            console.log('💰 Wallet connected successfully, updating BlakQube...');
            
            // Update BlakQube data after wallet connection
            const updateSuccess = await blakQubeService.updateBlakQubeFromConnections();
            
            toast({
              title: "Wallet connected",
              description: updateSuccess 
                ? "Your wallet has been connected and address imported to your BlakQube"
                : "Your wallet has been connected",
            });
          } else if (service === 'linkedin') {
            // LinkedIn redirect is handled in the service, no toast needed here
            console.log('🔗 LinkedIn OAuth flow initiated...');
          } else {
            toast({
              title: `${service} connected`,
              description: `Your ${service} account has been successfully connected`,
            });
          }
          
          // Trigger private data update event
          const event = new CustomEvent('privateDataUpdated');
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error(`❌ Error in handleConnectService for ${service}:`, error);
      toast({
        title: "Connection failed",
        description: `Failed to ${connections[service as keyof typeof connections] ? 'disconnect' : 'connect'} ${service}. Please try again.`,
      });
    }
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
    if (qubeName === "KNYT Persona iQube") return activeQubes["KNYT Persona"];
    if (qubeName === "Venice iQube") return activeQubes["Venice"];
    if (qubeName === "OpenAI iQube") return activeQubes["OpenAI"];
    if (qubeName === "Metis iQube") return activeQubes["Metis"];
    if (qubeName === "GDrive iQube") return activeQubes["GDrive"];
    return false;
  };

  const toggleActive = () => {
    let qubeName = "";
    if (metaQube["iQube-Identifier"] === "Qrypto Persona iQube") qubeName = "Qrypto Persona";
    else if (metaQube["iQube-Identifier"] === "KNYT Persona iQube") qubeName = "KNYT Persona";
    else if (metaQube["iQube-Identifier"] === "Venice iQube") qubeName = "Venice";
    else if (metaQube["iQube-Identifier"] === "OpenAI iQube") qubeName = "OpenAI";
    else if (metaQube["iQube-Identifier"] === "Metis iQube") qubeName = "Metis";
    else if (metaQube["iQube-Identifier"] === "GDrive iQube") qubeName = "GDrive";
    
    if (qubeName) {
      onToggleIQubeActive(qubeName);
    }
  };

  // Get the appropriate profile image based on the metaQube type
  const getProfileImageUrl = () => {
    if (metaQube["iQube-Identifier"] === "KNYT Persona iQube") {
      return profileImages.knyt;
    } else if (metaQube["iQube-Identifier"] === "Qrypto Persona iQube") {
      return profileImages.qrypto;
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header area with MetaQube scores and tabs */}
      <div className="flex-shrink-0 bg-background">
        <MetaQubeHeader 
          metaQube={metaQube} 
          isActive={isActive(metaQube["iQube-Identifier"])}
          onToggleActive={toggleActive}
          profileImageUrl={getProfileImageUrl() || undefined}
        />
        
        <Tabs defaultValue="connections" value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-3 mt-4 flex-shrink-0">
            <TabsTrigger value="connections" data-tab="connections">Connections</TabsTrigger>
            <TabsTrigger value="iqube" data-tab="iqube">iQubes</TabsTrigger>
            <TabsTrigger value="preferences" data-tab="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <TabsContent value="connections" className="mt-4 h-full">
              <ConnectionsTab 
                settings={settings} 
                onConnectService={handleConnectService} 
              />
            </TabsContent>

            <TabsContent value="iqube" className="mt-4 h-full">
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

            <TabsContent value="preferences" className="mt-4 h-full">
              <PreferencesTab 
                settings={settings} 
                onSaveSettings={handleSaveSettings} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsInterface;
