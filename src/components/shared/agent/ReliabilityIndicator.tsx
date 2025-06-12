
import React, { useEffect, useMemo } from 'react';
import ScoreTooltip from '../ScoreTooltips';
import { MetaQube } from '@/lib/types';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { agentQubeData } from '@/components/settings/AgentQubeData';

interface ReliabilityIndicatorProps {
  isProcessing?: boolean;
  metaQube?: MetaQube;
}

const ReliabilityIndicator = ({ isProcessing = false, metaQube }: ReliabilityIndicatorProps) => {
  const { veniceActivated } = useVeniceAgent();
  
  // Use useMemo to ensure calculations update when Venice state changes
  const { effectiveMetaQube, trust, reliability } = useMemo(() => {
    // Use the appropriate agent data based on Venice activation status
    const effective = metaQube || (veniceActivated ? agentQubeData.nakamotoWithVenice : agentQubeData.nakamotoBase);
    
    // Calculate trust and reliability from metaQube data
    const trustScore = Math.round(((effective["Accuracy-Score"] + effective["Verifiability-Score"]) / 2) * 10) / 10;
    const reliabilityScore = Math.round(((effective["Accuracy-Score"] + effective["Verifiability-Score"] + (10 - effective["Risk-Score"])) / 3) * 10) / 10;
    
    return {
      effectiveMetaQube: effective,
      trust: trustScore,
      reliability: reliabilityScore
    };
  }, [veniceActivated, metaQube]);

  // Debug logging to track state changes
  useEffect(() => {
    console.log('ReliabilityIndicator: Venice activated:', veniceActivated);
    console.log('ReliabilityIndicator: Trust score:', trust);
    console.log('ReliabilityIndicator: Reliability score:', reliability);
    console.log('ReliabilityIndicator: Using agent data:', veniceActivated ? 'nakamotoWithVenice' : 'nakamotoBase');
  }, [veniceActivated, trust, reliability]);

  const getTrustColor = (score: number) => {
    return score >= 7 
      ? "bg-green-500/60" 
      : score >= 4 
        ? "bg-yellow-500/60" 
        : "bg-red-500/60";
  };

  const getReliabilityColor = (score: number) => {
    return score >= 7 
      ? "bg-purple-500/60" 
      : score >= 4 
        ? "bg-yellow-500/60" 
        : "bg-red-500/60";
  };

  // Function to get animation class based on processing state
  const getAnimationClass = (index: number) => {
    if (!isProcessing) return "";
    
    // Apply staggered animation based on dot index
    return "animate-pulse transition-all duration-700";
  };

  // Convert 1-10 scores to 1-5 dots
  const trustDots = Math.ceil(trust / 2);
  const reliabilityDots = Math.ceil(reliability / 2);

  return (
    <div 
      className="flex items-center gap-6 bg-muted/30 p-2 rounded-md"
      key={`reliability-${veniceActivated ? 'venice' : 'base'}-${trust}-${reliability}`}
    >
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Thinking..." : "Reliability"}
        </div>
        <ScoreTooltip type="trust" score={reliability}>
          <div className="flex items-center cursor-help">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < reliabilityDots ? getReliabilityColor(reliability) : 'bg-muted'} ${getAnimationClass(i)}`}
                style={{ 
                  animationDelay: isProcessing ? `${i * 0.15}s` : '0s',
                  transition: 'all 300ms ease-in-out'
                }}
              />
            ))}
          </div>
        </ScoreTooltip>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Thinking..." : "Trust"}
        </div>
        <ScoreTooltip type="trust" score={trust}>
          <div className="flex items-center cursor-help">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < trustDots ? getTrustColor(trust) : 'bg-muted'} ${getAnimationClass(i)}`}
                style={{ 
                  animationDelay: isProcessing ? `${i * 0.15}s` : '0s',
                  transition: 'all 300ms ease-in-out'
                }}
              />
            ))}
          </div>
        </ScoreTooltip>
      </div>
    </div>
  );
};

export default ReliabilityIndicator;
