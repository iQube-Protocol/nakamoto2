
import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AgentRecommendationProps {
  agentName: string;
  description: string;
  fee: number;
  onActivate: () => void;
  onDismiss: () => void;
}

const AgentRecommendation = ({
  agentName,
  description,
  fee,
  onActivate,
  onDismiss
}: AgentRecommendationProps) => {
  // Calculate USD equivalent (1 cent = 10 satoshi)
  const usdEquivalent = (fee / 10 / 100).toFixed(2);
  
  // Determine if it's a monthly or one-time fee
  const isMonthly = fee >= 500; // Venice (800) and Metis (500) are monthly, Qrypto Profile (200) is one-time
  const feeText = isMonthly ? "Monthly fee" : "One-time cost";

  return (
    <Card className="p-4 border-iqube-primary/30 bg-iqube-primary/5 min-w-[280px] max-w-[320px] flex-shrink-0">
      <div className="flex items-start space-x-3">
        <div className="bg-iqube-accent/20 p-2 rounded-full">
          <Cpu className="h-5 w-5 text-iqube-accent" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h4 className="text-sm font-semibold truncate">Advanced Agent: {agentName}</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="ml-2 bg-amber-500/20 px-1.5 py-0.5 rounded-full flex items-center flex-shrink-0">
                    <span className="text-[9px] font-medium text-amber-600">TOKEN-GATED</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">This agent requires token payment to activate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <Wallet className="h-3 w-3 mr-1" />
            <span>{feeText}: {fee} Satoshi (≈ ${usdEquivalent})</span>
          </div>
          
          <div className="mt-3 flex space-x-2">
            <Button 
              size="sm" 
              onClick={onActivate}
              className="bg-iqube-primary hover:bg-iqube-primary/90 flex-1 text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Activate
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onDismiss}
              className="flex-shrink-0 text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AgentRecommendation;
