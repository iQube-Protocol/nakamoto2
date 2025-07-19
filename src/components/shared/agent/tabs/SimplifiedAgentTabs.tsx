import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, ChevronDown, MessageSquare, BookOpen, Play, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatTab from './ChatTab';
import KnowledgeBase from '../KnowledgeBase';
import IQubesKnowledgeBase from '@/components/mondai/iQubesKnowledgeBase';
import AgentInputBar from '../AgentInputBar';
import { AgentMessage } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  // State for tabs menu collapse - default to collapsed when media tab is active
  const [tabsCollapsed, setTabsCollapsed] = useState(activeTab === 'media');
  // Loading state for iframe
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // Update collapse state when activeTab changes to media
  useEffect(() => {
    if (activeTab === 'media') {
      setTabsCollapsed(true);
    }
  }, [activeTab]);

  // Reset loading state when switching to media tab
  useEffect(() => {
    if (activeTab === 'media') {
      setIsIframeLoading(true);
      setIframeError(false);
    }
  }, [activeTab]);

  // Function to handle tab switching after form submission
  const handleAfterSubmit = () => {
    // Always switch to chat tab when a message is sent
    setActiveTab('chat');
  };

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsIframeLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsIframeLoading(false);
    setIframeError(true);
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

      <div className="flex-1 overflow-hidden flex flex-col">
        <TabsContent value="chat" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          <ChatTab messages={messages} playing={playing} agentType={agentType} messagesEndRef={messagesEndRef} handlePlayAudio={handlePlayAudio} />
        </TabsContent>

        <TabsContent value="knowledge" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1">
          {agentType === 'mondai' ? <IQubesKnowledgeBase /> : <KnowledgeBase agentType={knowledgeBaseAgentType} />}
        </TabsContent>

        <TabsContent value="media" className="h-full m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col flex-1 relative">
          <div className="h-full w-full relative overflow-hidden">
            {/* Loading spinner */}
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-qrypto-primary" />
                  <p className="text-sm text-muted-foreground">Loading Avatar Creator...</p>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3 text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Play className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-destructive">Failed to load Avatar Creator</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The external service may be temporarily unavailable
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setIframeError(false);
                      setIsIframeLoading(true);
                      // Force iframe reload by updating its key
                      const iframe = document.querySelector('iframe[src*="sizzleperks.com"]') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            <iframe 
              src="https://www.sizzleperks.com/embed/hqusgMObjXJ9" 
              allow="camera; microphone; display-capture; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className="border-0 md:rounded-md w-full h-full"
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
