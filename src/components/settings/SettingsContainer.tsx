
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IQubeManagementTab from './IQubeManagementTab';
import ConnectionsTab from './ConnectionsTab';
import PreferencesTab from './PreferencesTab';
import BlakQubeSection from './BlakQubeSection';
import TokenQubeSection from './TokenQubeSection';  
import { MetaQube } from '@/lib/types';
import { useSettingsData } from './SettingsUserData';
import { usePrivateData } from './usePrivateData';
import { useServiceConnections } from '@/hooks/useServiceConnections';
import { toast } from 'sonner';

interface SettingsContainerProps {
  activeQubes: {[key: string]: boolean};
  toggleQubeActive: (qubeName: string) => void;
  selectedIQube: MetaQube;
}

const SettingsContainer = ({ activeQubes, toggleQubeActive, selectedIQube }: SettingsContainerProps) => {
  const { userSettings } = useSettingsData();
  const { privateData, handleUpdatePrivateData, loading, saving } = usePrivateData(selectedIQube);
  const { connections, toggleConnection } = useServiceConnections();

  const handleConnectService = async (service: keyof typeof connections) => {
    await toggleConnection(service);
  };

  const handleConnectWallet = () => {
    toast.info("Wallet connection feature coming soon!");
  };

  const handleMintIQube = () => {
    toast.info("Mint iQube feature coming soon!");
  };

  const handleAddAccessGrant = () => {
    toast.info("Access grant feature coming soon!");
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your iQubes, connections, and preferences
        </p>
      </div>

      <Tabs defaultValue="iqube-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="iqube-management">iQube Management</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="iqube-management" className="space-y-6">
          {!loading && (
            <>
              <BlakQubeSection
                privateData={privateData}
                onUpdatePrivateData={handleUpdatePrivateData}
                metaQube={selectedIQube}
                saving={saving}
              />
              
              <TokenQubeSection 
                settings={userSettings}
                onConnectWallet={handleConnectWallet}
                onMintIQube={handleMintIQube}
                onAddAccessGrant={handleAddAccessGrant}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="connections">
          <ConnectionsTab 
            settings={userSettings}
            onConnectService={handleConnectService}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab 
            settings={userSettings} 
            onSaveSettings={handleSaveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsContainer;
