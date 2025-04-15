
import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  Lock, 
  CheckCircle2, 
  FileCheck,
  Database,
  Mic,
  Paperclip,
  Image,
  Cpu,
  Brain
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreTooltipProps {
  children: React.ReactNode;
  score?: number;
  type: 'reliability' | 'trust' | 'risk' | 'sensitivity' | 'accuracy' | 'verifiability' | 'dataQube' | 'voice' | 'attachment' | 'image' | 'mlModel' | 'agentQube';
}

const ScoreTooltip: React.FC<ScoreTooltipProps> = ({ children, score, type }) => {
  const getTooltipContent = () => {
    switch(type) {
      case 'reliability':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
              Reliability Score: {score}/10
            </div>
            <div className="text-xs">
              Measures how consistently the information can be reproduced and verified from multiple sources.
            </div>
          </div>
        );
      case 'trust':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
              Trust Score: {score}/10
            </div>
            <div className="text-xs">
              Evaluates the credibility of data sources and the extent to which information can be trusted.
            </div>
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
              Risk Score: {score}/10
            </div>
            <div className="text-xs">
              Assesses potential vulnerabilities and exposure to harmful consequences from data usage.
            </div>
          </div>
        );
      case 'sensitivity':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Lock className="h-4 w-4 mr-2 text-purple-500" />
              Sensitivity Score: {score}/10
            </div>
            <div className="text-xs">
              Rates the level of personal or confidential content present in the data.
            </div>
          </div>
        );
      case 'accuracy':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Accuracy Score: {score}/10
            </div>
            <div className="text-xs">
              Indicates how precise and error-free the information is based on current knowledge.
            </div>
          </div>
        );
      case 'verifiability':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <FileCheck className="h-4 w-4 mr-2 text-blue-500" />
              Verifiability Score: {score}/10
            </div>
            <div className="text-xs">
              Measures how easily claims can be checked against independent sources of truth.
            </div>
          </div>
        );
      case 'dataQube':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Database className="h-4 w-4 mr-2 text-purple-500" />
              DataQube
            </div>
            <div className="text-xs">
              Access your personal data store with permissions and metadata tracking.
            </div>
          </div>
        );
      case 'agentQube':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-500" />
              AgentQube
            </div>
            <div className="text-xs">
              Advanced AI agent with specialized capabilities and configurable permissions.
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Mic className="h-4 w-4 mr-2 text-blue-500" />
              Voice Input
            </div>
            <div className="text-xs">
              Record audio to be transcribed and included in your message.
            </div>
          </div>
        );
      case 'attachment':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
              File Attachment
            </div>
            <div className="text-xs">
              Upload and attach files to your message.
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Image className="h-4 w-4 mr-2 text-green-500" />
              Image Upload
            </div>
            <div className="text-xs">
              Upload and include images in your message.
            </div>
          </div>
        );
      case 'mlModel':
        return (
          <div className="space-y-1">
            <div className="font-semibold flex items-center">
              <Cpu className="h-4 w-4 mr-2 text-blue-500" />
              ML Model: GPT-4o
            </div>
            <div className="text-xs space-y-1">
              <p>Currently using OpenAI's GPT-4o model for inference.</p>
              <p>Capabilities: text generation, code analysis, and contextual understanding.</p>
              <p>Advanced prompt handling with context retention.</p>
              <p>Trained up to April 2023 knowledge cutoff.</p>
              <p>Response latency: ~2-5s for typical requests.</p>
            </div>
          </div>
        );
      default:
        return <div>Information</div>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="z-50">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScoreTooltip;
