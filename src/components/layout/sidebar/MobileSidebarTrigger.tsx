
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MobileSidebarTriggerProps {
  toggleMobileSidebar: () => void;
}

const MobileSidebarTrigger: React.FC<MobileSidebarTriggerProps> = ({ toggleMobileSidebar }) => {
  return (
    <Button 
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden bg-transparent hover:bg-white/10 border-0 shadow-none transition-all"
      onClick={toggleMobileSidebar}
      style={{ touchAction: 'manipulation' }}
      aria-label="Toggle menu"
    >
      <Menu size={24} className="text-foreground/70" />
    </Button>
  );
};

export default MobileSidebarTrigger;
