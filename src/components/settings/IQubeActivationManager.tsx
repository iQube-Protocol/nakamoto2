import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';
import { useOpenAIAgent } from '@/hooks/use-openai-agent';
import { useChainGPTAgent } from '@/hooks/use-chaingpt-agent';

interface IQubeActivationManagerProps {
  activeQubes: { [key: string]: boolean };
  setActiveQubes: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const IQubeActivationManager = ({ 
  activeQubes, 
  setActiveQubes 
}: IQubeActivationManagerProps) => {
  const { qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona } = useQryptoPersona();
  const { veniceActivated, veniceVisible, activateVenice, deactivateVenice, hideVenice } = useVeniceAgent();
  const { knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, hideKNYTPersona } = useKNYTPersona();
  const { openAIActivated, openAIVisible, activateOpenAI, deactivateOpenAI, hideOpenAI } = useOpenAIAgent();
  const { chainGPTActivated, chainGPTVisible, activateChainGPT, deactivateChainGPT, hideChainGPT } = useChainGPTAgent();

  // Sync component state with hook states
  useEffect(() => {
    setActiveQubes(prev => ({
      ...prev,
      "Qrypto Persona": qryptoPersonaActivated,
      "KNYT Persona": knytPersonaActivated,
      "Venice": veniceActivated,
      "OpenAI": openAIActivated,
      "ChainGPT": chainGPTActivated
    }));
  }, [qryptoPersonaActivated, knytPersonaActivated, veniceActivated, openAIActivated, chainGPTActivated, setActiveQubes]);

  // Listen for iQube activation/deactivation events from sidebar
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for each iQube type
        if (iqubeId === "Qrypto Persona") {
          if (active && !qryptoPersonaActivated) {
            activateQryptoPersona();
            toast.info(`Qrypto Persona activated`);
          } else if (!active && qryptoPersonaActivated) {
            deactivateQryptoPersona();
            toast.info(`Qrypto Persona deactivated`);
          }
        } else if (iqubeId === "Venice") {
          if (active && !veniceActivated) {
            activateVenice();
            toast.info("Venice activated");
          } else if (!active && veniceActivated) {
            deactivateVenice();
            toast.info("Venice deactivated");
          }
        } else if (iqubeId === "OpenAI") {
          if (active && !openAIActivated) {
            activateOpenAI();
            toast.info("OpenAI activated");
          } else if (!active && openAIActivated) {
            deactivateOpenAI();
            toast.info("OpenAI deactivated");
          }
        } else if (iqubeId === "KNYT Persona") {
          if (active && !knytPersonaActivated) {
            activateKNYTPersona();
            toast.info(`KNYT Persona activated`);
          } else if (!active && knytPersonaActivated) {
            deactivateKNYTPersona();
            toast.info(`KNYT Persona deactivated`);
          }
        } else if (iqubeId === "ChainGPT") {
          if (active && !chainGPTActivated) {
            activateChainGPT();
            toast.info("ChainGPT activated");
          } else if (!active && chainGPTActivated) {
            deactivateChainGPT();
            toast.info("ChainGPT deactivated");
          }
        } else {
          toast.info(`${iqubeId} ${active ? 'activated' : 'deactivated'}`);
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona, veniceActivated, activateVenice, deactivateVenice, openAIActivated, activateOpenAI, deactivateOpenAI, knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, chainGPTActivated, activateChainGPT, deactivateChainGPT, setActiveQubes]);

  return null; // This is a logic-only component, no UI
};

export default IQubeActivationManager;