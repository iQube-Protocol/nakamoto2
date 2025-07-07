
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
import { walletConnectionService } from '@/services/wallet-connection-service';

const Settings = () => {
  const [selectedIQube, setSelectedIQube] = useState<MetaQube>(qubeData.monDai);
  const { metisActivated } = useMetisAgent();
  const { qryptoPersonaActivated } = useQryptoPersona();
  const { veniceActivated } = useVeniceAgent();
  
  const [activeQubes, setActiveQubes] = useState<{[key: string]: boolean}>({
    "Qrypto Persona": false,
    "KNYT Persona": false,
    "Venice": false,
    "Metis": false, // Keep state but hide from UI
    "GDrive": false,
    "Content": false,
    "Model": false
  });

  // Available iQubes - Metis temporarily removed from UI
  const availableIQubes = [
    { key: 'monDai', data: qubeData.monDai, name: 'Qrypto Persona' },
    { key: 'knytPersona', data: qubeData.knytPersona, name: 'KNYT Persona' },
    { key: 'venice', data: qubeData.venice, name: 'Venice' },
    // Metis temporarily hidden - uncomment to reactivate
    // { key: 'metis', data: qubeData.metis, name: 'Metis' },
    { key: 'gdrive', data: qubeData.gdrive, name: 'GDrive' },
    { key: 'content', data: qubeData.content, name: 'Content' },
    { key: 'model', data: qubeData.model, name: 'Model' }
  ];

  // Update wallet connections with KNYT balance on component mount
  useEffect(() => {
    const updateWalletData = async () => {
      try {
        await walletConnectionService.updateWalletWithKnytBalance();
      } catch (error) {
        console.error('Error updating wallet with KNYT balance:', error);
      }
    };

    updateWalletData();
  }, []);

  // Function to toggle iQube active state
  const toggleQubeActive = (qubeName: string) => {
    const newActiveState = !activeQubes[qubeName];
    
    setActiveQubes(prev => ({
      ...prev,
      [qubeName]: newActiveState
    }));
    
    // Dispatch event for sidebar to update
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: newActiveState 
      } 
    });
    window.dispatchEvent(event);
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
