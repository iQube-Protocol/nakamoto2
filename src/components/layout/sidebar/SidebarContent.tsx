
import React from 'react';
import { cn } from '@/lib/utils';
import SidebarHeader from './SidebarHeader';
import MainNavigation from './MainNavigation';
import ActiveIQubesList from './ActiveIQubesList';
import SignOutButton from './SignOutButton';
import CollapseButton from './CollapseButton';
import { mainNavItems, iQubeItems, QubeItem } from './sidebarData';

interface SidebarContentProps {
  collapsed: boolean;
  iQubesOpen: boolean;
  selectedIQube: string | null;
  activeQubes: {[key: string]: boolean};
  location: { pathname: string };
  toggleSidebar: () => void;
  toggleIQubesMenu: () => void;
  handleIQubeClick: (iqubeId: string) => void;
  toggleIQubeActive: (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => void;
  handleCloseMetisIQube: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSignOut: () => void;
  toggleMobileSidebar?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  collapsed,
  iQubesOpen,
  selectedIQube,
  activeQubes,
  location,
  toggleSidebar,
  toggleIQubesMenu,
  handleIQubeClick,
  toggleIQubeActive,
  handleCloseMetisIQube,
  handleSignOut,
  toggleMobileSidebar
}) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header with logo and collapse button */}
      <div className="py-2">
        <SidebarHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Navigation */}
      <MainNavigation 
        navItems={mainNavItems} 
        activePath={location.pathname} 
        collapsed={collapsed} 
        iQubeItems={iQubeItems}
        iQubesOpen={iQubesOpen}
        toggleIQubesMenu={toggleIQubesMenu}
        selectedIQube={selectedIQube}
        activeQubes={activeQubes}
        handleIQubeClick={handleIQubeClick}
        toggleIQubeActive={toggleIQubeActive}
        location={location}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      {/* Active iQubes - Fixed at bottom */}
      <div className="mt-auto">
        <ActiveIQubesList 
          activeQubes={activeQubes}
          collapsed={collapsed}
          onIQubeClick={handleIQubeClick}
          onCloseIQube={(e, qubeName) => {
            e.stopPropagation();
            if (qubeName === "Metis") {
              handleCloseMetisIQube(e);
            }
          }}
          toggleMobileSidebar={toggleMobileSidebar}
        />

        {/* Sign Out button */}
        <SignOutButton collapsed={collapsed} onSignOut={handleSignOut} />

        {/* Expand button when collapsed */}
        {collapsed && <CollapseButton toggleSidebar={toggleSidebar} />}
      </div>
    </div>
  );
};

export default SidebarContent;
