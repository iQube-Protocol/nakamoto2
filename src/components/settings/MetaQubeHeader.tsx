
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Database, ShieldCheck, CheckCircle } from 'lucide-react';

interface MetaQubeHeaderProps {
  metaQube: MetaQube;
}

interface DotScoreProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'trust' | 'accuracy' | 'verifiability';
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
      // Trust, Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-green-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex space-x-0.5">
        {[...Array(maxDots)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              i < dotCount ? getScoreColor() : "bg-gray-400"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const MetaQubeHeader = ({ metaQube }: MetaQubeHeaderProps) => {
  const [isActive, setIsActive] = React.useState(true);
  // Calculate Trust score as the average of Accuracy and Verifiability
  const trustScore = Math.round((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2);
  
  return (
    <div className="p-2 bg-muted/30 border rounded-md overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 text-green-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="text-sm font-medium">{metaQube["iQube-Identifier"]}</span>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
          <Database size={14} />
        </Badge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <DotScore value={trustScore} label="Trust" type="trust" />
          <DotScore value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
          <DotScore value={metaQube["Risk-Score"]} label="Risk" type="risk" />
        </div>

        {/* Adding Accuracy and Verifiability scores */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            <DotScore value={metaQube["Accuracy-Score"]} label="Accuracy" type="accuracy" />
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-blue-500" />
            <DotScore value={metaQube["Verifiability-Score"]} label="Verifiability" type="verifiability" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-1">{isActive ? 'Active' : 'Inactive'}</span>
          <Switch 
            checked={isActive} 
            onCheckedChange={setIsActive} 
            size="sm"
            className="data-[state=checked]:bg-iqube-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default MetaQubeHeader;
