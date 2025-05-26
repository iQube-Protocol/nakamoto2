
import React from 'react';
import { cn } from '@/lib/utils';
import { Database, Bot, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavItem from './NavItem';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActiveIQubesListProps {
  activeQubes: {[key: string]: boolean};
  collapsed: boolean;
  onIQubeClick: (iqubeId: string) => void;
  onCloseIQube?: (e: React.MouseEvent<HTMLButtonElement>, qubeName: string) => void;
  toggleMobileSidebar?: () => void;
}

const ActiveIQubesList: React.FC<ActiveIQubesListProps> = ({
  activeQubes,
  collapsed,
  onIQubeClick,
  onCloseIQube,
  toggleMobileSidebar
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="px-3 pb-4">
      <div className="mb-3 px-2">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <h3 className="text-xs font-medium uppercase text-muted-foreground">Active iQubes</h3>}
        </div>
      </div>
      
      {/* Active iQubes list */}
      <div className="space-y-1">
        {activeQubes["Qrypto Persona"] && (
          <div
            className={cn(
              "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
              collapsed ? "justify-center" : ""
            )}
            onClick={() => {
              onIQubeClick("Qrypto Persona");
              if (isMobile && toggleMobileSidebar) {
                toggleMobileSidebar();
              }
            }}
          >
            <Database className={cn("h-5 w-5 text-blue-500", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>Qrypto Persona</span>}
          </div>
        )}
        
        {activeQubes["Metis"] && (
          <div
            className={cn(
              "flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer group",
              collapsed ? "justify-center" : ""
            )}
            onClick={() => {
              onIQubeClick("Metis");
              if (isMobile && toggleMobileSidebar) {
                toggleMobileSidebar();
              }
            }}
          >
            <div className="flex items-center">
              <Bot className={cn("h-5 w-5 text-purple-500", collapsed ? "" : "mr-2")} />
              {!collapsed && <span>Metis</span>}
            </div>
            {!collapsed && onCloseIQube && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => onCloseIQube(e, "Metis")}
              >
                <ChevronLeft size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveIQubesList;
