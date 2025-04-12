
import React, { useState } from 'react';
import { AgentMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AgentHeader from './agent/AgentHeader';
import MessageList from './agent/MessageList';
import MessageInput from './agent/MessageInput';
import KnowledgeBase from './agent/KnowledgeBase';

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
  const [reliability] = useState(Math.floor(Math.random() * 3) + 3); // Random score between 3-5
  const [trust] = useState(4); // Trust score set to 4 out of 5
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input Activated",
      description: "Voice recognition is listening... (Simulated)",
    });
  };

  const handlePlayAudio = (messageId: string) => {
    if (playing === messageId) {
      setPlaying(null);
      toast({
        title: "Audio Paused",
        description: "Text-to-speech playback paused",
      });
    } else {
      setPlaying(messageId);
      toast({
        title: "Audio Playing",
        description: "Playing agent response as audio (simulated)",
      });

      setTimeout(() => {
        if (playing === messageId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };

  const handleAttachment = () => {
    toast({
      title: "Attach Files",
      description: "File attachment functionality coming soon.",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "Upload Image",
      description: "Image upload functionality coming soon.",
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        title={title}
        description={description}
        isProcessing={isProcessing}
        reliability={reliability}
        trust={trust}
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
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={messages}
              isProcessing={isProcessing}
              playing={playing}
              handlePlayAudio={handlePlayAudio}
            />
          </div>

          <MessageInput 
            inputValue={inputValue}
            isProcessing={isProcessing}
            agentType={agentType}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleVoiceInput={handleVoiceInput}
            handleAttachment={handleAttachment}
            handleImageUpload={handleImageUpload}
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
