
import React, { useState, useEffect } from 'react';
import SettingsInterface from '@/components/settings/SettingsInterface';
import { UserSettings, MetaQube } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import AgentRecommendation from '@/components/shared/agent/AgentRecommendation';
import { toast } from 'sonner';

// Sample metaQube data
const monDaiQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["ContentQube1", "AgentQube1"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

const metisQubeData: MetaQube = {
  "iQube-Identifier": "Metis iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "Aigent Metis",
  "iQube-Use": "Advanced agent for data analysis and insights",
  "Owner-Type": "Organization",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1", "ContentQube2"],
  "X-of-Y": "3 of 15",
  "Sensitivity-Score": 3,
  "Verifiability-Score": 8,
  "Accuracy-Score": 7,
  "Risk-Score": 3
};

const gdriveQubeData: MetaQube = {
  "iQube-Identifier": "GDrive iQube",
  "iQube-Type": "ToolQube",
  "iQube-Designer": "Aigent Connect",
  "iQube-Use": "Connect to Google Drive for document management",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1"],
  "X-of-Y": "1 of 10",
  "Sensitivity-Score": 5,
  "Verifiability-Score": 9,
  "Accuracy-Score": 8,
  "Risk-Score": 4
};

const Settings = () => {
  const { theme } = useTheme();
  const [selectedIQube, setSelectedIQube] = useState<MetaQube>(monDaiQubeData);
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const [showAgentRecommendation, setShowAgentRecommendation] = useState(!metisActivated);
  const [activeQubes, setActiveQubes] = useState<{[key: string]: boolean}>({
    "MonDAI": true,
    "Metis": metisActivated && metisVisible,
    "GDrive": false
  });
  
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
  
  // Listen for iQube selection events from sidebar
  useEffect(() => {
    const handleIQubeSelected = (e: CustomEvent) => {
      const iQubeId = e.detail?.iqubeId;
      const shouldSelectTab = e.detail?.selectTab || false;
      console.log("iQube selection event received:", iQubeId, "select tab:", shouldSelectTab);
      
      if (iQubeId === "MonDAI" || iQubeId === "MonDAI iQube") {
        setSelectedIQube(monDaiQubeData);
      } else if ((iQubeId === "Metis" || iQubeId === "Metis iQube") && metisActivated) {
        setSelectedIQube(metisQubeData);
      } else if (iQubeId === "GDrive") {
        setSelectedIQube(gdriveQubeData);
      }
      
      // If selectTab is true, select the iQube tab in the settings interface
      if (shouldSelectTab) {
        const tabRef = document.querySelector(`[data-tab="iqube"]`);
        if (tabRef) {
          // @ts-ignore
          tabRef.click();
        }
      }
    };

    // Use type assertion for CustomEvent
    window.addEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    
    return () => {
      window.removeEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    };
  }, [metisActivated]);
  
  // Listen for iQube activation/deactivation events from sidebar
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for Metis
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
          } else if (!active && metisVisible) {
            hideMetis();
          }
        }
        
        toast.info(`${iqubeId} iQube ${active ? 'activated' : 'deactivated'}`);
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [metisActivated, metisVisible, activateMetis, hideMetis]);
  
  const handleActivateMetis = () => {
    activateMetis();
    setShowAgentRecommendation(false);
    setActiveQubes(prev => ({...prev, "Metis": true}));
    toast.success("Metis agent activated successfully");
    // Dispatch the metisActivated event
    window.dispatchEvent(new Event('metisActivated'));
  };
  
  const handleDismissAgent = () => {
    setShowAgentRecommendation(false);
    toast.info("Agent recommendation dismissed");
  };

  const toggleQubeActive = (qubeName: string) => {
    if (qubeName === "Metis" && !activeQubes["Metis"]) {
      handleActivateMetis();
      return;
    }
    
    setActiveQubes(prev => ({
      ...prev,
      [qubeName]: !prev[qubeName]
    }));
    
    // Dispatch event for sidebar to update
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: !activeQubes[qubeName] 
      } 
    });
    window.dispatchEvent(event);
    
    toast.info(`${qubeName} iQube ${!activeQubes[qubeName] ? 'activated' : 'deactivated'}`);
  };

  // Sample user settings
  const userSettings: UserSettings = {
    connected: {
      linkedin: false,
      luma: false,
      telegram: true,
      twitter: false,
      discord: true,
      wallet: false
    },
    dataSync: true,
    notifications: true,
    theme: theme as 'dark' | 'light',
    language: 'en'
  };

  return (
    <TooltipProvider>
      <div className="container p-2">
        <div className="flex flex-col md:flex-row justify-between items-center mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* Show agent recommendation if Metis is not activated */}
        {showAgentRecommendation && !metisActivated && (
          <AgentRecommendation 
            agentName="Metis"
            description="Advanced analytics agent with crypto risk analysis capabilities"
            fee={5}
            onActivate={handleActivateMetis}
            onDismiss={handleDismissAgent}
          />
        )}

        {/* Main settings panel */}
        <div className="flex-1">
          <SettingsInterface 
            userSettings={userSettings} 
            metaQube={selectedIQube} 
            activeQubes={activeQubes}
            onToggleIQubeActive={toggleQubeActive}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
