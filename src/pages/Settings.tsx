
import React, { useState, useEffect } from 'react';
import SettingsInterface from '@/components/settings/SettingsInterface';
import { UserSettings, MetaQube } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';

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

const Settings = () => {
  const { theme } = useTheme();
  const [selectedIQube, setSelectedIQube] = useState<MetaQube>(monDaiQubeData);
  const [metisActivated, setMetisActivated] = useState(false);
  
  // Listen for Metis activation
  useEffect(() => {
    const metisActiveStatus = localStorage.getItem('metisActive');
    if (metisActiveStatus === 'true') {
      setMetisActivated(true);
    }

    const handleMetisActivated = () => {
      setMetisActivated(true);
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);
  
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

        {/* Main settings panel */}
        <div className="flex-1">
          <SettingsInterface userSettings={userSettings} metaQube={selectedIQube} />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
