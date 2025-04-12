
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Wallet, 
  Users, 
  Settings,
  Menu,
  X,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MetaQubeDisplay from '@/components/shared/MetaQubeDisplay';
import { MetaQube } from '@/lib/types';

// Sample metaQube data - this would typically come from a context or prop
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
      <div className="mr-3 text-xl">{icon}</div>
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <div className="absolute left-16 rounded-md px-2 py-1 ml-6 bg-iqube-dark text-foreground
          scale-0 group-hover:scale-100 transition-all duration-100 origin-left z-50">
          {label}
        </div>
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
        {!collapsed && (
          <Link to="/splash" className="flex items-center">
            <Bot className="h-6 w-6 text-iqube-primary mr-2" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-iqube-primary to-iqube-accent inline-block text-transparent bg-clip-text">
              Aigent MonDAI
            </h1>
          </Link>
        )}
        {collapsed && (
          <Link to="/splash">
            <Bot className="h-6 w-6 text-iqube-primary" />
          </Link>
        )}
        {!isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <Menu className={cn("h-5 w-5", !collapsed && "hidden")} />
            <X className={cn("h-5 w-5", collapsed && "hidden")} />
          </button>
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
      
      {/* Replace the previous MonDAI active panel with MetaQubeDisplay */}
      <div className="px-3 mt-auto">
        <MetaQubeDisplay 
          metaQube={metaQubeData} 
          compact={true} 
          className={cn(collapsed && "scale-90 origin-center")}
        />
      </div>
    </div>
  );

  // Mobile hamburger menu
  const mobileMenuButton = isMobile && (
    <button
      onClick={toggleMobileSidebar}
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-accent text-sidebar-foreground"
    >
      {mobileOpen ? <X /> : <Menu />}
    </button>
  );

  // Mobile sidebar overlay
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
