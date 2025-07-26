
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
import ModelSelector from './ModelSelector';

interface MetadataBadgeProps {
  metadata: {
    version?: string;
    modelUsed?: string;
    contextRetained?: boolean;
    metisActive?: boolean;
    iqubeType?: 'DataQube' | 'AgentQube';
    [key: string]: any;
  } | null;
  onModelChange?: (model: string, provider: 'openai' | 'venice') => void;
}

const MetadataBadge = ({ metadata, onModelChange }: MetadataBadgeProps) => {
  if (!metadata) return null;
  
  const isMetisActive = metadata.metisActive === true;
  const iqubeType = metadata.iqubeType || 'DataQube';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
              <span className="text-muted-foreground">MCP v{metadata.version || '1.0'}</span>
            </Badge>
            {metadata.modelUsed && (
              <ScoreTooltip type={iqubeType === 'AgentQube' ? 'agentQube' : 'dataQube'}>
                <ModelSelector
                  currentModel={metadata.modelUsed}
                  iqubeType={iqubeType}
                  onModelChange={onModelChange}
                />
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

