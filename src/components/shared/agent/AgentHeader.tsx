
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ReliabilityIndicator from './ReliabilityIndicator';

interface AgentHeaderProps {
  title: string;
  description: string;
  isProcessing: boolean;
}

const AgentHeader = ({ title, description, isProcessing }: AgentHeaderProps) => {
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
      <ReliabilityIndicator isProcessing={isProcessing} />
    </div>
  );
};

export default AgentHeader;
