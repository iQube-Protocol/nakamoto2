
import React, { lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import AgentInputBar from './AgentInputBar';
import { AgentMessage } from '@/lib/types';

// Lazy load the tab components to improve initial load time
const ChatTab = lazy(() => import('./tabs/ChatTab'));
const DocumentsTab = lazy(() => import('./tabs/DocumentsTab'));
const KnowledgeTab = lazy(() => import('./tabs/KnowledgeTab'));

// Loading fallback component
const TabLoading = () => (
  <div className="flex items-center justify-center h-full p-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

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
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as 'chat' | 'knowledge' | 'documents')}
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
        <TabsContent value="chat" className="flex-1 p-0 m-0 overflow-hidden h-full">
          {activeTab === 'chat' && (
            <Suspense fallback={<TabLoading />}>
              <ChatTab
                messages={messages}
                isProcessing={isProcessing}
                playing={playing}
                messagesEndRef={messagesEndRef}
                onPlayAudio={onPlayAudio}
                agentType={agentType}
              />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="documents" className="p-0 m-0 overflow-hidden h-full">
          {activeTab === 'documents' && (
            <Suspense fallback={<TabLoading />}>
              <DocumentsTab
                conversationId={conversationId}
                onDocumentAdded={onDocumentAdded}
                isActiveTab={activeTab === 'documents'}
              />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="p-0 m-0 overflow-hidden h-full">
          {activeTab === 'knowledge' && (
            <Suspense fallback={<TabLoading />}>
              <KnowledgeTab agentType={agentType} />
            </Suspense>
          )}
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
