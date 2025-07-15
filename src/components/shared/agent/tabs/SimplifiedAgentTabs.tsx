
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatTab from './ChatTab';
import KnowledgeBase from '../KnowledgeBase';
import IQubesKnowledgeBase from '@/components/mondai/iQubesKnowledgeBase';
import AgentInputBar from '../AgentInputBar';
import { AgentMessage } from '@/lib/types';

interface SimplifiedAgentTabsProps {
  activeTab: 'chat' | 'knowledge' | 'media';
  setActiveTab: (tab: 'chat' | 'knowledge' | 'media') => void;
  messages: AgentMessage[];
  inputValue: string;
  isProcessing: boolean;
  playing: string | null;
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationId: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handlePlayAudio: (messageId: string) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const SimplifiedAgentTabs: React.FC<SimplifiedAgentTabsProps> = ({
  activeTab,
  setActiveTab,
  messages,
  inputValue,
  isProcessing,
  playing,
  agentType,
  messagesEndRef,
  conversationId,
  handleInputChange,
  handleSubmit,
  handlePlayAudio,
  handleKeyDown
}) => {
  // Function to handle tab switching after form submission
  const handleAfterSubmit = () => {
    // Always switch to chat tab when a message is sent
    setActiveTab('chat');
  };

  // Convert 'mondai' to 'learn' for KnowledgeBase component
  const knowledgeBaseAgentType = agentType === 'mondai' ? 'learn' : agentType;

  return (
    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'chat' | 'knowledge' | 'media')} className="flex-1 flex flex-col h-full">
      <div className="border-b px-4">
        <div className="flex items-center justify-between">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="data-[state=active]:bg-qrypto-primary/20">Chat</TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-qrypto-primary/20">Knowledge Base</TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-qrypto-primary/20">Media</TabsTrigger>
          </TabsList>
          
          {/* Show Dual Knowledge Base header only when knowledge tab is active and agent is mondai */}
          {activeTab === 'knowledge' && agentType === 'mondai' && (
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Dual Base</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explore both iQubes technical knowledge and COYN economic framework</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <TabsContent value="chat" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          <ChatTab 
            messages={messages} 
            playing={playing} 
            agentType={agentType} 
            messagesEndRef={messagesEndRef} 
            handlePlayAudio={handlePlayAudio} 
          />
        </TabsContent>

        <TabsContent value="knowledge" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          {agentType === 'mondai' ? (
            <IQubesKnowledgeBase />
          ) : (
            <KnowledgeBase agentType={knowledgeBaseAgentType} />
          )}
        </TabsContent>

        <TabsContent value="media" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          <div className="h-full w-full">
            <iframe 
              src="https://www.sizzleperks.com/embed/hqusgMObjXJ9" 
              width="100%" 
              height="100%" 
              style={{ height: '100vh', maxHeight: '100%', width: '100vw', maxWidth: '100%' }}
              className="border-0"
            />
          </div>
        </TabsContent>
      </div>

      {/* Input bar moved outside of tabs, always visible with improved mobile support */}
      <div className="mt-auto">
        <AgentInputBar 
          inputValue={inputValue} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmit}
          isProcessing={isProcessing} 
          agentType={agentType} 
          handleKeyDown={handleKeyDown}
          onAfterSubmit={handleAfterSubmit}
        />
      </div>
    </Tabs>
  );
};

export default SimplifiedAgentTabs;
