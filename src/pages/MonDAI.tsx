
import React from 'react';
import MonDAIInterface from '@/components/mondai/MonDAIInterface';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const MonDAI = () => {
  return <MonDAIInterface />;
};

export default MonDAI;
