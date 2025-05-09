
import React, { useState } from 'react';
import { qubeData, monDaiQubeData } from '@/components/settings/QubeData';
import IQubeSelector from '@/components/settings/IQubeSelector';
import IQubeActivationManager from '@/components/settings/IQubeActivationManager';
import AgentRecommendationHandler from '@/components/settings/AgentRecommendationHandler';
import SettingsContainer from '@/components/settings/SettingsContainer';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';

const Settings = () => {
  const [selectedIQube, setSelectedIQube] = useState(monDaiQubeData);
  const { metisActivated } = useMetisAgent();
  const [activeQubes, setActiveQubes] = useState<{[key: string]: boolean}>({
    "MonDAI": true,
    "Metis": metisActivated,
    "GDrive": false
  });

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
    
    toast.info(`${qubeName} ${newActiveState ? 'activated' : 'deactivated'}`);
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
