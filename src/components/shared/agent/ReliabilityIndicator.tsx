
import React from 'react';
import ScoreTooltip from '../ScoreTooltips';
import { MetaQube } from '@/lib/types';

interface ReliabilityIndicatorProps {
  isProcessing?: boolean;
  metaQube?: MetaQube;
}

const ReliabilityIndicator = ({ isProcessing = false, metaQube }: ReliabilityIndicatorProps) => {
  // Calculate reliability and trust from metaQube data if available, otherwise use defaults
  const reliability = metaQube 
    ? Math.round(((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"] + (10 - metaQube["Risk-Score"])) / 3) * 10) / 10
    : 4;
  
  const trust = metaQube 
    ? Math.round(((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2) * 10) / 10
    : 4;

  const getTrustColor = (score: number) => {
    return score >= 7 
      ? "bg-green-500/60" 
      : score >= 4 
        ? "bg-yellow-500/60" 
        : "bg-red-500/60";
  };

  const getReliabilityColor = (score: number) => {
    return score >= 7 
      ? "bg-iqube-primary/60" 
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
  const reliabilityDots = Math.ceil(reliability / 2);
  const trustDots = Math.ceil(trust / 2);

  return (
    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-md">
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Processing..." : "Reliability"}
        </div>
        <ScoreTooltip type="reliability" score={reliability}>
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
      <div className="h-8 w-[1px] bg-border mx-1"></div>
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">
          {isProcessing ? "Thinking..." : "Trust"}
        </div>
        <ScoreTooltip type="trust" score={trust}>
          <div className="flex items-center cursor-help">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < trustDots ? getTrustColor(trust) : 'bg-muted'} ${getAnimationClass(i + 5)}`}
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
