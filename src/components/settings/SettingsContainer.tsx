
import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import SettingsInterface from './SettingsInterface';
import { MetaQube } from '@/lib/types';
import { usePrivateData } from './usePrivateData';
import { qubeData } from './QubeData';
import { useSettingsData } from './SettingsUserData';

interface SettingsContainerProps {
  activeQubes: { [key: string]: boolean };
  toggleQubeActive: (qubeName: string) => void;
  selectedIQube: MetaQube;
}

const SettingsContainer = ({ activeQubes, toggleQubeActive, selectedIQube }: SettingsContainerProps) => {
  const { userSettings } = useSettingsData();
  const { privateData, handleUpdatePrivateData } = usePrivateData(selectedIQube);

  // Auto-select the iQube tab on settings page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('tab')) {
      const tabRef = document.querySelector(`[data-tab="${params.get('tab')}"]`);
      if (tabRef) {
        // @ts-ignore
        tabRef.click();
      }
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="container p-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* Main settings panel */}
        <div className="flex-1">
          <SettingsInterface 
            userSettings={userSettings} 
            metaQube={selectedIQube} 
            activeQubes={activeQubes}
            onToggleIQubeActive={toggleQubeActive}
            privateData={privateData}
            onUpdatePrivateData={handleUpdatePrivateData}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SettingsContainer;
