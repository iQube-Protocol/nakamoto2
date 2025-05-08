
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

  useEffect(() => {
    // Save collapsed state to localStorage when it changes
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return {
    collapsed,
    mobileOpen,
    toggleSidebar,
    toggleMobileSidebar
  };
}
