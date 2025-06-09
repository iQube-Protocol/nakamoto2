
import React from 'react';
import { NavItem as NavItemType, QubeItem } from './sidebarData';
import NavItem from './NavItem';
import IQubesSection from './IQubesSection';

interface MainNavigationProps {
  navItems: NavItemType[];
  activePath: string;
  collapsed: boolean;
  iQubeItems: QubeItem[];
  iQubesOpen: boolean;
  toggleIQubesMenu: () => void;
  selectedIQube: string | null;
  activeQubes: {[key: string]: boolean};
  handleIQubeClick: (iqubeId: string) => void;
  toggleIQubeActive: (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => void;
  location: { pathname: string };
  toggleMobileSidebar?: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  navItems, 
  activePath, 
  collapsed,
  iQubeItems,
  iQubesOpen,
  toggleIQubesMenu,
  selectedIQube,
  activeQubes,
  handleIQubeClick,
  toggleIQubeActive,
  location,
  toggleMobileSidebar
}) => {
  return (
    <div className="flex-1 px-3 py-2 space-y-1">
      {/* Regular Nav Items */}
      {navItems.map((item, index) => (
        <NavItem 
          key={index}
          icon={item.icon}
          href={item.href}
          active={activePath === item.href}
          collapsed={collapsed}
          toggleMobileSidebar={toggleMobileSidebar}
        >
          {item.name}
        </NavItem>
      ))}
      
      {/* iQubes Section - Now placed directly under the navigation items */}
      <IQubesSection 
        iQubeItems={iQubeItems}
        iQubesOpen={iQubesOpen}
        toggleIQubesMenu={toggleIQubesMenu}
        collapsed={collapsed}
        selectedIQube={selectedIQube}
        activeQubes={activeQubes}
        handleIQubeClick={handleIQubeClick}
        toggleIQubeActive={toggleIQubeActive}
        location={location}
        toggleMobileSidebar={toggleMobileSidebar}
      />
    </div>
  );
};

export default MainNavigation;
