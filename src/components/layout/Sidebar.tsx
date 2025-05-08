
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { navItems, iQubeItems, monDaiQubeData, metisQubeData } from './sidebar/sidebarData';
import NavItem from './sidebar/NavItem';
import MetaQubeItem from './sidebar/MetaQubeItem';
import MobileSidebar from './sidebar/MobileSidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { metisActivated, metisVisible, hideMetis } = useMetisAgent();
  const { collapsed, mobileOpen } = useSidebarState();
  const [iQubesOpen, setIQubesOpen] = React.useState(true);

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
      </div>

      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item, index) => (
          <NavItem 
            key={index}
            icon={item.icon}
            href={item.href}
            active={location.pathname.includes(item.href)}
            collapsed={collapsed}
          >
            {item.name}
          </NavItem>
        ))}

        {/* iQubes Collapsible Section */}
        <div className="pt-2">
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md hover:bg-accent cursor-pointer",
                      location.pathname.includes('/qubes') && "bg-accent"
                    )}
                    onClick={() => setIQubesOpen(!iQubesOpen)}
                  >
                    <Cube className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">iQubes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Collapsible
              open={iQubesOpen}
              onOpenChange={setIQubesOpen}
              className="border-t pt-2"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-accent rounded-md">
                <span className="text-sm font-medium">iQubes</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  iQubesOpen && "transform rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {iQubeItems.map((qube) => (
                  <Link 
                    key={qube.id}
                    to={qube.href}
                    className={cn(
                      "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-accent",
                      location.pathname.includes(qube.href) && "bg-accent/50"
                    )}
                  >
                    <qube.icon className="h-4 w-4 mr-2" />
                    <span>{qube.name}</span>
                    <span className="text-xs ml-auto opacity-60">{qube.type}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Active iQubes */}
      <div className="mt-auto px-3">
        <div className="mb-2 px-2">
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && <h3 className="text-xs font-medium uppercase text-muted-foreground">Active iQubes</h3>}
          </div>
        </div>
        
        {/* MonDAI iQube */}
        <MetaQubeItem
          id={monDaiQubeData.id}
          name={monDaiQubeData.name}
          type={monDaiQubeData.type}
          active={monDaiQubeData.active}
          collapsed={collapsed}
          onClick={() => handleIQubeClick(monDaiQubeData.id)}
        />
        
        {/* Metis iQube - Only shown if activated */}
        {metisActivated && metisVisible && (
          <MetaQubeItem
            id={metisQubeData.id}
            name={metisQubeData.name}
            type={metisQubeData.type}
            active={true}
            collapsed={collapsed}
            onClick={() => handleIQubeClick(metisQubeData.id)}
            onClose={handleCloseMetisIQube}
          />
        )}
      </div>
    </div>
  );

  // Render mobile sidebar if on mobile, otherwise render desktop sidebar
  if (isMobile) {
    return <MobileSidebar>{sidebarContent}</MobileSidebar>;
  }

  return (
    <div className={cn(
      "border-r shadow-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
