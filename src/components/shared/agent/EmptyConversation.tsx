
import React from 'react';
import { Bot } from 'lucide-react';

interface EmptyConversationProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const EmptyConversation = ({ agentType }: EmptyConversationProps) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="text-center p-6">
        <Bot className="mx-auto h-12 w-12 text-iqube-primary opacity-50 mb-4" />
        <h3 className="font-medium text-lg">Start a conversation</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your {agentType} agent is ready to assist you. Ask any question
          to get started.
        </p>
      </div>
    </div>
  );
};

export default EmptyConversation;
