import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Cpu, Lock } from 'lucide-react';

export const OpenAIQubeData = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">OpenAI Provider</h3>
            <p className="text-sm text-muted-foreground">Advanced AI language models</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Cpu className="h-3 w-3" />
          <span>AI Provider</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Provider:</span>
          <span className="ml-2 text-muted-foreground">OpenAI</span>
        </div>
        <div>
          <span className="font-medium">Type:</span>
          <span className="ml-2 text-muted-foreground">Large Language Model</span>
        </div>
        <div>
          <span className="font-medium">Models:</span>
          <span className="ml-2 text-muted-foreground">GPT-4o, GPT-4o Mini</span>
        </div>
        <div>
          <span className="font-medium">Capabilities:</span>
          <span className="ml-2 text-muted-foreground">Text, Code, Analysis</span>
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-sm">Provider Features</span>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Industry-leading language understanding</li>
          <li>• Advanced reasoning and problem-solving</li>
          <li>• Code generation and debugging</li>
          <li>• Multi-modal capabilities (text, vision)</li>
          <li>• Enterprise-grade reliability</li>
        </ul>
      </div>

      <div className="text-xs text-muted-foreground">
        <p className="mb-1">
          <strong>Note:</strong> Only one AI provider (MonDAI, OpenAI, or Venice) can be active at a time.
        </p>
        <p>
          Activating OpenAI will automatically deactivate other AI providers.
        </p>
      </div>
    </div>
  );
};