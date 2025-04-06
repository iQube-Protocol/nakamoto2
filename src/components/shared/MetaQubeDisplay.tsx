
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import { Lock, Unlock, ShieldCheck, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetaQubeDisplayProps {
  metaQube: MetaQube;
  compact?: boolean;
  className?: string;
}

interface ScoreBadgeProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'accuracy' | 'verifiability';
}

const ScoreBadge = ({ value, label, type }: ScoreBadgeProps) => {
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      // Risk and Sensitivity: 1-4 green, 5-7 amber, 8-10 red
      return value <= 4 
        ? "bg-green-500" 
        : value <= 7 
          ? "bg-yellow-500" 
          : "bg-red-500";
    } else {
      // Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-green-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium', getScoreColor())}>
        {value}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

const MetaQubeDisplay = ({ metaQube, compact = false, className }: MetaQubeDisplayProps) => {
  // Calculate Trust score as the average of Accuracy and Verifiability
  const trustScore = Math.round((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2);

  if (compact) {
    return (
      <Card className={cn("iqube-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <div className="h-4 w-4 mr-2 text-iqube-accent">
              {/* Cube icon replacement */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            MonDAI iQube
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
              {metaQube["iQube-Type"]}
            </Badge>
            <div className="flex gap-2">
              <ScoreBadge value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
              <ScoreBadge value={trustScore} label="Trust" type="accuracy" />
              <ScoreBadge value={metaQube["Risk-Score"]} label="Risk" type="risk" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("iqube-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="h-5 w-5 mr-2 text-iqube-accent">
            {/* Cube icon replacement */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          MonDAI iQube
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
            {metaQube["iQube-Type"]}
          </Badge>
          <Badge variant="outline" className="bg-iqube-accent/10 text-iqube-accent border-iqube-accent/30">
            {metaQube["Owner-Identifiability"]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4 pb-4 border-b">
          <ScoreBadge value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
          <ScoreBadge value={metaQube["Accuracy-Score"]} label="Accuracy" type="accuracy" />
          <ScoreBadge value={metaQube["Verifiability-Score"]} label="Verifiability" type="verifiability" />
          <ScoreBadge value={metaQube["Risk-Score"]} label="Risk" type="risk" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-muted-foreground">Owner Type</div>
            <div>{metaQube["Owner-Type"]}</div>
            
            <div className="text-muted-foreground">Date Minted</div>
            <div>{new Date(metaQube["Date-Minted"]).toLocaleDateString()}</div>
            
            <div className="text-muted-foreground">Edition</div>
            <div>{metaQube["X-of-Y"]}</div>
            
            <div className="text-muted-foreground">Related iQubes</div>
            <div className="flex flex-wrap gap-1">
              {metaQube["Related-iQubes"].map((qube, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {qube}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2">
          <div className="flex items-center border rounded-md px-2 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            <span>Protected</span>
          </div>
          <div className="flex items-center border rounded-md px-2 py-1 text-xs">
            <Database className="h-3.5 w-3.5 mr-1" />
            <span>DataQube</span>
          </div>
          {metaQube["Risk-Score"] <= 4 ? (
            <div className="flex items-center border rounded-md px-2 py-1 text-xs text-green-500 border-green-500/30">
              <Unlock className="h-3.5 w-3.5 mr-1" />
              <span>Low Risk</span>
            </div>
          ) : (
            <div className="flex items-center border rounded-md px-2 py-1 text-xs text-yellow-500 border-yellow-500/30">
              <Lock className="h-3.5 w-3.5 mr-1" />
              <span>Medium Risk</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaQubeDisplay;
