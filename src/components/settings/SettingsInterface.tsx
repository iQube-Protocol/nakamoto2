
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MetaQubeHeader from './MetaQubeHeader';
import BlakQubeSection from './BlakQubeSection';
import TokenQubeSection from './TokenQubeSection';
import IQubeManagementTab from './IQubeManagementTab';
import PreferencesTab from './PreferencesTab';
import ConnectionsTab from './ConnectionsTab';
import { MetaQube } from '@/lib/types';
import { monDaiQubeData } from './QubeData';

interface SettingsInterfaceProps {
  userSettings: any;
  metaQube: MetaQube;
  activeQubes: { [key: string]: boolean };
  onToggleIQubeActive: (qubeName: string) => void;
  privateData: any;
  onUpdatePrivateData: (data: any) => void;
}

const SettingsInterface = ({ 
  userSettings, 
  metaQube, 
  activeQubes, 
  onToggleIQubeActive,
  privateData,
  onUpdatePrivateData
}: SettingsInterfaceProps) => {
  const [activeTab, setActiveTab] = useState("iqube-management");

  // Safety check: if metaQube is undefined, use default
  const safeMetaQube = metaQube || monDaiQubeData;
  
  // Get the iQube name for activation status
  const getIQubeName = (metaQube: MetaQube) => {
    if (metaQube["iQube-Identifier"] === "Qrypto Persona iQube") {
      return "Qrypto Persona";
    } else if (metaQube["iQube-Identifier"] === "Metis iQube") {
      return "Metis";
    } else if (metaQube["iQube-Identifier"] === "GDrive iQube") {
      return "GDrive";
    }
    return "Qrypto Persona"; // fallback
  };

  const iqubeName = getIQubeName(safeMetaQube);
  const isActive = activeQubes[iqubeName] || false;

  const handleToggleActive = () => {
    onToggleIQubeActive(iqubeName);
  };

  console.log('SettingsInterface rendered with:', {
    metaQube: safeMetaQube["iQube-Identifier"],
    iqubeName,
    isActive,
    activeQubes
  });

  return (
    <div className="space-y-4">
      {/* MetaQube Header */}
      <MetaQubeHeader 
        metaQube={safeMetaQube}
        isActive={isActive}
        onToggleActive={handleToggleActive}
      />

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="iqube-management" data-tab="iqube-management">iQube Management</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="iqube-management" className="space-y-4">
          <IQubeManagementTab 
            metaQube={safeMetaQube}
            isActive={isActive}
            onToggleActive={handleToggleActive}
            privateData={privateData}
            onUpdatePrivateData={onUpdatePrivateData}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesTab userSettings={userSettings} />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <ConnectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsInterface;
