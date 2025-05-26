
import React from 'react';
import SimplifiedMonDAIInterface from '@/components/mondai/SimplifiedMonDAIInterface';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const QryptoCOYN = () => {
  return <SimplifiedMonDAIInterface />;
};

export default QryptoCOYN;
