
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Database, Brain } from 'lucide-react';
import ScoreTooltip from '@/components/shared/ScoreTooltips';

interface MetaQubeHeaderProps {
  metaQube: MetaQube;
  isActive: boolean;
  onToggleActive: () => void;
}

interface DotScoreProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'trust' | 'accuracy' | 'verifiability' | 'reliability';
}

const DotScore = ({ value, label, type }: DotScoreProps) => {
  const dotCount = Math.ceil(value / 2);
  const maxDots = 5;
  
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      return value <= 4 
        ? "bg-green-500" 
        : value <= 7 
          ? "bg-yellow-500" 
          : "bg-red-500";
    } else if (type === 'accuracy' || type === 'verifiability' || type === 'trust' || type === 'reliability') {
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
                "w-1.5 h-1.5 rounded-full",
                i < dotCount ? getScoreColor() : "bg-gray-400"
              )}
            />
          ))}
        </div>
      </ScoreTooltip>
    </div>
  );
};

const MetaQubeHeader = ({ metaQube, isActive, onToggleActive }: MetaQubeHeaderProps) => {
  // Calculate Trust Score as average of Accuracy and Verifiability
  const trustScore = Math.round(((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2) * 10) / 10;
  
  // Calculate Reliability Index as (Accuracy + Verifiability + (10 - Risk)) / 3
  const reliabilityIndex = Math.round(((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"] + (10 - metaQube["Risk-Score"])) / 3) * 10) / 10;
  
  // Determine the correct tooltip type based on the iQube identifier
  const getTooltipType = (): 'dataQube' | 'agentQube' => {
    if (metaQube["iQube-Identifier"] === "Metis iQube") {
      return "agentQube";
    } else {
      return "dataQube";
    }
  };
  
  return (
    <div className="p-2 bg-muted/30 border rounded-md overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScoreTooltip type="dataQube">
            <div className="h-5 w-5 text-green-500 cursor-help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </ScoreTooltip>
          <span className="text-sm font-medium">{metaQube["iQube-Identifier"]}</span>
        </div>
        <ScoreTooltip type={getTooltipType()}>
          <div className="cursor-help">
            <Badge variant="outline" className="flex items-center gap-1 bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
              {metaQube["iQube-Type"] === 'AgentQube' ? (
                <Brain size={14} />
              ) : (
                <Database size={14} />
              )}
              <span>{metaQube["iQube-Type"]}</span>
            </Badge>
          </div>
        </ScoreTooltip>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          <DotScore value={trustScore} label="Trust" type="trust" />
          <DotScore value={reliabilityIndex} label="Reliability" type="reliability" />
          <DotScore value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
          <DotScore value={metaQube["Risk-Score"]} label="Risk" type="risk" />
          <DotScore value={metaQube["Accuracy-Score"]} label="Accuracy" type="accuracy" />
          <DotScore value={metaQube["Verifiability-Score"]} label="Verifiability" type="verifiability" />
        </div>
        <div className="flex flex-col items-center ml-2">
          <span className="text-xs text-muted-foreground mb-1">{isActive ? 'Active' : 'Inactive'}</span>
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggleActive} 
            size="sm"
            className="data-[state=checked]:bg-iqube-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default MetaQubeHeader;
