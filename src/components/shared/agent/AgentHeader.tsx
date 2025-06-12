
import React, { useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ReliabilityIndicator from './ReliabilityIndicator';
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
  
  console.log('AgentHeader: Rendering with Venice state:', veniceActivated, 'for title:', title);
  
  // Use shortened name on mobile for Aigent Nakamoto
  const displayTitle = isMobile && title === "Aigent Nakamoto" ? "Nakamoto" : title;
  
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
      <ReliabilityIndicator 
        isProcessing={isProcessing} 
        key={`reliability-${veniceActivated ? 'venice' : 'base'}`}
      />
    </div>
  );
};

export default AgentHeader;
