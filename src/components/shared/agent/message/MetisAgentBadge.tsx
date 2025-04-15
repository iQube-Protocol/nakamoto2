
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Brain } from 'lucide-react';

interface MetisAgentBadgeProps {
  isActive: boolean;
}

const MetisAgentBadge = ({ isActive }: MetisAgentBadgeProps) => {
  if (!isActive) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="text-[10px] ml-1 py-0 h-4 flex items-center bg-violet-100 text-violet-800 border-violet-300">
            <Brain className="h-3 w-3 mr-1" />
            Metis
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-xs font-medium">Metis Agent</p>
            <p className="text-xs">Enhanced AI capability for crypto risk analysis</p>
            <p className="text-xs text-muted-foreground">Specialized in blockchain security and token risk assessment</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetisAgentBadge;
