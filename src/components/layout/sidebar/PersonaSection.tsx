import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Database, User } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { QubeItem } from './sidebarData';
import { useIsMobile } from '@/hooks/use-mobile';

interface PersonaSectionProps {
  personaItems: QubeItem[];
  personaOpen: boolean;
  togglePersonaMenu: () => void;
  collapsed: boolean;
  selectedIQube: string | null;
  activeQubes: {[key: string]: boolean};
  handleIQubeClick: (iqubeId: string) => void;
  toggleIQubeActive: (e: React.MouseEvent<HTMLDivElement>, qubeName: string) => void;
  location: { pathname: string };
  toggleMobileSidebar?: () => void;
}

const PersonaSection: React.FC<PersonaSectionProps> = ({
  personaItems,
  personaOpen,
  togglePersonaMenu,
  collapsed,
  selectedIQube,
  activeQubes,
  handleIQubeClick,
  toggleIQubeActive,
  location,
  toggleMobileSidebar
}) => {
  const isMobile = useIsMobile();
  
  // Function to render persona type icon based on specific persona name
  const renderPersonaTypeIcon = (personaName: string) => {
    if (personaName === "KNYT Persona") {
      return <Database className="h-4 w-4 text-purple-500" />;
    }
    // Default to blue for Qrypto Persona
    return <Database className="h-4 w-4 text-blue-500" />;
  };

  const handlePersonaItemClick = (personaId: string) => {
    handleIQubeClick(personaId);
    
    // If on mobile, also close the sidebar
    if (isMobile && toggleMobileSidebar) {
      toggleMobileSidebar();
    }
  };

  // Function to get tooltip content based on persona name
  const getTooltipContent = (personaName: string) => {
    if (personaName === "Qrypto Persona") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">Qrypto Persona</div>
          <div className="text-xs">
            Profile information about the user that when activated will be injected into the context window of the Agent, enabling it to give personalized responses.
          </div>
        </div>
      );
    }
    if (personaName === "KNYT Persona") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">KNYT Persona</div>
          <div className="text-xs">
            KNYT ecosystem profile with 2,800 Satoshi reward for completing LinkedIn, MetaMask, and data requirements.
          </div>
        </div>
      );
    }
    return null;
  };

  if (collapsed) {
    return (
      <div className="pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center p-2 rounded-md hover:bg-accent/30 cursor-pointer",
                  location.pathname === '/profile' && "bg-accent/20"
                )}
                onClick={togglePersonaMenu}
              >
                <User className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Persona</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Collapsible
        open={personaOpen}
        onOpenChange={togglePersonaMenu}
        className="border-t pt-2"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-accent/30 rounded-md">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Persona</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            personaOpen && "transform rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 px-2">
          {personaItems.map((persona) => (
            <div 
              key={persona.id}
              className={cn(
                "flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-accent/30 cursor-pointer",
                location.pathname === '/profile' && selectedIQube === persona.name && "bg-accent/20"
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => handlePersonaItemClick(persona.name)}
                    >
                      <span className="mr-2">
                        {renderPersonaTypeIcon(persona.name)}
                      </span>
                      <span className="mr-2">{persona.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    {getTooltipContent(persona.name)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div 
                className="switch-container" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleIQubeActive(e, persona.name);
                }}
              >
                <Switch 
                  size="sm" 
                  checked={activeQubes[persona.name] || false}
                  className="data-[state=checked]:bg-iqube-primary"
                />
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PersonaSection;