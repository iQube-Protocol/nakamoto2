
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import ScoreTooltip from '../../ScoreTooltips';
import { Cpu } from 'lucide-react';
import MetisAgentBadge from './MetisAgentBadge';

interface MetadataBadgeProps {
  metadata: {
    version?: string;
    modelUsed?: string;
    contextRetained?: boolean;
    metisActive?: boolean;
    [key: string]: any;
  } | null;
}

const MetadataBadge = ({ metadata }: MetadataBadgeProps) => {
  const [isMetisActive, setIsMetisActive] = useState(false);
  
  // Listen for Metis activation/deactivation
  useEffect(() => {
    // Check local storage on mount
    const storedState = localStorage.getItem('metisActive');
    setIsMetisActive(storedState === 'true');
    
    // Listen for toggling events
    const handleMetisToggled = (e: CustomEvent) => {
      const isActive = e.detail?.active;
      setIsMetisActive(isActive);
    };
    
    window.addEventListener('metisToggled', handleMetisToggled as EventListener);
    
    return () => {
      window.removeEventListener('metisToggled', handleMetisToggled as EventListener);
    };
  }, []);
  
  if (!metadata) return null;
  
  // Use our state or fallback to the prop
  const metisActive = isMetisActive || metadata.metisActive === true;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
              <span className="text-muted-foreground">MCP v{metadata.version || '1.0'}</span>
            </Badge>
            {metadata.modelUsed && (
              <ScoreTooltip type="mlModel">
                <Badge variant="secondary" className="text-[10px] py-0 h-4 flex items-center">
                  <Cpu className="h-3 w-3 mr-1" />
                  {metadata.modelUsed}
                </Badge>
              </ScoreTooltip>
            )}
            <MetisAgentBadge isActive={metisActive} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Using Model Context Protocol</p>
          {metadata.contextRetained && 
            <p className="text-xs text-muted-foreground">Context maintained between messages</p>
          }
          {metisActive &&
            <p className="text-xs text-violet-500 font-medium">Metis Agent active</p>
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetadataBadge;
