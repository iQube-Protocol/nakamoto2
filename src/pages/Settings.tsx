
import React, { useState, useEffect } from 'react';
import { qubeData, monDaiQubeData } from '@/components/settings/QubeData';
import { MetaQube } from '@/lib/types';
import IQubeSelector from '@/components/settings/IQubeSelector';
import IQubeActivationManager from '@/components/settings/IQubeActivationManager';
import AgentRecommendationHandler from '@/components/settings/AgentRecommendationHandler';
import SettingsContainer from '@/components/settings/SettingsContainer';
import { sonnerToast as toast } from '@/hooks/use-toast';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useOpenAIAgent } from '@/hooks/use-openai-agent';
import { walletConnectionService } from '@/services/wallet-connection-service';

const Settings = () => {
  const [selectedIQube, setSelectedIQube] = useState<MetaQube>(qubeData.monDai);
  const { metisActivated } = useMetisAgent();
  const { qryptoPersonaActivated } = useQryptoPersona();
  const { veniceActivated } = useVeniceAgent();
  const { openAIActivated } = useOpenAIAgent();
  
  const [activeQubes, setActiveQubes] = useState<{[key: string]: boolean}>({
    "Qrypto Persona": qryptoPersonaActivated,
    "KNYT Persona": false, // Will be updated by KNYT hook  
    "Venice": veniceActivated,
    "OpenAI": openAIActivated,
    "Metis": metisActivated,
    "GDrive": false
  });

  const availableIQubes = [
    { id: "Qrypto Persona", name: "Qrypto Persona", type: "DataQube" as const },
    { id: "KNYT Persona", name: "KNYT Persona", type: "DataQube" as const },
    { id: "Venice", name: "Venice", type: "ModelQube" as const },
    { id: "OpenAI", name: "OpenAI", type: "ModelQube" as const },
    { id: "Metis", name: "Metis", type: "AgentQube" as const },
    { id: "GDrive", name: "GDrive", type: "DataQube" as const }
  ];

  // Update wallet connections with KNYT balance on component mount and refresh balance
  useEffect(() => {
    const updateWalletData = async () => {
      try {
        console.log('Settings page loaded, updating wallet data...');
        await walletConnectionService.updateWalletWithKnytBalance();
        
        // Also refresh the balance to ensure it's current
        await walletConnectionService.refreshKnytBalance();
        console.log('Wallet data update completed');
      } catch (error) {
        console.error('Error updating wallet with KNYT balance:', error);
      }
    };

    updateWalletData();
  }, []);

  const toggleQubeActive = (qubeName: string) => {
    const newActiveState = !activeQubes[qubeName];
    let updatedQubes = { ...activeQubes };
    
    // Implement three-way mutual exclusion for AI providers
    if (newActiveState && (qubeName === "Venice" || qubeName === "OpenAI")) {
      if (qubeName === "Venice") {
        updatedQubes["OpenAI"] = false;  // Deactivate OpenAI
      } else if (qubeName === "OpenAI") {
        updatedQubes["Venice"] = false;   // Deactivate Venice
      }
    }
    
    updatedQubes[qubeName] = newActiveState;
    setActiveQubes(updatedQubes);
    
    // Dispatch events for ALL changed qubes
    Object.keys(updatedQubes).forEach(key => {
      if (updatedQubes[key] !== activeQubes[key]) {
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: key, 
            active: updatedQubes[key] 
          } 
        });
        window.dispatchEvent(event);
      }
    });
  };

  return (
    <>
      {/* Component to handle iQube selection events */}
      <IQubeSelector 
        selectedIQube={selectedIQube} 
        setSelectedIQube={setSelectedIQube}
        qubeData={qubeData}
      />
      
      {/* Component to handle iQube activation/deactivation events */}
      <IQubeActivationManager 
        activeQubes={activeQubes} 
        setActiveQubes={setActiveQubes} 
      />
      
      {/* Component to handle Metis agent recommendation */}
      <AgentRecommendationHandler 
        activeQubes={activeQubes} 
        setActiveQubes={setActiveQubes} 
      />
      
      {/* Main settings container */}
      <SettingsContainer 
        activeQubes={activeQubes}
        toggleQubeActive={toggleQubeActive}
        selectedIQube={selectedIQube}
      />
    </>
  );
};

export default Settings;
