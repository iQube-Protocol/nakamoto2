
import React, { useEffect, useState } from 'react';
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
  const [isMetisActive, setIsMetisActive] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize from props or localStorage
    if (metadata?.metisActive !== undefined) {
      setIsMetisActive(metadata.metisActive);
    } else {
      const storedMetisActive = localStorage.getItem('metisActive') === 'true';
      setIsMetisActive(storedMetisActive);
    }
    
    // Add event listeners for activation/deactivation
    const handleMetisActivated = () => {
      console.log('MetadataBadge: Metis agent activation detected');
      setIsMetisActive(true);
    };
    
    const handleMetisDeactivated = () => {
      console.log('MetadataBadge: Metis agent deactivation detected');
      setIsMetisActive(false);
    };
    
    window.addEventListener('metisActivated', handleMetisActivated);
    window.addEventListener('metisDeactivated', handleMetisDeactivated);
    
    return () => {
      window.removeEventListener('metisActivated', handleMetisActivated);
      window.removeEventListener('metisDeactivated', handleMetisDeactivated);
    };
  }, [metadata]);
  
  if (!metadata) return null;
  
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
            <MetisAgentBadge isActive={isMetisActive} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Using Model Context Protocol</p>
          {metadata.contextRetained && 
            <p className="text-xs text-muted-foreground">Context maintained between messages</p>
          }
          {isMetisActive &&
            <p className="text-xs text-violet-500 font-medium">Metis Agent active</p>
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetadataBadge;
