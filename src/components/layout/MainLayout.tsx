
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sidebarConfig, getSidebarItemById } from './sidebar/SidebarConfig';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNavigation from './sidebar/SidebarNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('mondai');
  const location = useLocation();
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Update active sidebar item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching sidebar item
    for (const section of sidebarConfig) {
      for (const item of section.items) {
        if (currentPath === item.href || currentPath.startsWith(item.href + '/')) {
          setActiveSidebarItem(item.id);
          return;
        }
      }
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } border-r bg-card transition-all duration-300 ease-in-out flex-shrink-0`}
        data-sidebar="sidebar"
      >
        <div className="flex flex-col h-full p-4">
          <SidebarHeader 
            collapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
          
          <SidebarNavigation 
            sections={sidebarConfig}
            collapsed={sidebarCollapsed}
            activeItem={activeSidebarItem}
            onItemClick={setActiveSidebarItem}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
