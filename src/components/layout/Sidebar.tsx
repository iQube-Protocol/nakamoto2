
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, ChevronDown, ChevronLeft, ChevronRight, 
  Database, User, FolderGit2, Settings as SettingsIcon, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMetisAgent } from '@/hooks/use-metis-agent';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { navItems, iQubeItems } from './sidebar/sidebarData';
import NavItem from './sidebar/NavItem';
import MetaQubeItem from './sidebar/MetaQubeItem';
import MobileSidebar from './sidebar/MobileSidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import CubeIcon from './sidebar/CubeIcon';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { metisActivated, metisVisible, activateMetis, hideMetis } = useMetisAgent();
  const { 
    collapsed, 
    iQubesOpen, 
    mobileOpen, 
    selectedIQube, 
    toggleSidebar, 
    toggleMobileSidebar, 
    toggleIQubesMenu,
    selectIQube 
  } = useSidebarState();
  const { signOut } = useAuth();
  const [activeIQubes, setActiveIQubes] = useState<{[key: string]: boolean}>({
    "MonDAI": true,
    "Metis": metisActivated,
    "GDrive": false
  });

  // Update Metis state whenever metisActivated changes
  useEffect(() => {
    setActiveIQubes(prev => ({...prev, "Metis": metisActivated}));
  }, [metisActivated]);

  // Listen for iQube toggle events from Settings page
  useEffect(() => {
    const handleIQubeToggle = (e: CustomEvent) => {
      const { iqubeId, active } = e.detail || {};
      if (iqubeId) {
        setActiveIQubes(prev => ({...prev, [iqubeId]: active}));
        
        // Special handling for Metis
        if (iqubeId === "Metis") {
          if (active && !metisActivated) {
            activateMetis();
          } else if (!active && metisVisible) {
            hideMetis();
          }
        }
      }
    };
    
    window.addEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    
    return () => {
      window.removeEventListener('iqubeToggle', handleIQubeToggle as EventListener);
    };
  }, [metisActivated, metisVisible, activateMetis, hideMetis]);

  const handleIQubeClick = (iqubeId: string) => {
    console.log("iQube clicked:", iqubeId);
    
    // Set the selected iQube
    selectIQube(iqubeId);
    
    // Navigate to settings page and send event to select this iQube
    navigate('/settings');
    
    const event = new CustomEvent('iqubeSelected', { 
      detail: { 
        iqubeId: iqubeId,
        selectTab: true
      } 
    });
    window.dispatchEvent(event);
  };

  const handleCloseMetisIQube = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    hideMetis();
    setActiveIQubes(prev => ({...prev, "Metis": false}));
    
    // Dispatch event to update Settings page
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: "Metis", 
        active: false 
      } 
    });
    window.dispatchEvent(event);
    
    console.log("Metis iQube closed from sidebar");
  };

  const toggleIQubeActive = (e: React.MouseEvent<HTMLInputElement>, qubeName: string) => {
    e.stopPropagation(); // Prevent the click from triggering the parent element
    
    const newActiveState = !activeIQubes[qubeName];
    setActiveIQubes(prev => ({...prev, [qubeName]: newActiveState}));
    
    // Special handling for Metis
    if (qubeName === "Metis") {
      if (newActiveState) {
        activateMetis();
      } else {
        hideMetis();
      }
    }
    
    // Dispatch event to update Settings page
    const event = new CustomEvent('iqubeToggle', { 
      detail: { 
        iqubeId: qubeName, 
        active: newActiveState 
      } 
    });
    window.dispatchEvent(event);
    
    toast.info(`${qubeName} ${newActiveState ? 'activated' : 'deactivated'}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/signin');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  // Function to render iQube type icon based on type
  const renderIQubeTypeIcon = (type: string) => {
    switch(type) {
      case 'DataQube':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'AgentQube':
        return <Bot className="h-4 w-4 text-purple-500" />;
      case 'ToolQube':
        return <FolderGit2 className="h-4 w-4 text-green-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
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

        {/* Collapse/Expand button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={collapsed ? "hidden" : ""}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {/* Regular Nav Items */}
        {navItems.map((item, index) => (
          <NavItem 
            key={index}
            icon={item.icon}
            href={item.href}
            active={location.pathname === item.href}
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
                      "flex items-center justify-center p-2 rounded-md hover:bg-accent/30 cursor-pointer",
                      location.pathname.includes('/qubes') && "bg-accent/20"
                    )}
                    onClick={toggleIQubesMenu}
                  >
                    <CubeIcon className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">iQubes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Collapsible
              open={iQubesOpen}
              onOpenChange={toggleIQubesMenu}
              className="border-t pt-2"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-accent/30 rounded-md">
                <div className="flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">iQubes</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  iQubesOpen && "transform rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {iQubeItems.map((qube) => (
                  <div 
                    key={qube.id}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-accent/30 cursor-pointer",
                      location.pathname === '/settings' && selectedIQube === qube.name && "bg-accent/20"
                    )}
                    onClick={() => handleIQubeClick(qube.name)}
                  >
                    <div className="flex items-center flex-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="mr-2">
                              {renderIQubeTypeIcon(qube.type)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {qube.type}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="mr-2">{qube.name}</span>
                    </div>
                    <Switch 
                      size="sm" 
                      checked={activeIQubes[qube.name] || false}
                      onCheckedChange={(e) => toggleIQubeActive(e as any, qube.name)}
                      className="data-[state=checked]:bg-iqube-primary"
                    />
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Active iQubes - Updated to remove "iQube" from titles */}
      <div className="mt-auto px-3">
        <div className="mb-2 px-2">
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && <h3 className="text-xs font-medium uppercase text-muted-foreground">Active iQubes</h3>}
          </div>
        </div>
        
        {/* Active iQubes list with updated titles */}
        {activeIQubes["MonDAI"] && (
          <div
            className={cn(
              "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
              collapsed ? "justify-center" : "",
              location.pathname === '/settings' && selectedIQube === "MonDAI" && "bg-accent/20"
            )}
            onClick={() => handleIQubeClick("MonDAI")}
          >
            <Database className={cn("h-5 w-5 text-blue-500", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>MonDAI</span>}
          </div>
        )}
        
        {activeIQubes["Metis"] && (
          <div
            className={cn(
              "flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer group",
              collapsed ? "justify-center" : "",
              location.pathname === '/settings' && selectedIQube === "Metis" && "bg-accent/20"
            )}
            onClick={() => handleIQubeClick("Metis")}
          >
            <div className="flex items-center">
              <Bot className={cn("h-5 w-5 text-purple-500", collapsed ? "" : "mr-2")} />
              {!collapsed && <span>Metis</span>}
            </div>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={handleCloseMetisIQube}
              >
                <ChevronLeft size={14} />
              </Button>
            )}
          </div>
        )}
        
        {activeIQubes["GDrive"] && (
          <div
            className={cn(
              "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
              collapsed ? "justify-center" : "",
              location.pathname === '/settings' && selectedIQube === "GDrive" && "bg-accent/20"
            )}
            onClick={() => handleIQubeClick("GDrive")}
          >
            <FolderGit2 className={cn("h-5 w-5 text-green-500", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>GDrive</span>}
          </div>
        )}

        {/* Sign Out button */}
        <div className="mt-2 pt-2 border-t">
          <Button 
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center text-sm text-muted-foreground hover:text-foreground",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>Sign out</span>}
          </Button>
        </div>
      </div>

      {/* Expand button when collapsed - moved to a more centered location */}
      {collapsed && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
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
