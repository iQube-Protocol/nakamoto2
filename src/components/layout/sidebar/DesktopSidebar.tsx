
import React from 'react';
import SidebarContent from './SidebarContent';

interface DesktopSidebarProps {
  sidebarContentProps: any;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ sidebarContentProps }) => {
  return (
    <div className="border-r shadow-sm">
      <SidebarContent {...sidebarContentProps} />
    </div>
  );
};

export default DesktopSidebar;
