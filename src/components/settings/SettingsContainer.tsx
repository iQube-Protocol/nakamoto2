
import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import SettingsInterface from './SettingsInterface';
import { MetaQube } from '@/lib/types';
import { usePrivateData } from './usePrivateData';
import { qubeData } from './QubeData';
import { useSettingsData } from './SettingsUserData';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { toast } from 'sonner';

interface SettingsContainerProps {
  activeQubes: { [key: string]: boolean };
  toggleQubeActive: (qubeName: string) => void;
  selectedIQube: MetaQube;
}

const SettingsContainer = ({ activeQubes, toggleQubeActive, selectedIQube }: SettingsContainerProps) => {
  const { userSettings } = useSettingsData();
  const { privateData, handleUpdatePrivateData } = usePrivateData(selectedIQube);
  const { selectIQube } = useSidebarState();

  // When the selected iQube changes, update the sidebar state
  useEffect(() => {
    if (selectedIQube["iQube-Identifier"] === "Qrypto Persona iQube") {
      selectIQube("Qrypto Persona");
    } else if (selectedIQube["iQube-Identifier"] === "Metis iQube") {
      selectIQube("Metis");
    } else if (selectedIQube["iQube-Identifier"] === "GDrive iQube") {
      selectIQube("GDrive");
    }
  }, [selectedIQube, selectIQube]);

  // Handle iQube activation toggle
  const handleToggleIQubeActive = (qubeName: string) => {
    // Call the parent function to update active state
    toggleQubeActive(qubeName);
    
    // Send toggle event to update sidebar
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: !activeQubes[qubeName] 
      } 
    });
    window.dispatchEvent(event);
  };

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
            onToggleIQubeActive={handleToggleIQubeActive}
            privateData={privateData}
            onUpdatePrivateData={handleUpdatePrivateData}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SettingsContainer;
