import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, ChevronDown } from 'lucide-react';
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
import { MetaQube } from '@/lib/types';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { metisActivated, metisVisible, hideMetis } = useMetisAgent();
  const { collapsed, mobileOpen, toggleMobileSidebar } = useSidebarState();
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

  // Function to dynamically render the icon
  const renderIcon = (IconComponent: React.ElementType) => {
    return <IconComponent className="h-5 w-5" />;
  };

  // Sample MetaQube objects
  const monDaiMetaQube: MetaQube = {
    "iQube-Identifier": "MonDAI-001",
    "iQube-Type": "DataQube",
    "iQube-Designer": "Aigent Z",
    "iQube-Use": "For learning in web3 communities",
    "Owner-Type": "Person",
    "Owner-Identifiability": "Semi-Identifiable",
    "Date-Minted": new Date().toISOString(),
    "Related-iQubes": ["ContentQube1"],
    "X-of-Y": "1 of 1",
    "Sensitivity-Score": 3,
    "Verifiability-Score": 8,
    "Accuracy-Score": 8,
    "Risk-Score": 3
  };

  const metisMetaQube: MetaQube = {
    "iQube-Identifier": "Metis-001",
    "iQube-Type": "AgentQube",
    "iQube-Designer": "Aigent Z",
    "iQube-Use": "AI assistance for learning and research",
    "Owner-Type": "Person",
    "Owner-Identifiability": "Semi-Identifiable",
    "Date-Minted": new Date().toISOString(),
    "Related-iQubes": ["MonDAI-001"],
    "X-of-Y": "1 of 1",
    "Sensitivity-Score": 2,
    "Verifiability-Score": 9,
    "Accuracy-Score": 9,
    "Risk-Score": 2
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
                    {renderIcon(iQubeItems[0].icon)}
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
                    {renderIcon(qube.icon)}
                    <span className="ml-2">{qube.name}</span>
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
          metaQube={monDaiMetaQube}
          collapsed={collapsed}
          onIQubeClick={() => handleIQubeClick("MonDAI iQube")}
        />
        
        {/* Metis iQube - Only shown if activated */}
        {metisActivated && metisVisible && (
          <MetaQubeItem
            metaQube={metisMetaQube}
            collapsed={collapsed}
            onIQubeClick={() => handleIQubeClick("Metis iQube")}
            onClose={handleCloseMetisIQube}
            tooltipType="agentQube"
          />
        )}
      </div>
    </div>
  );

  // Render mobile sidebar if on mobile, otherwise render desktop sidebar
  if (isMobile) {
    return (
      <MobileSidebar 
        mobileOpen={mobileOpen} 
        toggleMobileSidebar={toggleMobileSidebar}
      >
        {sidebarContent}
      </MobileSidebar>
    );
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
