
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  mobileOpen: boolean;
  toggleMobileSidebar: () => void;
  children: React.ReactNode;
}

const MobileSidebar = ({ mobileOpen, toggleMobileSidebar, children }: MobileSidebarProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={toggleMobileSidebar}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full transition-transform duration-300 bg-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileSidebar;
