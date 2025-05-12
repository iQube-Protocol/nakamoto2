
import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ActiveIQubesListProps {
  activeQubes: { [key: string]: boolean };
  collapsed: boolean;
  onIQubeClick: (iqubeId: string) => void;
  onCloseIQube: (e: React.MouseEvent<HTMLButtonElement>, qubeName: string) => void;
}

const ActiveIQubesList: React.FC<ActiveIQubesListProps> = ({
  activeQubes,
  collapsed,
  onIQubeClick,
  onCloseIQube,
}) => {
  // Filter active qubes
  const activeQubesList = Object.entries(activeQubes)
    .filter(([_, isActive]) => isActive)
    .map(([name]) => name);

  // Don't render if no active qubes
  if (activeQubesList.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-auto mb-4", collapsed ? "px-2" : "px-3")}>
      {!collapsed && (
        <h3 className="px-2 mb-1 text-xs uppercase text-muted-foreground">
          Active
        </h3>
      )}
      
      <div className="space-y-1">
        {activeQubesList.map((qubeName) => (
          <div 
            key={qubeName}
            className={cn(
              "group relative flex items-center rounded-md px-2 py-1.5 cursor-pointer",
              "text-sm hover:bg-accent/30",
              collapsed ? "justify-center" : "justify-between"
            )}
            onClick={() => onIQubeClick(qubeName)}
          >
            {/* Qube indicator and name */}
            <div className="flex items-center">
              <div className={cn(
                "h-2 w-2 rounded-full bg-green-500 mr-2",
                collapsed && "mr-0"
              )} />
              {!collapsed && <span>{qubeName}</span>}
            </div>
            
            {/* Close button */}
            {!collapsed && qubeName === "Metis" && (
              <button
                onClick={(e) => onCloseIQube(e, qubeName)}
                className="opacity-0 group-hover:opacity-100 hover:bg-accent/50 p-1 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveIQubesList;
