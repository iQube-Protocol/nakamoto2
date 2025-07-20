
import React from 'react';
import { cn } from '@/lib/utils';
import ScoreTooltip from '@/components/shared/ScoreTooltips';

interface DotScoreProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'trust' | 'accuracy' | 'verifiability' | 'reliability';
  isProcessing?: boolean;
}

const DotScore = ({ value, label, type, isProcessing = false }: DotScoreProps) => {
  const dotCount = Math.ceil(value / 2);
  const maxDots = 5;
  
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      return value <= 4 
        ? "bg-green-500" 
        : value <= 7 
          ? "bg-yellow-500" 
          : "bg-red-500";
    } else if (type === 'reliability') {
      // Special purple color scheme for reliability
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-purple-500"; // Purple for high reliability scores
    } else if (type === 'accuracy' || type === 'verifiability' || type === 'trust') {
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-green-500";
    } else {
      return value >= 5 
        ? "bg-green-500" 
        : value >= 3 
          ? "bg-yellow-500" 
          : "bg-red-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <ScoreTooltip type={type} score={value}>
        <div className="flex space-x-0.5 cursor-help">
          {[...Array(maxDots)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i < dotCount ? getScoreColor() : "bg-gray-400",
                isProcessing && i < dotCount && "animate-pulse"
              )}
            />
          ))}
        </div>
      </ScoreTooltip>
    </div>
  );
};

export default React.memo(DotScore);
