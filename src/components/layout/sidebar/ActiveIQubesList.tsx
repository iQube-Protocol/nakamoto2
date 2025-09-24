
import React from 'react';
import { cn } from '@/lib/utils';
import { Database, Bot, Brain, ChevronLeft } from 'lucide-react';
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
    if (qubeName === "Qripto Persona") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Qripto Persona</div>
          <div className="text-xs">
            Profile information about the user that when activated will be injected into the context window of the Agent, enabling it to give personalized responses.
          </div>
        </div>
      );
    }
    if (qubeName === "KNYT Persona") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">KNYT Persona</div>
          <div className="text-xs">
            KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements.
          </div>
        </div>
      );
    }
    if (qubeName === "Venice") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Venice Model</div>
          <div className="text-xs">
            AI model service that protects privacy and prevents censorship.
          </div>
        </div>
      );
    }
    if (qubeName === "OpenAI") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">OpenAI Model</div>
          <div className="text-xs">
            Advanced AI model service with cutting-edge language capabilities.
          </div>
        </div>
      );
    }
    if (qubeName === "ChainGPT") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">ChainGPT Model</div>
          <div className="text-xs">
            Blockchain-focused AI model with high trust and privacy protection.
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
        {activeQubes["Qripto Persona"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => {
                     onIQubeClick("Qripto Persona");
                    if (isMobile && toggleMobileSidebar) {
                      toggleMobileSidebar();
                    }
                  }}
                >
                  <Database className={cn("h-5 w-5 text-blue-500", collapsed ? "" : "mr-2")} />
                   {!collapsed && <span>Qripto Persona</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                 {getTooltipContent("Qripto Persona")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {activeQubes["KNYT Persona"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => {
                    onIQubeClick("KNYT Persona");
                    if (isMobile && toggleMobileSidebar) {
                      toggleMobileSidebar();
                    }
                  }}
                >
                  <Database className={cn("h-5 w-5 text-purple-500", collapsed ? "" : "mr-2")} />
                  {!collapsed && <span>KNYT Persona</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("KNYT Persona")}
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
                  <Brain className={cn("h-5 w-5 text-green-500", collapsed ? "" : "mr-2")} />
                  {!collapsed && <span>Venice</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("Venice")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {activeQubes["OpenAI"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => {
                    onIQubeClick("OpenAI");
                    if (isMobile && toggleMobileSidebar) {
                      toggleMobileSidebar();
                    }
                  }}
                >
                  <Brain className={cn("h-5 w-5 text-blue-500", collapsed ? "" : "mr-2")} />
                  {!collapsed && <span>OpenAI</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("OpenAI")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {activeQubes["ChainGPT"] && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm hover:bg-accent/30 cursor-pointer",
                    collapsed ? "justify-center" : ""
                  )}
                  onClick={() => {
                    onIQubeClick("ChainGPT");
                    if (isMobile && toggleMobileSidebar) {
                      toggleMobileSidebar();
                    }
                  }}
                >
                  <Brain className={cn("h-5 w-5 text-orange-500", collapsed ? "" : "mr-2")} />
                  {!collapsed && <span>ChainGPT</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} align="center">
                {getTooltipContent("ChainGPT")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
      </div>
    </div>
  );
};

export default ActiveIQubesList;
