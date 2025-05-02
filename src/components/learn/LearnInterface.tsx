
import React, { useState, useEffect } from 'react';
import AgentPanel from './AgentPanel';
import ContentDisplay from './ContentDisplay';
import TabsNavigation from './TabsNavigation';
import CollapsedSidebar from './CollapsedSidebar';
import { toast } from 'sonner';
import { useDocumentContextUpdates } from './hooks/useDocumentContextUpdates';
import { useMCP } from '@/hooks/use-mcp';

const LearnInterface = ({ metaQube, blakQube }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [sidebar, setSidebar] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { documentContextUpdated, handleDocumentContextUpdated } = useDocumentContextUpdates();
  const { client } = useMCP();

  // Force document context refresh when component mounts
  useEffect(() => {
    if (client && client.getConversationId()) {
      const conversationId = client.getConversationId();
      console.log(`LearnInterface: Refreshing document context for conversation ${conversationId}`);
      
      // Force reload context from storage
      if (client.reloadContextFromStorage()) {
        console.log('LearnInterface: Successfully reloaded context from storage');
        handleDocumentContextUpdated();
      }
    }
  }, [client]);

  const handleDocumentAdded = () => {
    // Update the document context
    toast.success('Document added to context', {
      description: 'The agent now has access to this document'
    });
    handleDocumentContextUpdated();
  };

  return (
    <div className="flex h-full">
      {sidebar ? (
        <div className="w-[350px] border-r overflow-y-auto">
          <AgentPanel 
            metaQube={metaQube}
            blakQube={blakQube}
            conversationId={conversationId}
            setConversationId={setConversationId}
            isPanelCollapsed={false}
            onDocumentAdded={handleDocumentAdded} 
            documentContextUpdated={documentContextUpdated} 
          />
        </div>
      ) : (
        <CollapsedSidebar 
          activeTab={activeTab} 
          handleTabClick={setActiveTab} 
          togglePanelCollapse={() => setSidebar(true)} 
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TabsNavigation 
          activeTab={activeTab} 
          handleTabClick={setActiveTab} 
        />

        <div className="flex-1 overflow-y-auto p-4">
          <ContentDisplay 
            activeTab={activeTab}
            currentItemIndex={0}
            courses={[]}
            certifications={[]}
            achievements={[]}
            goToPrev={() => {}}
            goToNext={() => {}}
            onCollapse={() => setSidebar(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default LearnInterface;
