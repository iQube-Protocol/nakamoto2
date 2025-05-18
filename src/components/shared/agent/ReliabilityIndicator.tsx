
import React, { useState } from 'react';
import ScoreTooltip from '../ScoreTooltips';

interface ReliabilityIndicatorProps {
  isProcessing?: boolean;
}

const ReliabilityIndicator = ({ isProcessing = false }: ReliabilityIndicatorProps) => {
  // Using a fixed value or random value between 3-5 as per original component
  const [reliability] = useState(Math.floor(Math.random() * 3) + 3);
  const [trust] = useState(4); // Trust score set to 4 out of 5

  const getTrustColor = (score: number) => {
    return score >= 5 
      ? "bg-green-500/60" 
      : score >= 3 
        ? "bg-green-500/60" 
        : "bg-red-500/60";
  };

  // Function to get animation class based on processing state
  const getAnimationClass = (index: number) => {
    if (!isProcessing) return "";
    
    // Apply staggered animation based on dot index
    const animationDelay = `${index * 0.15}s`;
    return "animate-pulse transition-all duration-700";
  };

  return (
    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-md">
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Processing..." : "Reliability"}
        </div>
        <ScoreTooltip type="reliability" score={reliability * 2}>
          <div className="flex items-center cursor-help">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < reliability ? 'bg-iqube-primary/60' : 'bg-muted'} ${getAnimationClass(i)}`}
                style={{ 
                  animationDelay: isProcessing ? `${i * 0.15}s` : '0s',
                  transition: 'all 300ms ease-in-out'
                }}
              />
            ))}
          </div>
        </ScoreTooltip>
      </div>
      <div className="h-8 w-[1px] bg-border mx-1"></div>
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Thinking..." : "Trust"}
        </div>
        <ScoreTooltip type="trust" score={trust * 2}>
          <div className="flex items-center cursor-help">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < trust ? getTrustColor(trust) : 'bg-muted'} ${getAnimationClass(i + 5)}`}
                style={{ 
                  animationDelay: isProcessing ? `${(i + 5) * 0.15}s` : '0s',
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
