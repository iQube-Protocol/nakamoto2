
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
  const [isMetisRemoved, setIsMetisRemoved] = useState(false);
  
  // Listen for Metis activation/deactivation
  useEffect(() => {
    // Check local storage on mount
    const metisRemoved = localStorage.getItem('metisRemoved');
    const storedState = localStorage.getItem('metisActive');
    
    setIsMetisRemoved(metisRemoved === 'true');
    setIsMetisActive(storedState === 'true');
    
    // Listen for toggling events
    const handleMetisToggled = (e: CustomEvent) => {
      const isActive = e.detail?.active;
      console.log('MetadataBadge: Metis toggled event received:', isActive);
      setIsMetisActive(isActive);
    };
    
    // Listen for direct activation events
    const handleMetisActivated = () => {
      console.log('MetadataBadge: Metis activated event received');
      setIsMetisActive(true);
    };
    
    // Listen for removal events
    const handleMetisRemoved = () => {
      setIsMetisRemoved(true);
      setIsMetisActive(false);
    };
    
    window.addEventListener('metisToggled', handleMetisToggled as EventListener);
    window.addEventListener('metisActivated', handleMetisActivated as EventListener);
    window.addEventListener('metisRemoved', handleMetisRemoved as EventListener);
    
    return () => {
      window.removeEventListener('metisToggled', handleMetisToggled as EventListener);
      window.removeEventListener('metisActivated', handleMetisActivated as EventListener);
      window.removeEventListener('metisRemoved', handleMetisRemoved as EventListener);
    };
  }, []);
  
  if (!metadata) return null;
  
  // Use our state or fallback to the prop, but only if Metis hasn't been removed
  const metisActive = !isMetisRemoved && (isMetisActive || metadata.metisActive === true);
  
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
