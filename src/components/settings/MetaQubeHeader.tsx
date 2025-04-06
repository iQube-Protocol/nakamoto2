
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import ScoreBadge from './ScoreBadge';

interface MetaQubeHeaderProps {
  metaQube: MetaQube;
}

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
        <ScoreBadge value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
        <ScoreBadge value={trustScore} label="Trust" type="trust" />
        <ScoreBadge value={metaQube["Risk-Score"]} label="Risk" type="risk" />
      </div>
    </div>
  );
};

export default MetaQubeHeader;
