
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  ShieldCheck,
  ShieldAlert,
  Eye,
  Lock,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [collapsed, setCollapsed] = useState(isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { to: "/", icon: <LayoutDashboard />, label: "Dashboard" },
    { to: "/learn", icon: <GraduationCap />, label: "Learn" },
    { to: "/earn", icon: <Wallet />, label: "Earn" },
    { to: "/connect", icon: <Users />, label: "Connect" },
    { to: "/settings", icon: <Settings />, label: "Settings" }
  ];

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
      
      <div className="px-3 mt-auto">
        {!collapsed ? (
          <div className="bg-iqube-primary/10 rounded-md">
            <MetaQubeDisplay 
              metaQube={metaQubeData} 
              compact={true}
            />
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/settings" 
                  className="flex items-center justify-center py-3 px-3 rounded-md transition-all hover:bg-iqube-primary/20 bg-iqube-primary/10"
                >
                  <Database className="h-6 w-6 text-iqube-primary" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-2">
                  <div className="font-semibold">DataQube Settings</div>
                  <div className="text-xs opacity-80">Manage your MonDAI iQube</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
