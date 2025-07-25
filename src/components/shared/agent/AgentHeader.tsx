
import React, { useEffect, useMemo } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import DotScore from '@/components/shared/DotScore';
import ScoreTooltip from '@/components/shared/ScoreTooltips';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

interface AgentHeaderProps {
  title: string;
  description: string;
  isProcessing: boolean;
  additionalActions?: React.ReactNode;
}

const AgentHeader = ({ title, description, isProcessing, additionalActions }: AgentHeaderProps) => {
  const isMobile = useIsMobile();
  const { veniceActivated } = useVeniceAgent();
  
  // Debug logging to track Venice state changes and re-renders
  useEffect(() => {
    console.log('AgentHeader: Venice state changed, activated:', veniceActivated);
  }, [veniceActivated]);
  
  useEffect(() => {
    console.log('AgentHeader: Component re-rendered with Venice state:', veniceActivated);
  });
  
  // Use shortened name on mobile for Aigent Nakamoto
  const displayTitle = isMobile && title === "Aigent Nakamoto" ? "Nakamoto" : title;
  
  // Calculate Trust and Reliability scores based on Venice activation and processing state
  const { trustScore, reliabilityScore } = useMemo(() => {
    const baseScore = veniceActivated ? 7.5 : 5.0;
    const processingPenalty = isProcessing ? 0.5 : 0;
    
    const trust = Math.min(10, Math.max(1, baseScore - processingPenalty));
    const reliability = Math.min(10, Math.max(1, baseScore + (veniceActivated ? 1.0 : 0) - processingPenalty));
    
    return {
      trustScore: Math.round(trust * 10) / 10,
      reliabilityScore: Math.round(reliability * 10) / 10
    };
  }, [veniceActivated, isProcessing]);
  
  return (
    <div className="p-4 border-b flex justify-between items-start">
      <div>
        <ScoreTooltip type="agentQube">
          <h2 className="text-xl font-semibold flex items-center cursor-help">
            <Bot className="mr-2 h-5 w-5 text-qrypto-accent" />
            {displayTitle}
          </h2>
        </ScoreTooltip>
      </div>
      <div className="flex items-center gap-4">
        {additionalActions && (
          <div className="mr-4">
            {additionalActions}
          </div>
        )}
        <div className="flex items-center gap-4 bg-muted/20 rounded-lg px-3 py-2">
          <DotScore 
            value={reliabilityScore} 
            label="Reliability" 
            type="reliability"
            isProcessing={isProcessing}
          />
          <DotScore 
            value={trustScore} 
            label="Trust" 
            type="trust"
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentHeader;
