
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapseButtonProps {
  toggleSidebar: () => void;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ toggleSidebar }) => {
  return (
    <div className="flex justify-center mt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="rounded-full"
        aria-label="Expand sidebar"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
};

export default CollapseButton;
