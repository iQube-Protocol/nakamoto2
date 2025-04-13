
import React, { useState, useRef, useEffect } from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentHeader from './AgentHeader';
import MessageList from './MessageList';
import AgentInputBar from './AgentInputBar';
import EmptyConversation from './EmptyConversation';
import KnowledgeBase from './KnowledgeBase';

interface AgentInterfaceProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages?: AgentMessage[];
  onMessageSubmit?: (message: string) => Promise<AgentMessage>;
}

const AgentInterface = ({
  title,
  description,
  agentType,
  initialMessages = [],
  onMessageSubmit,
}: AgentInterfaceProps) => {
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [playing, setPlaying] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      if (onMessageSubmit) {
        const agentResponse = await onMessageSubmit(userMessage.message);
        setMessages(prev => [...prev, agentResponse]);
      } else {
        setTimeout(() => {
          let agentResponse = '';
          
          switch (agentType) {
            case 'learn':
              agentResponse = `I'm your Learning Agent. Based on your iQube data, I recommend exploring topics related to ${Math.random() > 0.5 ? 'DeFi protocols' : 'NFT marketplaces'}. Would you like me to provide more information?`;
              break;
            case 'earn':
              agentResponse = `I'm your Earning Agent. Your MonDAI tokens have increased by ${(Math.random() * 5).toFixed(2)}% today. Would you like to see potential staking opportunities based on your iQube profile?`;
              break;
            case 'connect':
              agentResponse = `I'm your Connection Agent. Based on your interests in your iQube, I found ${Math.floor(Math.random() * 10) + 1} community members with similar interests in ${Math.random() > 0.5 ? 'DeFi' : 'NFTs'}. Would you like me to introduce you?`;
              break;
          }

          const newAgentMessage: AgentMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            message: agentResponse,
            timestamp: new Date().toISOString(),
          };

          setMessages(prev => [...prev, newAgentMessage]);
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = (messageId: string) => {
    if (playing === messageId) {
      setPlaying(null);
    } else {
      setPlaying(messageId);
      setTimeout(() => {
        if (playing === messageId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        title={title} 
        description={description} 
        isProcessing={isProcessing} 
      />

      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'chat' | 'knowledge')}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="data-[state=active]:bg-iqube-primary/20">Chat</TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-iqube-primary/20">Knowledge Base</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          {messages.length === 0 ? (
            <EmptyConversation agentType={agentType} />
          ) : (
            <MessageList 
              messages={messages} 
              isProcessing={isProcessing} 
              playing={playing} 
              onPlayAudio={handlePlayAudio} 
              messagesEndRef={messagesEndRef}
            />
          )}

          <AgentInputBar
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isProcessing={isProcessing}
            agentType={agentType}
          />
        </TabsContent>

        <TabsContent value="knowledge" className="flex-1 p-4 m-0 overflow-y-auto">
          <KnowledgeBase agentType={agentType} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AgentInterface;
