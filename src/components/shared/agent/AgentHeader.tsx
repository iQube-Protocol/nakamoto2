
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

interface AgentHeaderProps {
  title: string;
  description: string;
  isProcessing: boolean;
  reliability: number;
  trust: number;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({
  title,
  description,
  isProcessing,
  reliability,
  trust,
}) => {
  return (
    <div className="p-4 border-b flex justify-between items-start">
      <div>
        <h2 className="text-xl font-semibold flex items-center">
          <Bot className="mr-2 h-5 w-5 text-iqube-accent" />
          {title}
          {isProcessing && (
            <span className="ml-2 flex items-center text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing...
            </span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
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
    </div>
  );
};

// Helper function to get trust color
const getTrustColor = (score: number) => {
  return score >= 5 
    ? "bg-green-500/60" 
    : score >= 3 
      ? "bg-green-500/60" 
      : "bg-red-500/60";
};

export default AgentHeader;
