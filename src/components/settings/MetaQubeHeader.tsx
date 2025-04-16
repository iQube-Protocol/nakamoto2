
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MetaQube } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Database, Brain } from 'lucide-react';
import ScoreTooltip from '@/components/shared/ScoreTooltips';

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
    } else if (type === 'accuracy' || type === 'verifiability') {
      // Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-green-500";
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
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <ScoreTooltip type={type} score={value}>
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
      </ScoreTooltip>
    </div>
  );
};

const MetaQubeHeader = ({ metaQube }: MetaQubeHeaderProps) => {
  const [isActive, setIsActive] = React.useState(true);
  // Calculate Trust score as the average of Accuracy and Verifiability
  const trustScore = Math.round((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2);
  
  // Determine if this is an AgentQube
  const isAgentQube = metaQube["iQube-Type"] === "AgentQube";

  // Handle switch change for agent activation
  const handleSwitchChange = (checked: boolean) => {
    setIsActive(checked);
    
    if (isAgentQube && metaQube["iQube-Identifier"] === "Metis iQube") {
      // Store Metis active state in localStorage
      localStorage.setItem('metisActive', checked.toString());
      
      // Dispatch event to notify other components
      const event = new CustomEvent('metisToggled', { 
        detail: { active: checked }
      });
      window.dispatchEvent(event);
    }
  };
  
  // Initialize active state based on localStorage for Metis
  React.useEffect(() => {
    if (isAgentQube && metaQube["iQube-Identifier"] === "Metis iQube") {
      const storedState = localStorage.getItem('metisActive');
      if (storedState !== null) {
        setIsActive(storedState === 'true');
      }
    }
  }, [isAgentQube, metaQube]);
  
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
        <ScoreTooltip type={isAgentQube ? "agentQube" : "dataQube"}>
          <Badge variant="outline" className={`flex items-center gap-1 bg-${isAgentQube ? "purple" : "iqube-primary"}/10 text-${isAgentQube ? "purple" : "iqube-primary"}-500 border-${isAgentQube ? "purple" : "iqube-primary"}/30`}>
            {isAgentQube ? <Brain size={14} /> : <Database size={14} />}
          </Badge>
        </ScoreTooltip>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          <DotScore value={trustScore} label="Trust" type="trust" />
          <DotScore value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
          <DotScore value={metaQube["Risk-Score"]} label="Risk" type="risk" />
          <DotScore value={metaQube["Accuracy-Score"]} label="Accuracy" type="accuracy" />
          <DotScore value={metaQube["Verifiability-Score"]} label="Verifiability" type="verifiability" />
        </div>
        <div className="flex flex-col items-center ml-2">
          <span className="text-xs text-muted-foreground mb-1">{isActive ? 'Active' : 'Inactive'}</span>
          <Switch 
            checked={isActive} 
            onCheckedChange={handleSwitchChange} 
            size="sm"
            className={isAgentQube ? "data-[state=checked]:bg-purple-500" : "data-[state=checked]:bg-iqube-primary"}
          />
        </div>
      </div>
    </div>
  );
};

export default MetaQubeHeader;
