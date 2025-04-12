import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MetaQubeHeaderProps {
  metaQube: MetaQube;
}

interface DotScoreProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'trust';
}

const DotScore = ({ value, label, type }: DotScoreProps) => {
  // Convert score to number of dots (divide by 2 and round up)
  const dotCount = Math.ceil(value / 2);
  const maxDots = 5; // Max possible dots (10/2 = 5)
  
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      // Risk and Sensitivity: 1-4 green, 5-7 amber, 8-10 red
      return value <= 4 
        ? "bg-green-500" 
        : value <= 7 
          ? "bg-yellow-500" 
          : "bg-red-500";
    } else {
      // Trust: 5-10 green, 3-4 amber, 1-2 red
      return value >= 5 
        ? "bg-green-500" 
        : value >= 3 
          ? "bg-yellow-500" 
          : "bg-red-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-0.5 mb-1">
        {[...Array(maxDots)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              i < dotCount ? getScoreColor() : "bg-gray-300"
            )}
          />
        ))}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

const MetaQubeHeader = ({ metaQube }: MetaQubeHeaderProps) => {
  // Calculate Trust score as the average of Accuracy and Verifiability
  const trustScore = Math.round((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2);
  
  return (
    <div className="p-2 bg-muted/30 border rounded-md flex items-center gap-4 overflow-x-auto">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 text-iqube-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <span className="text-sm font-medium">{metaQube["iQube-Identifier"]}</span>
        <Badge variant="outline" className="bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
          {metaQube["iQube-Type"]}
        </Badge>
      </div>
      <div className="flex-1 flex items-center justify-end gap-3">
        <DotScore value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
        <DotScore value={trustScore} label="Trust" type="trust" />
        <DotScore value={metaQube["Risk-Score"]} label="Risk" type="risk" />
      </div>
    </div>
  );
};

export default MetaQubeHeader;
