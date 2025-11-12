
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarLogic } from '@/hooks/use-sidebar-logic';
import MobileSidebar from './sidebar/MobileSidebar';
import SidebarContent from './sidebar/SidebarContent';
import MobileSidebarTrigger from './sidebar/MobileSidebarTrigger';
import DesktopSidebar from './sidebar/DesktopSidebar';

const Sidebar = () => {
  const isMobile = useIsMobile();
  const sidebarLogic = useSidebarLogic();

  const sidebarContentProps = {
    collapsed: sidebarLogic.collapsed,
    iQubesOpen: sidebarLogic.iQubesOpen,
    personaOpen: sidebarLogic.personaOpen,
    aaActionsOpen: sidebarLogic.aaActionsOpen,
    selectedIQube: sidebarLogic.selectedIQube,
    activeQubes: sidebarLogic.activeIQubes,
    location: sidebarLogic.location,
    toggleSidebar: sidebarLogic.toggleSidebar,
    toggleIQubesMenu: sidebarLogic.toggleIQubesMenu,
    togglePersonaMenu: sidebarLogic.togglePersonaMenu,
    toggleAAActionsMenu: sidebarLogic.toggleAAActionsMenu,
    handleIQubeClick: sidebarLogic.handleIQubeClick,
    toggleIQubeActive: sidebarLogic.toggleIQubeActive,
    
    handleSignOut: sidebarLogic.handleSignOut,
    toggleMobileSidebar: sidebarLogic.toggleMobileSidebar
  };

  // Render mobile sidebar if on mobile, otherwise render desktop sidebar
  if (isMobile) {
    return (
      <>
        <MobileSidebarTrigger toggleMobileSidebar={sidebarLogic.toggleMobileSidebar} />
        
        <MobileSidebar 
          mobileOpen={sidebarLogic.mobileOpen} 
          toggleMobileSidebar={sidebarLogic.toggleMobileSidebar}
        >
          <SidebarContent {...sidebarContentProps} />
        </MobileSidebar>
      </>
    );
  }

  return <DesktopSidebar sidebarContentProps={sidebarContentProps} />;
};

export default Sidebar;
