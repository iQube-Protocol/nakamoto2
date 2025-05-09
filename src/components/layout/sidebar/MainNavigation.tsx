
import React from 'react';
import { NavItem as NavItemType } from './sidebarData';
import NavItem from './NavItem';

interface MainNavigationProps {
  navItems: NavItemType[];
  activePath: string;
  collapsed: boolean;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ navItems, activePath, collapsed }) => {
  return (
    <div className="flex-1 px-3 space-y-1">
      {/* Regular Nav Items */}
      {navItems.map((item, index) => (
        <NavItem 
          key={index}
          icon={item.icon}
          href={item.href}
          active={activePath === item.href}
          collapsed={collapsed}
        >
          {item.name}
        </NavItem>
      ))}
    </div>
  );
};

export default MainNavigation;
