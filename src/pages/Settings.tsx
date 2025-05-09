
import React, { useState, useEffect } from 'react';
import SettingsInterface from '@/components/settings/SettingsInterface';
import { UserSettings, MetaQube } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import AgentRecommendation from '@/components/shared/agent/AgentRecommendation';
import { toast } from 'sonner';

// Sample metaQube data for MonDAI (DataQube)
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

// Sample metaQube data for Metis (AgentQube)
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

// Sample metaQube data for GDrive (ToolQube)
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

// Define private data for each iQube type
const dataQubePrivateData = {
  "Profession": "Software Developer",
  "Web3-Interests": ["DeFi", "NFTs", "DAOs"],
  "Local-City": "San Francisco",
  "Email": "user@example.com",
  "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "BTC-Public-Key": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "Tokens-of-Interest": ["ETH", "BTC", "MATIC"],
  "Chain-IDs": ["1", "137"],
  "Wallets-of-Interest": ["MetaMask", "Rainbow"]
};

const agentQubePrivateData = {
  "AI-Capabilities": ["Data Analysis", "NLP", "Blockchain Insights"],
  "Model Weights": "Transformer 12B",
  "Training Data": ["Web3 Data", "Financial Markets", "Public Data"],
  "Model-Version": "1.3.7",
  "API Key": "••••••••••••••••",
  "Access-Control": "Permissioned",
  "Data-Sources": ["On-chain", "User Input", "External APIs"],
  "Refresh-Interval": "24h",
  "Trustworthiness": "Verified"
};

const toolQubePrivateData = {
  "Storage-Quota": "15GB",
  "Connected-Email": "user@example.com",
  "Auto-Sync": "Enabled",
  "Sharing-Permissions": "Private",
  "Cached-Files": ["Doc1.pdf", "Presentation.ppt"],
  "API-Key": "••••••••••••••••",
  "Last-Sync": "2023-05-01T12:00:00Z",
  "Default-View": "List",
  "File-Count": "128"
};

const Settings = () => {
  const { theme } = useTheme();
  const [selectedIQube, setSelectedIQube] = useState<MetaQube>(monDaiQubeData);
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const [showAgentRecommendation, setShowAgentRecommendation] = useState(!metisActivated);
  const [activeQubes, setActiveQubes] = useState<{[key: string]: boolean}>({
    "MonDAI": true,
    "Metis": metisActivated,
    "GDrive": false
  });
  
  // State for private data of each iQube type
  const [mondaiPrivateData, setMondaiPrivateData] = useState(dataQubePrivateData);
  const [metisPrivateData, setMetisPrivateData] = useState(agentQubePrivateData);
  const [gdrivePrivateData, setGdrivePrivateData] = useState(toolQubePrivateData);
  
  // Update active state when metisActivated changes
  useEffect(() => {
    setActiveQubes(prev => ({...prev, "Metis": metisActivated}));
  }, [metisActivated]);
  
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
      } else if ((iQubeId === "Metis" || iQubeId === "Metis iQube")) {
        setSelectedIQube(metisQubeData);
      } else if (iQubeId === "GDrive" || iQubeId === "GDrive iQube") {
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
  }, []);
  
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
            setShowAgentRecommendation(false);
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
    
    // Dispatch the toggle event to update sidebar
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: "Metis", 
        active: true 
      } 
    });
    window.dispatchEvent(event);
  };
  
  const handleDismissAgent = () => {
    setShowAgentRecommendation(false);
    toast.info("Agent recommendation dismissed");
  };

  const toggleQubeActive = (qubeName: string) => {
    const newActiveState = !activeQubes[qubeName];
    
    setActiveQubes(prev => ({
      ...prev,
      [qubeName]: newActiveState
    }));
    
    // Special handling for Metis
    if (qubeName === "Metis") {
      if (newActiveState) {
        activateMetis();
        setShowAgentRecommendation(false);
      } else {
        hideMetis();
      }
    }
    
    // Dispatch event for sidebar to update
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: newActiveState 
      } 
    });
    window.dispatchEvent(event);
    
    toast.info(`${qubeName} iQube ${newActiveState ? 'activated' : 'deactivated'}`);
  };

  // Function to get the appropriate private data based on selected iQube
  const getPrivateData = () => {
    if (selectedIQube["iQube-Identifier"] === "Metis iQube") {
      return metisPrivateData;
    } else if (selectedIQube["iQube-Identifier"] === "GDrive iQube") {
      return gdrivePrivateData;
    } else {
      return mondaiPrivateData;
    }
  };

  // Function to update the appropriate private data based on selected iQube
  const handleUpdatePrivateData = (newData: any) => {
    if (selectedIQube["iQube-Identifier"] === "Metis iQube") {
      setMetisPrivateData(newData);
    } else if (selectedIQube["iQube-Identifier"] === "GDrive iQube") {
      setGdrivePrivateData(newData);
    } else {
      setMondaiPrivateData(newData);
    }

    toast({
      title: `${selectedIQube["iQube-Identifier"]} Data Updated`,
      description: "Private data has been updated successfully",
    });
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
            privateData={getPrivateData()}
            onUpdatePrivateData={handleUpdatePrivateData}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
