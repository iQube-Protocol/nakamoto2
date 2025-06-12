
import React from 'react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreTooltipProps {
  type: 'risk' | 'sensitivity' | 'trust' | 'accuracy' | 'verifiability' | 'dataQube' | 'agentQube' | 'voice' | 'attachment' | 'reliability';
  score?: number;
  children: React.ReactNode;
}

const ScoreTooltip = ({ type, score, children }: ScoreTooltipProps) => {
  const getTooltipContent = () => {
    switch (type) {
      case 'risk':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Risk Score: {score}/10</div>
            <div className="text-xs">
              Measures potential security and privacy risks. Lower scores indicate safer iQubes.
            </div>
          </div>
        );
      case 'sensitivity':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Sensitivity Score: {score}/10</div>
            <div className="text-xs">
              Indicates how sensitive the data is. Higher scores mean more sensitive information.
            </div>
          </div>
        );
      case 'trust':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Trust Score: {score}/10</div>
            <div className="text-xs">
              Combination of accuracy and verifiability. Higher scores indicate more trustworthy data.
            </div>
          </div>
        );
      case 'accuracy':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Accuracy Score: {score}/10</div>
            <div className="text-xs">
              Measures how accurate and reliable the data is. Higher scores indicate more accurate information.
            </div>
          </div>
        );
      case 'verifiability':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Verifiability Score: {score}/10</div>
            <div className="text-xs">
              Indicates how easily the data can be verified. Higher scores mean more verifiable information.
            </div>
          </div>
        );
      case 'dataQube':
        return (
          <div className="space-y-1">
            <div className="font-semibold">DataQube</div>
            <div className="text-xs">
              Contains personal or organizational data that can be used for context and personalization. Includes profile information, preferences, and historical data.
            </div>
          </div>
        );
      case 'agentQube':
        return (
          <div className="space-y-1">
            <div className="font-semibold">AgentQube</div>
            <div className="text-xs">
              Contains AI agents or algorithms that can perform specific tasks, analysis, or provide specialized functionality. Examples include risk assessment tools and recommendation engines.
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Voice Input</div>
            <div className="text-xs">
              Click to activate voice recognition and speak your message instead of typing.
            </div>
          </div>
        );
      case 'attachment':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Attach Files</div>
            <div className="text-xs">
              Click to attach files or documents to your message for context and analysis.
            </div>
          </div>
        );
      case 'reliability':
        return (
          <div className="space-y-1">
            <div className="font-semibold">Reliability Score: {score}/10</div>
            <div className="text-xs">
              Measures the overall reliability and consistency of the data or response. Higher scores indicate more reliable information.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const content = getTooltipContent();
  if (!content) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScoreTooltip;
