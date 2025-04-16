
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function useSidebarState() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

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
