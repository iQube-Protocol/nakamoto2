
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
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
            <span className="text-muted-foreground">MCP v{metadata.version || '1.0'}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Using Model Context Protocol</p>
          {metadata.contextRetained && 
            <p className="text-xs text-muted-foreground">Context maintained between messages</p>
          }
        </TooltipContent>
      </Tooltip>
      
      {metadata.modelUsed && (
        <ModelSelector
          currentModel={metadata.modelUsed}
          iqubeType={iqubeType}
          onModelChange={onModelChange}
        />
      )}
      
      <MetisAgentBadge isActive={isMetisActive} />
    </div>
  );
};

export default MetadataBadge;

