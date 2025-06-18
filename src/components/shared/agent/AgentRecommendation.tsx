
import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Wallet, Brain, Bot, Database, Gift } from 'lucide-react';
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
  const isFree = fee === 0; // KNYT Persona is free with reward
  const feeText = isFree ? "Free activation" : isMonthly ? "Monthly fee" : "One-time cost";

  // Get the appropriate icon and title based on agent name
  const getAgentIcon = () => {
    switch (agentName) {
      case 'Venice':
        return <Brain className="h-5 w-5 text-green-500" />;
      case 'Metis':
        return <Bot className="h-5 w-5 text-purple-500" />;
      case 'Qrypto Persona':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'KNYT Persona':
        return <Database className="h-4 w-4 text-purple-500" />;
      default:
        return <Cpu className="h-5 w-5 text-iqube-accent" />;
    }
  };

  const getAgentTitle = () => {
    switch (agentName) {
      case 'Venice':
        return 'Venice ModelQube';
      case 'Metis':
        return 'Metis AgentQube';
      case 'Qrypto Persona':
        return 'Qrypto Persona DataQube';
      case 'KNYT Persona':
        return 'KNYT Persona DataQube';
      default:
        return `Advanced Agent: ${agentName}`;
    }
  };

  return (
    <Card className="p-4 border-iqube-primary/30 bg-iqube-primary/5 min-w-[280px] max-w-[320px] flex-shrink-0">
      <div className="flex items-start space-x-3">
        <div className="bg-iqube-accent/20 p-2 rounded-full">
          {getAgentIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h4 className="text-sm font-semibold truncate">{getAgentTitle()}</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`ml-2 px-1.5 py-0.5 rounded-full flex items-center flex-shrink-0 ${
                    isFree ? 'bg-green-500/20' : 'bg-amber-500/20'
                  }`}>
                    <span className={`text-[9px] font-medium ${
                      isFree ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {isFree ? 'FREE + REWARD' : 'TOKEN-GATED'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isFree 
                      ? 'This agent is free to activate and includes a reward' 
                      : 'This agent requires token payment to activate'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            {isFree ? (
              <>
                <Gift className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">Free + 2,800 Satoshi reward!</span>
              </>
            ) : (
              <>
                <Wallet className="h-3 w-3 mr-1" />
                <span>{feeText}: {fee} Satoshi (≈ ${usdEquivalent})</span>
              </>
            )}
          </div>
          
          <div className="mt-3 flex space-x-2">
            <Button 
              size="sm" 
              onClick={onActivate}
              className={`flex-1 text-xs ${
                isFree 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-iqube-primary hover:bg-iqube-primary/90'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isFree ? 'Activate Free' : 'Activate'}
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
