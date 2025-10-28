
import React, { useEffect, useMemo } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import DotScore from '@/components/shared/DotScore';
import ScoreTooltip from '@/components/shared/ScoreTooltips';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useChainGPTAgent } from '@/hooks/use-chaingpt-agent';

interface AgentHeaderProps {
  title: string;
  titleClassName?: string;
  description: string;
  isProcessing: boolean;
  additionalActions?: React.ReactNode;
}

const AgentHeader = ({ title, titleClassName, description, isProcessing, additionalActions }: AgentHeaderProps) => {
  const isMobile = useIsMobile();
  const { veniceActivated } = useVeniceAgent();
  const { chainGPTActivated } = useChainGPTAgent();
  
  // Debug logging to track agent state changes and re-renders
  useEffect(() => {
    console.log('AgentHeader: Agent states changed - Venice:', veniceActivated, 'ChainGPT:', chainGPTActivated);
  }, [veniceActivated, chainGPTActivated]);
  
  useEffect(() => {
    console.log('AgentHeader: Component re-rendered with states - Venice:', veniceActivated, 'ChainGPT:', chainGPTActivated);
  });
  
  // Use shortened name on mobile for Aigent Nakamoto
  const displayTitle = isMobile && title === "Aigent Nakamoto" ? "Nakamoto" : title;
  
  // Calculate Trust and Reliability scores based on activated agents and processing state
  const { trustScore, reliabilityScore } = useMemo(() => {
    let baseScore = 5.0; // Default OpenAI score
    
    // Both Venice and ChainGPT get high scores but slightly different
    if (chainGPTActivated) {
      baseScore = 8.0; // ChainGPT gets 8.0 base score
    } else if (veniceActivated) {
      baseScore = 7.8; // Venice gets 7.8 base score (slightly lower than ChainGPT)
    }
    
    const processingPenalty = isProcessing ? 0.3 : 0;
    
    const trust = Math.min(10, Math.max(1, baseScore - processingPenalty));
    const reliability = Math.min(10, Math.max(1, baseScore + (chainGPTActivated || veniceActivated ? 0.8 : 0) - processingPenalty));
    
    return {
      trustScore: Math.round(trust * 10) / 10,
      reliabilityScore: Math.round(reliability * 10) / 10
    };
  }, [veniceActivated, chainGPTActivated, isProcessing]);
  
  return (
    <div className="p-4 border-b flex justify-between items-start">
      <div>
        <ScoreTooltip type="agentQube">
          <h2 className={`text-xl font-semibold flex items-center cursor-help ${titleClassName || ''}`}>
            {title === "Aigent Nakamoto" ? (
              <>
                <Bot className="mr-2 h-5 w-5 text-qrypto-accent" />
                <div className="relative mr-3 ml-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" 
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                       }}>
                    <img 
                      src="/lovable-uploads/3bd3832a-1311-4e4a-8749-8b7b2fc1f1a8.png" 
                      alt="Aigent Nakamoto"
                      className="w-full h-full object-cover"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      }}
                    />
                  </div>
                </div>
                <span className="hidden sm:inline">{displayTitle}</span>
              </>
            ) : (
              <>
                <Bot className="mr-2 h-5 w-5 text-qrypto-accent" />
                {displayTitle}
              </>
            )}
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
