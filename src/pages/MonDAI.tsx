
import React from 'react';
import SimplifiedMonDAIInterface from '@/components/mondai/SimplifiedMonDAIInterface';
import { useAuth } from '@/hooks/use-auth';

// Extend the agent service to support 'mondai' type
declare module '@/services/agent-service' {
  interface ConversationContextOptions {
    agentType: "learn" | "earn" | "connect" | "mondai";
  }
}

const QryptoCOYN = () => {
  // Add auth check to ensure the hook is available
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <SimplifiedMonDAIInterface />;
};

export default QryptoCOYN;
