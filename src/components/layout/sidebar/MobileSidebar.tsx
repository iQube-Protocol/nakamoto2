
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

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
          "absolute left-0 top-0 h-full transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const MobileMenuButton = ({ mobileOpen, toggleMobileSidebar }: { mobileOpen: boolean; toggleMobileSidebar: () => void }) => {
  return (
    <button
      onClick={toggleMobileSidebar}
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-accent text-sidebar-foreground"
    >
      {mobileOpen ? <ChevronLeft /> : <ChevronLeft className="rotate-180" />}
    </button>
  );
};

export default MobileSidebar;
