import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Wallet, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Database,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreTooltip from '@/components/shared/ScoreTooltips';

const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["ContentQube1", "AgentQube1"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

const metisQubeData: MetaQube = {
  "iQube-Identifier": "Metis iQube",
  "iQube-Type": "AgentQube",
  "iQube-Designer": "Aigent Metis",
  "iQube-Use": "Advanced agent for data analysis and insights",
  "Owner-Type": "Organization",
  "Owner-Identifiability": "Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["DataQube1", "ContentQube2"],
  "X-of-Y": "3 of 15",
  "Sensitivity-Score": 3,
  "Verifiability-Score": 8,
  "Accuracy-Score": 7,
  "Risk-Score": 3
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center py-3 px-3 rounded-md transition-all hover:bg-iqube-primary/20 group",
          isActive ? "bg-iqube-primary/20 text-iqube-primary" : "text-sidebar-foreground"
        )
      }
    >
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <div className="text-xl">{icon}</div>
                <span className="sr-only">{label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          <div className="mr-3 text-xl">{icon}</div>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metisActivated, setMetisActivated] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const handleMetisActivated = () => {
      console.log('Sidebar: Metis agent activation detected');
      setMetisActivated(true);
    };

    window.addEventListener('metisActivated', handleMetisActivated);
    
    const metisActiveStatus = localStorage.getItem('metisActive');
    if (metisActiveStatus === 'true') {
      setMetisActivated(true);
    }
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
    };
  }, []);

  const navItems = [
    { to: "/", icon: <LayoutDashboard />, label: "Dashboard" },
    { to: "/learn", icon: <GraduationCap />, label: "Learn" },
    { to: "/earn", icon: <Wallet />, label: "Earn" },
    { to: "/connect", icon: <Users />, label: "Connect" },
    { to: "/settings", icon: <Settings />, label: "Settings" }
  ];

  const CubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );

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
                  <ChevronLeft className={cn("h-5 w-5", collapsed && "hidden")} />
                  <ChevronRight className={cn("h-5 w-5", !collapsed && "hidden")} />
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
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </div>
      
      <div className="px-3 mt-auto space-y-3">
        {!collapsed ? (
          <>
            <div className="bg-iqube-primary/10 rounded-md">
              <MetaQubeDisplay 
                metaQube={metaQubeData} 
                compact={true}
              />
            </div>
            {metisActivated && (
              <div className="bg-purple-500/10 rounded-md">
                <MetaQubeDisplay 
                  metaQube={metisQubeData} 
                  compact={true}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <ScoreTooltip type="dataQube">
              <Link 
                to="/settings" 
                className="flex items-center justify-center py-3 px-3 rounded-md transition-all hover:bg-iqube-primary/20 bg-iqube-primary/10"
              >
                <div className="text-iqube-primary h-6 w-6">
                  <CubeIcon />
                </div>
              </Link>
            </ScoreTooltip>
            {metisActivated && (
              <ScoreTooltip type="agentQube">
                <Link 
                  to="/settings" 
                  className="flex items-center justify-center py-3 px-3 rounded-md transition-all hover:bg-purple-500/20 bg-purple-500/10"
                >
                  <div className="text-iqube-primary h-6 w-6">
                    <CubeIcon />
                  </div>
                </Link>
              </ScoreTooltip>
            )}
          </>
        )}
      </div>
    </div>
  );

  const mobileMenuButton = isMobile && (
    <button
      onClick={toggleMobileSidebar}
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-accent text-sidebar-foreground"
    >
      {mobileOpen ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );

  const mobileSidebar = isMobile && (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={toggleMobileSidebar}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarContent}
      </div>
    </div>
  );

  return (
    <>
      {mobileMenuButton}
      {mobileSidebar}
      {!isMobile && sidebarContent}
    </>
  );
};

export default Sidebar;
