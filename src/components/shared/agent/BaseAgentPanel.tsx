
import React from 'react';
import { AgentInterface } from '@/components/shared/agent';
import { MetaQube, BlakQube } from '@/lib/types';

interface BaseAgentPanelProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect';
  conversationId: string | null;
  isPanelCollapsed: boolean;
  initialMessage: string;
  onMessageSubmit: (message: string) => Promise<any>;
  onDocumentAdded?: () => void;
  documentContextUpdated?: number;
}

const BaseAgentPanel = ({
  title,
  description,
  agentType,
  conversationId,
  isPanelCollapsed,
  initialMessage,
  onMessageSubmit,
  onDocumentAdded,
  documentContextUpdated = 0
}: BaseAgentPanelProps) => {
  // Effect to track document context updates
  React.useEffect(() => {
    if (documentContextUpdated > 0) {
      console.log(`Document context updated (${documentContextUpdated}), refreshing UI`);
    }
  }, [documentContextUpdated]);

  return (
    <div className={`${isPanelCollapsed ? 'lg:col-span-1' : 'lg:col-span-2'} flex flex-col`}>
      <AgentInterface
        title={title}
        description={description}
        agentType={agentType}
        onMessageSubmit={onMessageSubmit}
        onDocumentAdded={onDocumentAdded}
        documentContextUpdated={documentContextUpdated}
        conversationId={conversationId}
        initialMessages={[
          {
            id: "1",
            sender: "agent",
            message: initialMessage,
            timestamp: new Date().toISOString(),
            metadata: {
              version: "1.0",
              modelUsed: "gpt-4o-mini"
            }
          }
        ]}
      />
    </div>
  );
};

export default BaseAgentPanel;
