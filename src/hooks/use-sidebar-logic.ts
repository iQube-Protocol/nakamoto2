
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useAuth } from '@/hooks/use-auth';

export const useSidebarLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const { qryptoPersonaActivated, activateQryptoPersona, deactivateQryptoPersona } = useQryptoPersona();
  const { veniceActivated, veniceVisible, activateVenice, deactivateVenice, hideVenice } = useVeniceAgent();
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
      "Venice": veniceActivated,
      "Metis": metisActivated,
    };
  });

  // Update active states when hook values change
  useEffect(() => {
    setActiveIQubes(prev => ({
      ...prev, 
      "Qrypto Persona": qryptoPersonaActivated,
      "Venice": veniceActivated,
      "Metis": metisActivated
    }));
  }, [qryptoPersonaActivated, veniceActivated, metisActivated]);

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
  }, [metisActivated, metisVisible, activateMetis, hideMetis, activateQryptoPersona, deactivateQryptoPersona, veniceActivated, activateVenice, deactivateVenice]);

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
