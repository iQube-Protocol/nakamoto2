
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import ScoreTooltip from '../../ScoreTooltips';
import { Cpu, Brain } from 'lucide-react';
import MetisAgentBadge from './MetisAgentBadge';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

interface MetadataBadgeProps {
  metadata: {
    version?: string;
    modelUsed?: string;
    contextRetained?: boolean;
    metisActive?: boolean;
    iqubeType?: 'DataQube' | 'AgentQube';
    [key: string]: any;
  } | null;
}

const MetadataBadge = ({ metadata }: MetadataBadgeProps) => {
  if (!metadata) return null;
  
  const { veniceActivated } = useVeniceAgent();
  const isMetisActive = metadata.metisActive === true;
  const iqubeType = metadata.iqubeType || 'DataQube';
  
  // Determine the AI provider and model display
  const getProviderAndModel = () => {
    if (!metadata.modelUsed) return null;
    
    if (veniceActivated) {
      return `Venice • ${metadata.modelUsed}`;
    } else {
      return `OpenAI • ${metadata.modelUsed}`;
    }
  };
  
  const displayText = getProviderAndModel();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
              <span className="text-muted-foreground">MCP v{metadata.version || '1.0'}</span>
            </Badge>
            {displayText && (
              <ScoreTooltip type={iqubeType === 'AgentQube' ? 'agentQube' : 'dataQube'}>
                <Badge variant="secondary" className="text-[10px] py-0 h-4 flex items-center">
                  {iqubeType === 'AgentQube' ? (
                    <Brain className="h-3 w-3 mr-1" />
                  ) : (
                    <Cpu className="h-3 w-3 mr-1" />
                  )}
                  {displayText}
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

