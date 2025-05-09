
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useSidebarState() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    // Try to get saved state from localStorage
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState ? JSON.parse(savedState) : isMobile;
  });
  
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Added state to track iQubes submenu
  const [iQubesOpen, setIQubesOpen] = useState(() => {
    const savedState = localStorage.getItem('iqubes-collapsed');
    return savedState ? JSON.parse(savedState) : true;
  });

  // Add state to track which iQube is selected
  const [selectedIQube, setSelectedIQube] = useState<string | null>('MonDAI');

  useEffect(() => {
    // Save collapsed state to localStorage when it changes
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    // Save iQubes submenu state to localStorage
    localStorage.setItem('iqubes-collapsed', JSON.stringify(iQubesOpen));
  }, [iQubesOpen]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleIQubesMenu = () => {
    setIQubesOpen(!iQubesOpen);
  };

  const selectIQube = (qubeName: string) => {
    setSelectedIQube(qubeName);
  };

  return {
    collapsed,
    mobileOpen,
    iQubesOpen,
    selectedIQube,
    toggleSidebar,
    toggleMobileSidebar,
    toggleIQubesMenu,
    selectIQube
  };
}
