
import React from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarState } from '@/hooks/use-sidebar-state';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { collapsed } = useSidebarState();
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - always present but may be collapsed */}
      <div className={`${collapsed && !isMobile ? 'w-16' : 'w-64'} transition-all duration-300 shrink-0`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
