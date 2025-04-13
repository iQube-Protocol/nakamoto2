
import React, { useState } from 'react';

const ReliabilityIndicator = () => {
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

  return (
    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-md">
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">Reliability</div>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < reliability ? 'bg-iqube-primary/60' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>
      <div className="h-8 w-[1px] bg-border mx-1"></div>
      <div className="flex flex-col items-center">
        <div className="text-xs text-muted-foreground mb-1">Trust</div>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < trust ? getTrustColor(trust) : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReliabilityIndicator;
