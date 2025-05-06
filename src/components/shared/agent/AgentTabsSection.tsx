import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatTab from './tabs/ChatTab';
import DocumentsTab from './tabs/DocumentsTab';
import KnowledgeTab from './tabs/KnowledgeTab';
import AgentInputBar from './AgentInputBar';
import { AgentMessage } from '@/lib/types';

interface AgentTabsSectionProps {
  activeTab: 'chat' | 'knowledge' | 'documents';
  setActiveTab: (tab: 'chat' | 'knowledge' | 'documents') => void;
  messages: AgentMessage[];
  isProcessing: boolean;
  playing: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onPlayAudio: (messageId: string) => void;
  conversationId: string | null;
  onDocumentAdded: () => void;
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  agentType: 'learn' | 'earn' | 'connect';
}

const AgentTabsSection: React.FC<AgentTabsSectionProps> = ({
  activeTab,
  setActiveTab,
  messages,
  isProcessing,
  playing,
  messagesEndRef,
  onPlayAudio,
  conversationId,
  onDocumentAdded,
  inputValue,
  handleInputChange,
  handleSubmit,
  agentType
}) => {
  // Keep track of which tabs have been visited (not just loaded)
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({
    chat: true, // Always mark chat as visited by default
    knowledge: false,
    documents: false
  });
  
  // When tab changes, mark it as visited
  useEffect(() => {
    if (activeTab && !visitedTabs[activeTab]) {
      setVisitedTabs(prev => ({
        ...prev,
        [activeTab]: true
      }));
    }
  }, [activeTab, visitedTabs]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Only update if the tab is actually changing
    if (value !== activeTab) {
      setActiveTab(value as 'chat' | 'knowledge' | 'documents');
      console.log(`Switching to tab: ${value}`);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex-1 flex flex-col"
    >
      <div className="border-b px-4">
        <TabsList className="h-10">
          <TabsTrigger value="chat" className="data-[state=active]:bg-iqube-primary/20">
            Chat
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-iqube-primary/20">
            Documents
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-iqube-primary/20">
            Knowledge Base
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TabsContent value="chat" className="flex-1 p-0 m-0 overflow-hidden">
          <ChatTab
            messages={messages}
            isProcessing={isProcessing}
            playing={playing}
            messagesEndRef={messagesEndRef}
            onPlayAudio={onPlayAudio}
            agentType={agentType}
          />
        </TabsContent>

        <TabsContent value="documents" className="p-0 m-0 overflow-hidden">
          {/* Render DocumentsTab regardless if it's visited before - but with isActiveTab flag */}
          <DocumentsTab
            conversationId={conversationId}
            onDocumentAdded={onDocumentAdded}
            isActiveTab={activeTab === 'documents'}
          />
        </TabsContent>

        <TabsContent value="knowledge" className="p-0 m-0 overflow-hidden">
          {/* Render KnowledgeTab regardless if it's visited before - but with isActiveTab flag */}
          <KnowledgeTab 
            agentType={agentType} 
            isActiveTab={activeTab === 'knowledge'} 
          />
        </TabsContent>
      </div>

      <AgentInputBar
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isProcessing={isProcessing}
        agentType={agentType}
      />
    </Tabs>
  );
};

export default AgentTabsSection;
