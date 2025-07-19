
import React, { useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import DotScore from './DotScore';
import ScoreTooltip from '../ScoreTooltips';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVeniceAgent } from '@/hooks/use-venice-agent';

interface AgentHeaderProps {
  title: string;
  description: string;
  isProcessing: boolean;
}

const AgentHeader = ({ title, description, isProcessing }: AgentHeaderProps) => {
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
  
  // Calculate Trust and Reliability scores
  const calculateScores = () => {
    const baseAccuracy = 8.0;
    const baseVerifiability = 7.5;
    const baseRisk = 2.5;
    
    const trustScore = (baseAccuracy + baseVerifiability) / 2;
    const reliabilityScore = (baseAccuracy + baseVerifiability + (10 - baseRisk)) / 3;
    
    return { trustScore, reliabilityScore };
  };
  
  const { trustScore, reliabilityScore } = calculateScores();
  
  return (
    <div className="p-4 border-b flex justify-between items-start">
      <div>
        <ScoreTooltip type="agentQube">
          <h2 className="text-xl font-semibold flex items-center cursor-help">
            <Bot className="mr-2 h-5 w-5 text-qrypto-accent" />
            {displayTitle}
            {isProcessing && (
              <span className="ml-2 flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </span>
            )}
          </h2>
        </ScoreTooltip>
      </div>
      <div className="flex items-center gap-4">
        <DotScore 
          value={reliabilityScore}
          label="Reliability"
          key={`reliability-${veniceActivated}`}
        />
        <DotScore 
          value={trustScore}
          label="Trust"
          key={`trust-${veniceActivated}`}
        />
      </div>
    </div>
  );
};

export default AgentHeader;
