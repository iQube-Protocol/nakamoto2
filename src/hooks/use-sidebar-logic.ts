
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useQriptoPersona } from './use-qripto-persona';
import { useVeniceAgent } from './use-venice-agent';
import { useKNYTPersona } from './use-knyt-persona';
import { useOpenAIAgent } from './use-openai-agent';
import { useChainGPTAgent } from './use-chaingpt-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useAuth } from '@/hooks/use-auth';

export const useSidebarLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { qriptoPersonaActivated, activateQriptoPersona, deactivateQriptoPersona } = useQriptoPersona();
  const { veniceActivated, veniceVisible, activateVenice, deactivateVenice, hideVenice } = useVeniceAgent();
  const { knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, hideKNYTPersona } = useKNYTPersona();
  const { openAIActivated, openAIVisible, activateOpenAI, deactivateOpenAI, hideOpenAI } = useOpenAIAgent();
  const { chainGPTActivated, chainGPTVisible, activateChainGPT, deactivateChainGPT, hideChainGPT } = useChainGPTAgent();
  const { 
    collapsed, 
    iQubesOpen,
    personaOpen,
    aaActionsOpen,
    mobileOpen, 
    selectedIQube, 
    toggleSidebar, 
    toggleMobileSidebar, 
    toggleIQubesMenu,
    togglePersonaMenu,
    toggleAAActionsMenu,
    selectIQube 
  } = useSidebarState();
  const { signOut } = useAuth();
  
  // Initialize activeIQubes with proper state from hooks
  const [activeIQubes, setActiveIQubes] = useState<{[key: string]: boolean}>(() => {
    return {
      "Qripto Persona": qriptoPersonaActivated,
      "KNYT Persona": knytPersonaActivated,
      "Venice": veniceActivated,
      "OpenAI": openAIActivated,
      "ChainGPT": chainGPTActivated,
    };
  });

  // Update active states when hook values change
  useEffect(() => {
    setActiveIQubes(prev => ({
      ...prev, 
      "Qripto Persona": qriptoPersonaActivated,
      "KNYT Persona": knytPersonaActivated,
      "Venice": veniceActivated,
      "OpenAI": openAIActivated,
      "ChainGPT": chainGPTActivated,
    }));
  }, [qriptoPersonaActivated, knytPersonaActivated, veniceActivated, openAIActivated, chainGPTActivated]);

  // Listen for agent activation events from AgentActivationModal
  useEffect(() => {
    const handleQriptoPersonaStateChanged = (e: CustomEvent) => {
      const { activated } = e.detail || {};
      console.log('Qrypto Persona state changed event received:', activated);
      
      if (activated) {
        activateQriptoPersona();
        setActiveIQubes(prev => ({...prev, "Qripto Persona": true}));
      }
    };

    const handleKNYTPersonaStateChanged = (e: CustomEvent) => {
      const { activated } = e.detail || {};
      console.log('KNYT Persona state changed event received:', activated);
      
      if (activated) {
        activateKNYTPersona();
        setActiveIQubes(prev => ({...prev, "KNYT Persona": true}));
      }
    };

    const handleVeniceStateChanged = (e: CustomEvent) => {
      const { activated, visible } = e.detail || {};
      console.log('Venice state changed event received:', activated, visible);
      
      if (activated && visible) {
        activateVenice();
        setActiveIQubes(prev => ({...prev, "Venice": true}));
      }
    };

    const handleOpenAIStateChanged = (e: CustomEvent) => {
      const { activated, visible } = e.detail || {};
      console.log('OpenAI state changed event received:', activated, visible);
      
      if (activated && visible) {
        activateOpenAI();
        setActiveIQubes(prev => ({...prev, "OpenAI": true}));
      }
    };

    const handleChainGPTStateChanged = (e: CustomEvent) => {
      const { activated, visible } = e.detail || {};
      console.log('ChainGPT state changed event received:', activated, visible);
      
      if (activated && visible) {
        activateChainGPT();
        setActiveIQubes(prev => ({...prev, "ChainGPT": true}));
      }
    };

    window.addEventListener('qriptoPersonaStateChanged', handleQriptoPersonaStateChanged as EventListener);
    window.addEventListener('knytPersonaStateChanged', handleKNYTPersonaStateChanged as EventListener);
    window.addEventListener('veniceStateChanged', handleVeniceStateChanged as EventListener);
    window.addEventListener('openAIStateChanged', handleOpenAIStateChanged as EventListener);
    window.addEventListener('chainGPTStateChanged', handleChainGPTStateChanged as EventListener);
    
    return () => {
      window.removeEventListener('qriptoPersonaStateChanged', handleQriptoPersonaStateChanged as EventListener);
      window.removeEventListener('knytPersonaStateChanged', handleKNYTPersonaStateChanged as EventListener);
      window.removeEventListener('veniceStateChanged', handleVeniceStateChanged as EventListener);
      window.removeEventListener('openAIStateChanged', handleOpenAIStateChanged as EventListener);
      window.removeEventListener('chainGPTStateChanged', handleChainGPTStateChanged as EventListener);
    };
  }, [activateQriptoPersona, activateKNYTPersona, activateVenice, activateOpenAI, activateChainGPT]);

  // Listen for iQube toggle events from Settings page
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveIQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for each iQube type
        if (iqubeId === "Qripto Persona") {
          if (active) {
            activateQriptoPersona();
          } else {
            deactivateQriptoPersona();
          }
        } else if (iqubeId === "KNYT Persona") {
          if (active) {
            activateKNYTPersona();
          } else {
            deactivateKNYTPersona();
          }
        } else if (iqubeId === "Venice") {
          if (active) {
            activateVenice();
          } else {
            deactivateVenice();
          }
        } else if (iqubeId === "OpenAI") {
          if (active) {
            activateOpenAI();
          } else {
            deactivateOpenAI();
          }
        } else if (iqubeId === "ChainGPT") {
          if (active) {
            activateChainGPT();
          } else {
            deactivateChainGPT();
          }
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [activateQriptoPersona, deactivateQriptoPersona, knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, veniceActivated, activateVenice, deactivateVenice, openAIActivated, activateOpenAI, deactivateOpenAI, chainGPTActivated, activateChainGPT, deactivateChainGPT]);

  const handleIQubeClick = (iqubeId: string) => {
    console.log("iQube clicked:", iqubeId);
    
    // Set the selected iQube
    selectIQube(iqubeId);
    
    // Navigate: Personas -> /profile, others -> /settings
    if (iqubeId === "Qripto Persona" || iqubeId === "KNYT Persona") {
      navigate('/profile');
    } else {
      navigate('/settings');
    }
    
    const event = new CustomEvent('iqubeSelected', { 
      detail: { 
        iqubeId,
        selectTab: true
      } 
    });
    window.dispatchEvent(event);
  };


  const toggleIQubeActive = (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => {
    e.stopPropagation(); // Prevent the click from triggering the parent element
    
    const newActiveState = !activeIQubes[qubeName];
    let updatedActiveQubes = { ...activeIQubes };
    
    // Implement three-way mutual exclusion for AI providers
    if (newActiveState && (qubeName === "Venice" || qubeName === "OpenAI" || qubeName === "ChainGPT")) {
      if (qubeName === "Venice") {
        updatedActiveQubes["OpenAI"] = false;  // Deactivate OpenAI
        updatedActiveQubes["ChainGPT"] = false;  // Deactivate ChainGPT
      } else if (qubeName === "OpenAI") {
        updatedActiveQubes["Venice"] = false;   // Deactivate Venice
        updatedActiveQubes["ChainGPT"] = false;   // Deactivate ChainGPT
      } else if (qubeName === "ChainGPT") {
        updatedActiveQubes["Venice"] = false;   // Deactivate Venice
        updatedActiveQubes["OpenAI"] = false;   // Deactivate OpenAI
      }
    }
    
    // Implement mutual exclusion for Persona iQubes
    if (newActiveState && (qubeName === "Qripto Persona" || qubeName === "KNYT Persona")) {
      if (qubeName === "Qripto Persona") {
        updatedActiveQubes["KNYT Persona"] = false;  // Deactivate KNYT Persona
      } else if (qubeName === "KNYT Persona") {
        updatedActiveQubes["Qripto Persona"] = false;   // Deactivate Qripto Persona
      }
    }
    
    updatedActiveQubes[qubeName] = newActiveState;
    setActiveIQubes(updatedActiveQubes);
    
    // Use the appropriate hook methods for each iQube type
    if (qubeName === "Qripto Persona") {
      if (newActiveState) {
        activateQriptoPersona();
        // Deactivate KNYT Persona
        if (knytPersonaActivated) {
          deactivateKNYTPersona();
        }
      } else {
        deactivateQriptoPersona();
      }
    } else if (qubeName === "KNYT Persona") {
      if (newActiveState) {
        activateKNYTPersona();
        // Deactivate Qripto Persona
        if (qriptoPersonaActivated) {
          deactivateQriptoPersona();
        }
      } else {
        deactivateKNYTPersona();
      }
    } else if (qubeName === "Venice") {
      if (newActiveState) {
        activateVenice();
        // Deactivate OpenAI
        if (openAIActivated) {
          deactivateOpenAI();
        }
      } else {
        deactivateVenice();
      }
    } else if (qubeName === "OpenAI") {
      if (newActiveState) {
        activateOpenAI();
        // Deactivate Venice and ChainGPT
        if (veniceActivated) {
          deactivateVenice();
        }
        if (chainGPTActivated) {
          deactivateChainGPT();
        }
      } else {
        deactivateOpenAI();
      }
    } else if (qubeName === "ChainGPT") {
      if (newActiveState) {
        activateChainGPT();
        // Deactivate Venice and OpenAI
        if (veniceActivated) {
          deactivateVenice();
        }
        if (openAIActivated) {
          deactivateOpenAI();
        }
      } else {
        deactivateChainGPT();
      }
    }
    
    // Dispatch events for ALL changed qubes
    Object.keys(updatedActiveQubes).forEach(key => {
      if (updatedActiveQubes[key] !== activeIQubes[key]) {
        const event = new CustomEvent('iqubeToggle', { 
          detail: { 
            iqubeId: key, 
            active: updatedActiveQubes[key] 
          } 
        });
        window.dispatchEvent(event);
      }
    });
    
    toast.info(`${qubeName} ${newActiveState ? 'activated' : 'deactivated'}`);
    
    // Additional feedback for mutual exclusion
    if ((qubeName === "Venice" && newActiveState && (activeIQubes["OpenAI"] || activeIQubes["ChainGPT"])) ||
        (qubeName === "OpenAI" && newActiveState && (activeIQubes["Venice"] || activeIQubes["ChainGPT"])) ||
        (qubeName === "ChainGPT" && newActiveState && (activeIQubes["Venice"] || activeIQubes["OpenAI"]))) {
      setTimeout(() => {
        const deactivatedProviders = [];
        if (qubeName === "Venice") {
          if (activeIQubes["OpenAI"]) deactivatedProviders.push("OpenAI");
          if (activeIQubes["ChainGPT"]) deactivatedProviders.push("ChainGPT");
        } else if (qubeName === "OpenAI") {
          if (activeIQubes["Venice"]) deactivatedProviders.push("Venice");
          if (activeIQubes["ChainGPT"]) deactivatedProviders.push("ChainGPT");
        } else if (qubeName === "ChainGPT") {
          if (activeIQubes["Venice"]) deactivatedProviders.push("Venice");
          if (activeIQubes["OpenAI"]) deactivatedProviders.push("OpenAI");
        }
        if (deactivatedProviders.length > 0) {
          toast.info(`${deactivatedProviders.join(" and ")} automatically deactivated`);
        }
      }, 500);
    }
    
    if ((qubeName === "Qripto Persona" && newActiveState && activeIQubes["KNYT Persona"]) ||
        (qubeName === "KNYT Persona" && newActiveState && activeIQubes["Qripto Persona"])) {
      setTimeout(() => {
        toast.info(`${qubeName === "Qripto Persona" ? "KNYT Persona" : "Qripto Persona"} automatically deactivated`);
      }, 500);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/signin');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  return {
    location,
    collapsed,
    iQubesOpen,
    personaOpen,
    aaActionsOpen,
    mobileOpen,
    selectedIQube,
    activeIQubes,
    toggleSidebar,
    toggleMobileSidebar,
    toggleIQubesMenu,
    togglePersonaMenu,
    toggleAAActionsMenu,
    handleIQubeClick,
    toggleIQubeActive,
    
    handleSignOut
  };
};
