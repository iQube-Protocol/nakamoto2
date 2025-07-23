
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useAuth } from '@/hooks/use-auth';

export const useSidebarLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const { qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona } = useQryptoPersona();
  const { veniceActivated, veniceVisible, activateVenice, deactivateVenice, hideVenice } = useVeniceAgent();
  const { knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, hideKNYTPersona } = useKNYTPersona();
  const { 
    collapsed, 
    iQubesOpen, 
    mobileOpen, 
    selectedIQube, 
    toggleSidebar, 
    toggleMobileSidebar, 
    toggleIQubesMenu,
    selectIQube 
  } = useSidebarState();
  const { signOut } = useAuth();
  
  // Initialize activeIQubes with proper state from hooks
  const [activeIQubes, setActiveIQubes] = useState<{[key: string]: boolean}>(() => {
    return {
      "Qrypto Persona": qryptoPersonaActivated,
      "KNYT Persona": knytPersonaActivated,
      "Venice": veniceActivated,
      "Metis": metisActivated,
    };
  });

  // Update active states when hook values change
  useEffect(() => {
    setActiveIQubes(prev => ({
      ...prev, 
      "Qrypto Persona": qryptoPersonaActivated,
      "KNYT Persona": knytPersonaActivated,
      "Venice": veniceActivated,
      "Metis": metisActivated
    }));
  }, [qryptoPersonaActivated, knytPersonaActivated, veniceActivated, metisActivated]);

  // Listen for agent activation events from AgentActivationModal
  useEffect(() => {
    const handleQryptoPersonaStateChanged = (e: CustomEvent) => {
      const { activated } = e.detail || {};
      console.log('Qrypto Persona state changed event received:', activated);
      
      if (activated) {
        activateQryptoPersona();
        setActiveIQubes(prev => ({...prev, "Qrypto Persona": true}));
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

    const handleMetisActivated = (e: CustomEvent) => {
      console.log('Metis activated event received');
      activateMetis();
      setActiveIQubes(prev => ({...prev, "Metis": true}));
    };

    window.addEventListener('qryptoPersonaStateChanged', handleQryptoPersonaStateChanged as EventListener);
    window.addEventListener('knytPersonaStateChanged', handleKNYTPersonaStateChanged as EventListener);
    window.addEventListener('veniceStateChanged', handleVeniceStateChanged as EventListener);
    window.addEventListener('metisActivated', handleMetisActivated as EventListener);
    
    return () => {
      window.removeEventListener('qryptoPersonaStateChanged', handleQryptoPersonaStateChanged as EventListener);
      window.removeEventListener('knytPersonaStateChanged', handleKNYTPersonaStateChanged as EventListener);
      window.removeEventListener('veniceStateChanged', handleVeniceStateChanged as EventListener);
      window.removeEventListener('metisActivated', handleMetisActivated as EventListener);
    };
  }, [activateQryptoPersona, activateKNYTPersona, activateVenice, activateMetis]);

  // Listen for iQube toggle events from Settings page
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveIQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for each iQube type
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
          } else if (!active && metisVisible) {
            hideMetis();
          }
        } else if (iqubeId === "Qrypto Persona") {
          if (active) {
            activateQryptoPersona();
          } else {
            deactivateQryptoPersona();
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
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [metisActivated, metisVisible, activateMetis, hideMetis, activateQryptoPersona, deactivateQryptoPersona, knytPersonaActivated, activateKNYTPersona, deactivateKNYTPersona, veniceActivated, activateVenice, deactivateVenice]);

  const handleIQubeClick = (iqubeId: string) => {
    console.log("iQube clicked:", iqubeId);
    
    // Set the selected iQube
    selectIQube(iqubeId);
    
    // Navigate to settings page and send event to select this iQube
    navigate('/settings');
    
    const event = new CustomEvent('iqubeSelected', { 
      detail: { 
        iqubeId: iqubeId,
        selectTab: true
      } 
    });
    window.dispatchEvent(event);
  };

  const handleCloseMetisIQube = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    hideMetis();
    setActiveIQubes(prev => ({...prev, "Metis": false}));
    
    // Dispatch event to update Settings page
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: "Metis", 
        active: false 
      } 
    });
    window.dispatchEvent(event);
    
    console.log("Metis iQube closed from sidebar");
  };

  const toggleIQubeActive = (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => {
    e.stopPropagation(); // Prevent the click from triggering the parent element
    
    const newActiveState = !activeIQubes[qubeName];
    setActiveIQubes(prev => ({...prev, [qubeName]: newActiveState}));
    
    // Use the appropriate hook methods for each iQube type
    if (qubeName === "Metis") {
      if (newActiveState) {
        activateMetis();
      } else {
        hideMetis();
      }
    } else if (qubeName === "Qrypto Persona") {
      if (newActiveState) {
        activateQryptoPersona();
      } else {
        deactivateQryptoPersona();
      }
    } else if (qubeName === "KNYT Persona") {
      if (newActiveState) {
        activateKNYTPersona();
      } else {
        deactivateKNYTPersona();
      }
    } else if (qubeName === "Venice") {
      if (newActiveState) {
        activateVenice();
      } else {
        deactivateVenice();
      }
    }
    
    // Dispatch event to update Settings page
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: newActiveState 
      } 
    });
    window.dispatchEvent(event);
    
    toast.info(`${qubeName} ${newActiveState ? 'activated' : 'deactivated'}`);
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
    mobileOpen,
    selectedIQube,
    activeIQubes,
    toggleSidebar,
    toggleMobileSidebar,
    toggleIQubesMenu,
    handleIQubeClick,
    toggleIQubeActive,
    handleCloseMetisIQube,
    handleSignOut
  };
};
