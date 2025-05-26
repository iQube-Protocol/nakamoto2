
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sidebarConfig, getSidebarItemById } from './sidebar/SidebarConfig';
import SidebarHeader from './sidebar/SidebarHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
          
          {/* Navigation sections */}
          <nav className="flex-1 mt-6">
            {sidebarConfig.map((section) => (
              <div key={section.id} className="mb-6">
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    {section.label}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSidebarItem === item.id;
                    
                    if (sidebarCollapsed) {
                      return (
                        <TooltipProvider key={item.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.href}
                                className={cn(
                                  "flex items-center justify-center h-10 w-10 rounded-md transition-colors",
                                  isActive 
                                    ? "bg-iqube-primary/20 text-iqube-primary" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                                onClick={() => setActiveSidebarItem(item.id)}
                              >
                                <Icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div>
                                <div className="font-medium">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                          isActive 
                            ? "bg-iqube-primary/20 text-iqube-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        onClick={() => setActiveSidebarItem(item.id)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
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
