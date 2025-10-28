
import React from 'react';
import { Bot } from 'lucide-react';

interface EmptyConversationProps {
  agentType: 'learn' | 'earn' | 'connect' | 'aigent';
}

const EmptyConversation = ({ agentType }: EmptyConversationProps) => {
  const getAgentName = () => {
    switch (agentType) {
      case 'aigent':
        return 'Nakamoto';
      case 'learn':
        return 'learning';
      case 'earn':
        return 'earning';
      case 'connect':
        return 'connection';
      default:
        return agentType;
    }
  };

  const getDescription = () => {
    switch (agentType) {
      case 'aigent':
        return "Ask Aigent Nakamoto anything you'd like to know by typing your question in the box below.";
      default:
        return `Your ${getAgentName()} agent is ready to assist you. Ask any question to get started.`;
    }
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="text-center p-6">
        <Bot className="mx-auto h-12 w-12 text-iqube-primary opacity-50 mb-4" />
        <h3 className="font-medium text-lg">Start a conversation</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {getDescription()}
        </p>
      </div>
    </div>
  );
};

export default EmptyConversation;
