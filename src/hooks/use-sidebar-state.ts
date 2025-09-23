import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useSidebarState() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    // Try to get saved state from localStorage
    const savedState = localStorage.getItem('sidebar-collapsed');
    // Default to collapsed on mobile, expanded on desktop
    return savedState ? JSON.parse(savedState) : isMobile;
  });
  
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Added state to track iQubes submenu
  const [iQubesOpen, setIQubesOpen] = useState(() => {
    const savedState = localStorage.getItem('iqubes-collapsed');
    return savedState ? JSON.parse(savedState) : true;
  });

  // Added state to track persona submenu
  const [personaOpen, setPersonaOpen] = useState(() => {
    const savedState = localStorage.getItem('persona-collapsed');
    return savedState ? JSON.parse(savedState) : true;
  });

  // Add state to track which iQube is selected
  const [selectedIQube, setSelectedIQube] = useState<string | null>(() => {
    const savedState = localStorage.getItem('selected-iqube');
    return savedState || 'Qrypto Persona';
  });

  useEffect(() => {
    // Save collapsed state to localStorage when it changes
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    // Save iQubes submenu state to localStorage
    localStorage.setItem('iqubes-collapsed', JSON.stringify(iQubesOpen));
  }, [iQubesOpen]);

  useEffect(() => {
    // Save persona submenu state to localStorage
    localStorage.setItem('persona-collapsed', JSON.stringify(personaOpen));
  }, [personaOpen]);

  useEffect(() => {
    // Save selected iQube to localStorage
    if (selectedIQube) {
      localStorage.setItem('selected-iqube', selectedIQube);
    }
  }, [selectedIQube]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleIQubesMenu = () => {
    setIQubesOpen(!iQubesOpen);
  };

  const togglePersonaMenu = () => {
    setPersonaOpen(!personaOpen);
  };

  const selectIQube = (qubeName: string) => {
    setSelectedIQube(qubeName);
  };

  return {
    collapsed,
    mobileOpen,
    iQubesOpen,
    personaOpen,
    selectedIQube,
    toggleSidebar,
    toggleMobileSidebar,
    toggleIQubesMenu,
    togglePersonaMenu,
    selectIQube
  };
}
