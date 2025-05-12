
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { QubeItem } from './sidebarData';
import MetaQubeItem from './MetaQubeItem';
import CubeIcon from './CubeIcon';

interface IQubesSectionProps {
  iQubeItems: QubeItem[];
  iQubesOpen: boolean;
  toggleIQubesMenu: () => void;
  collapsed: boolean;
  selectedIQube: string | null;
  activeQubes: {[key: string]: boolean};
  handleIQubeClick: (iqubeId: string) => void;
  toggleIQubeActive: (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => void;
  location: { pathname: string };
  onNavigate?: () => void;
}

const IQubesSection = ({
  iQubeItems,
  iQubesOpen,
  toggleIQubesMenu,
  collapsed,
  selectedIQube,
  activeQubes,
  handleIQubeClick,
  toggleIQubeActive,
  location,
  onNavigate,
}: IQubesSectionProps) => {
  const handleItemClick = (iqubeId: string) => {
    handleIQubeClick(iqubeId);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="mt-4">
      {/* iQubes Section Header */}
      <div
        onClick={toggleIQubesMenu}
        className={cn(
          "flex items-center p-2 text-sm font-medium cursor-pointer rounded-md hover:bg-accent/30",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <div className="flex items-center">
          <CubeIcon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
          {!collapsed && <span>My iQubes</span>}
        </div>
        {!collapsed && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              iQubesOpen ? "transform rotate-90" : ""
            )}
          />
        )}
      </div>

      {/* iQubes Items List */}
      {iQubesOpen && !collapsed && (
        <div className="pl-4 pr-1">
          {iQubeItems.map((item) => (
            <MetaQubeItem
              key={item.id}
              qubeName={item.name}
              active={activeQubes[item.name] || false}
              selected={selectedIQube === item.name}
              onClick={() => handleItemClick(item.name)}
              onToggleActive={(e) => toggleIQubeActive(e, item.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IQubesSection;
