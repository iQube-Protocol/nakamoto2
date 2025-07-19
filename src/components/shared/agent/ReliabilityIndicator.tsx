
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReliabilityIndicatorProps {
  score?: number;
  level?: 'high' | 'medium' | 'low';
  showTooltip?: boolean;
}

const ReliabilityIndicator = React.memo(({ 
  score, 
  level, 
  showTooltip = true 
}: ReliabilityIndicatorProps) => {
  // Memoize the reliability calculation
  const reliability = React.useMemo(() => {
    if (level) return level;
    if (typeof score === 'number') {
      if (score >= 0.8) return 'high';
      if (score >= 0.6) return 'medium';
      return 'low';
    }
    return 'medium';
  }, [score, level]);

  // Memoize the display values
  const { color, text, description } = React.useMemo(() => {
    switch (reliability) {
      case 'high':
        return {
          color: 'bg-green-500',
          text: 'High Reliability',
          description: 'This response is based on verified information and has high confidence.'
        };
      case 'medium':
        return {
          color: 'bg-yellow-500',
          text: 'Medium Reliability',
          description: 'This response has moderate confidence. Consider verifying important details.'
        };
      case 'low':
        return {
          color: 'bg-red-500',
          text: 'Low Reliability',
          description: 'This response has low confidence. Please verify the information independently.'
        };
    }
  }, [reliability]);

  const indicator = (
    <Badge variant="outline" className="text-xs">
      <div className={`w-2 h-2 rounded-full ${color} mr-1`} />
      {text}
    </Badge>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ReliabilityIndicator.displayName = 'ReliabilityIndicator';

export default ReliabilityIndicator;
