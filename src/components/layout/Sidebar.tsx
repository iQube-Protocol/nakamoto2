
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { navItems, monDaiQubeData, metisQubeData } from './sidebar/sidebarData';
import NavItem from './sidebar/NavItem';
import MetaQubeItem from './sidebar/MetaQubeItem';
import MobileSidebar, { MobileMenuButton } from './sidebar/MobileSidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const isMobile = useIsMobile();
  const { metisActivated, metisVisible, hideMetis } = useMetisAgent();
  const { collapsed, mobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebarState();

  const handleIQubeClick = (iqubeId: string) => {
    console.log("iQube clicked:", iqubeId);
    
    const event = new CustomEvent('iqubeSelected', { 
      detail: { iqubeId: iqubeId } 
    });
    window.dispatchEvent(event);
  };

  const handleCloseMetisIQube = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    hideMetis();
    console.log("Metis iQube closed from sidebar");
  };

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-sidebar py-4 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex items-center mb-6 px-3",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <Link to="/splash" className="flex items-center">
            <Bot className="h-6 w-6 text-iqube-primary mr-2" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-iqube-primary to-iqube-accent inline-block text-transparent bg-clip-text">
              Aigent MonDAI
            </h1>
          </Link>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/splash">
                  <Bot className="h-6 w-6 text-iqube-primary" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                Aigent MonDAI
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleSidebar} 
                  className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  {collapsed ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "left"}>
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={React.createElement(item.icon)}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </div>
      
      <div className="px-3 mt-auto space-y-3">
        <MetaQubeItem 
          metaQube={monDaiQubeData}
          collapsed={collapsed}
          onIQubeClick={handleIQubeClick}
          tooltipType="dataQube"
        />
        
        {metisVisible && (
          <MetaQubeItem 
            metaQube={metisQubeData}
            collapsed={collapsed}
            onIQubeClick={handleIQubeClick}
            onClose={handleCloseMetisIQube}
            tooltipType="agentQube"
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile && <MobileMenuButton mobileOpen={mobileOpen} toggleMobileSidebar={toggleMobileSidebar} />}
      {isMobile && <MobileSidebar mobileOpen={mobileOpen} toggleMobileSidebar={toggleMobileSidebar}>{sidebarContent}</MobileSidebar>}
      {!isMobile && sidebarContent}
    </>
  );
};

export default Sidebar;
