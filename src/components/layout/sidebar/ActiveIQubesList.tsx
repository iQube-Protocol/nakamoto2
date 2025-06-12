
import React from 'react';
import { cn } from '@/lib/utils';
import { Database, Bot, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  
  // Function to get tooltip content based on qube name
  const getTooltipContent = (qubeName: string) => {
    if (qubeName === "Qrypto Persona") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Qrypto Persona</div>
          <div className="text-xs">
            Profile information about the user that when activated will be injected into the context window of the Agent, enabling it to give personalized responses.
          </div>
        </div>
      );
    }
    if (qubeName === "Venice") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Venice Agent</div>
          <div className="text-xs">
            AI service that protects privacy and prevents censorship.
          </div>
        </div>
      );
    }
    if (qubeName === "Metis") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Metis Agent</div>
          <div className="text-xs">
            An algorithm that evaluates risks associated with wallets and tokens.
          </div>
        </div>
      );
    }
    return null;
  };
  
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("Qrypto Persona")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {activeQubes["Venice"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => {
                    onIQubeClick("Venice");
                    if (isMobile && toggleMobileSidebar) {
                      toggleMobileSidebar();
                    }
                  }}
                >
                  <Bot className={cn("h-5 w-5 text-green-500", collapsed ? "" : "mr-2")} />
                  {!collapsed && <span>Venice</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("Venice")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {activeQubes["Metis"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("Metis")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default ActiveIQubesList;
