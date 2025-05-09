
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="md:hidden"
          >
            <ChevronLeft size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MobileSidebar;
