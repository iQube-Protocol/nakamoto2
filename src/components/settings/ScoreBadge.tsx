
import React from 'react';

export interface ScoreBadgeProps {
  value: number;
  label: string;
  type: 'sensitivity' | 'trust' | 'risk' | 'accuracy' | 'verifiability';
}

const ScoreBadge = ({ value, label, type }: ScoreBadgeProps) => {
  // Helper function to get the appropriate color based on score and type
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      // Risk and Sensitivity: 1-4 green, 5-7 amber, 8-10 red
      return value <= 4 
        ? "bg-green-500/60" 
        : value <= 7 
          ? "bg-yellow-500/60" 
          : "bg-red-500/60";
    } else if (type === 'trust') {
      // Trust: 5-10 green, 3-4 amber, 1-2 red
      return value >= 5 
        ? "bg-green-500/60" 
        : value >= 3 
          ? "bg-yellow-500/60" 
          : "bg-red-500/60";
    } else {
      // Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
      return value <= 3 
        ? "bg-red-500/60" 
        : value <= 6 
          ? "bg-yellow-500/60" 
          : "bg-green-500/60";
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getScoreColor()}`}>
        {value}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

export default ScoreBadge;
