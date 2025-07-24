import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, ChevronDown, MessageSquare, BookOpen, Play } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatTab from './ChatTab';
import KnowledgeBase from '../KnowledgeBase';
import IQubesKnowledgeBase from '@/components/mondai/iQubesKnowledgeBase';
import AgentInputBar from '../AgentInputBar';
import { AgentMessage } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIframePersistence } from '@/hooks/use-iframe-persistence';
import { iframeSessionManager } from '@/services/iframe-session-manager';

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
  recommendations?: {
    showMetisRecommendation: boolean;
    showVeniceRecommendation: boolean;
    showQryptoRecommendation: boolean;
    showKNYTRecommendation: boolean;
  };
  dismissRecommendation?: (agentName: string) => void;
  hideRecommendation?: (agentName: string) => void;
}

const SimplifiedAgentTabs: React.FC<SimplifiedAgentTabsProps & {
  onActivateAgent?: (agentName: string, fee: number, description: string) => void;
}> = ({
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
  handleKeyDown,
  recommendations,
  dismissRecommendation,
  hideRecommendation,
  onActivateAgent
}) => {
  const isMobile = useIsMobile();
  // State for tabs menu collapse - default to collapsed when media tab is active
  const [tabsCollapsed, setTabsCollapsed] = useState(activeTab === 'media');
  const [mediaInitialized, setMediaInitialized] = useState(iframeSessionManager.isMediaInitialized());
  const [sessionRecovering, setSessionRecovering] = useState(false);

  // Use iframe persistence hook
  const { containerRef, iframe, isRestored } = useIframePersistence({
    iframeId: 'qrypto-media-iframe',
    src: 'https://www.sizzleperks.com/embed/hqusgMObjXJ9',
    onIframeReady: (iframe) => {
      console.log('SimplifiedAgentTabs: Iframe ready', { isRestored });
      setMediaInitialized(true);
      iframeSessionManager.setMediaInitialized(true);
    }
  });

  // Handle session recovery for restored iframes
  useEffect(() => {
    if (isRestored && iframe && iframeSessionManager.hasAuthState()) {
      console.log('SimplifiedAgentTabs: Attempting session recovery for restored iframe');
      setSessionRecovering(true);
      setTimeout(() => {
        iframeSessionManager.requestAuthState();
        setSessionRecovering(false);
      }, 2000);
    }
  }, [isRestored, iframe]);

  // Update collapse state when activeTab changes to media
  useEffect(() => {
    if (activeTab === 'media') {
      setTabsCollapsed(true);
      // Initialize media when tab is first accessed
      if (!mediaInitialized && iframe) {
        console.log('SimplifiedAgentTabs: Media tab accessed, initializing');
        setMediaInitialized(true);
        iframeSessionManager.setMediaInitialized(true);
      }
    }
  }, [activeTab, mediaInitialized, iframe]);

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
          {!tabsCollapsed ? (
            <TabsList className="h-10 gap-0">
              <TabsTrigger value="chat" className="data-[state=active]:bg-qrypto-primary/20 px-3">Chat</TabsTrigger>
              <TabsTrigger value="knowledge" className="data-[state=active]:bg-qrypto-primary/20 px-3">Knowledge</TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-qrypto-primary/20 px-3">Media</TabsTrigger>
            </TabsList>
          ) : (
            <div className="h-10 flex items-center">
              {activeTab === 'chat' && <MessageSquare className="h-4 w-4 cursor-pointer hover:text-qrypto-primary" onClick={() => setTabsCollapsed(false)} />}
              {activeTab === 'knowledge' && <BookOpen className="h-4 w-4 cursor-pointer hover:text-qrypto-primary" onClick={() => setTabsCollapsed(false)} />}
              {activeTab === 'media' && <Play className="h-4 w-4 cursor-pointer hover:text-qrypto-primary" onClick={() => setTabsCollapsed(false)} />}
            </div>
          )}
          
          <div className="flex items-center gap-6">
            {/* Show Dual Knowledge Base header only when knowledge tab is active and agent is mondai */}
            {activeTab === 'knowledge' && agentType === 'mondai' && !tabsCollapsed && (
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-5 w-5 text-gray-400 cursor-help flex items-center justify-center text-sm font-medium">2</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Explore both iQubes technical knowledge and COYN economic framework</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            {/* Collapse button */}
            <Button variant="ghost" size="icon" onClick={() => setTabsCollapsed(!tabsCollapsed)} className="h-8 w-8">
              <ChevronDown className={cn("h-4 w-4 transition-transform", tabsCollapsed && "transform rotate-180")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <TabsContent value="chat" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          <ChatTab 
            messages={messages} 
            playing={playing} 
            agentType={agentType} 
            messagesEndRef={messagesEndRef} 
            handlePlayAudio={handlePlayAudio}
            recommendations={recommendations}
            onActivateAgent={onActivateAgent}
            onDismissRecommendation={dismissRecommendation}
          />
        </TabsContent>

        <TabsContent value="knowledge" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          {agentType === 'mondai' ? <IQubesKnowledgeBase /> : <KnowledgeBase agentType={knowledgeBaseAgentType} />}
        </TabsContent>

        <TabsContent value="media" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          <div 
            ref={containerRef}
            className="flex-1 bg-background overflow-hidden relative"
            style={{ 
              padding: isMobile ? '0' : '1rem'
            }}
          >
            {sessionRecovering && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                <div className="text-sm text-muted-foreground">Restoring session...</div>
              </div>
            )}
            {!iframe && (
              <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Loading media content...</p>
              </div>
            )}
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
