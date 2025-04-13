
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface MetadataBadgeProps {
  metadata: {
    version?: string;
    modelUsed?: string;
    contextRetained?: boolean;
    [key: string]: any;
  } | null;
}

const MetadataBadge = ({ metadata }: MetadataBadgeProps) => {
  if (!metadata) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
              <span className="text-muted-foreground">MCP v{metadata.version}</span>
            </Badge>
            {metadata.modelUsed && (
              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                {metadata.modelUsed}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Using Model Context Protocol</p>
          {metadata.contextRetained && 
            <p className="text-xs text-muted-foreground">Context maintained between messages</p>
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetadataBadge;
