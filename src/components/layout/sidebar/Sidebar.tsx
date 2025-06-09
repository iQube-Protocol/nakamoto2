
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import MobileSidebar from './MobileSidebar';
import SidebarContent from './SidebarContent';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
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
  
  const [activeIQubes, setActiveIQubes] = useState<{[key: string]: boolean}>({
    "Qrypto Persona": true,
    "Metis": metisActivated,
  });

  // Update Metis state whenever metisActivated changes
  useEffect(() => {
    setActiveIQubes(prev => ({...prev, "Metis": metisActivated}));
  }, [metisActivated]);

  // Listen for iQube toggle events from Settings page
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveIQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for Metis
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
          } else if (!active && metisVisible) {
            hideMetis();
          }
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [metisActivated, metisVisible, activateMetis, hideMetis]);

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
    
    // Special handling for Metis
    if (qubeName === "Metis") {
      if (newActiveState) {
        activateMetis();
      } else {
        hideMetis();
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

  const sidebarContentProps = {
    collapsed,
    iQubesOpen,
    selectedIQube,
    activeQubes: activeIQubes,
    location,
    toggleSidebar,
    toggleIQubesMenu,
    handleIQubeClick,
    toggleIQubeActive,
    handleCloseMetisIQube,
    handleSignOut,
    toggleMobileSidebar // Pass this down to child components
  };

  // Render mobile sidebar if on mobile, otherwise render desktop sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button - Nearly transparent for logo visibility */}
        <Button 
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-transparent hover:bg-white/10 border-0 shadow-none transition-all"
          onClick={toggleMobileSidebar}
          style={{ touchAction: 'manipulation' }}
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-foreground/70" />
        </Button>
        
        <MobileSidebar 
          mobileOpen={mobileOpen} 
          toggleMobileSidebar={toggleMobileSidebar}
        >
          <SidebarContent {...sidebarContentProps} />
        </MobileSidebar>
      </>
    );
  }

  return (
    <div className="border-r shadow-sm">
      <SidebarContent {...sidebarContentProps} />
    </div>
  );
};

export default Sidebar;
