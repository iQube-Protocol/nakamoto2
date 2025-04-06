import React, { useState } from 'react';
import { Send, Mic, Paperclip, Image, Bot, Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { AgentMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AgentInterfaceProps {
  title: string;
  description: string;
  agentType: 'learn' | 'earn' | 'connect';
  initialMessages?: AgentMessage[];
}

const AgentInterface = ({
  title,
  description,
  agentType,
  initialMessages = [],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate agent response
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

      // Simulate end of audio after 5 seconds
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

  const getTrustColor = (score: number) => {
    // Trust: 5-10 green, 3-4 amber, 1-2 red
    return score >= 5 
      ? "bg-iqube-primary/60" 
      : score >= 3 
        ? "bg-yellow-500/60" 
        : "bg-red-500/60";
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Bot className="mr-2 h-5 w-5 text-iqube-accent" />
            {title}
            {isProcessing && (
              <span className="ml-2 flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-md">
          <div className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">Reliability</div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < reliability ? 'bg-iqube-primary/60' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-border mx-1"></div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">Trust</div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < trust ? getTrustColor(trust) : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <Bot className="mx-auto h-12 w-12 text-iqube-primary opacity-50 mb-4" />
                  <h3 className="font-medium text-lg">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your {agentType} agent is ready to assist you. Ask any question
                    to get started.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.sender === 'user' ? 'user-message' : 'agent-message'}
                >
                  <div className="flex">
                    <div className="flex-1">
                      <p>{msg.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender === 'agent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handlePlayAudio(msg.id)}
                          >
                            {playing === msg.id ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      {playing === msg.id && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1">
                            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-iqube-primary rounded-full animate-pulse" style={{ width: '50%' }}></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-muted-foreground">0:02</span>
                              <span className="text-[10px] text-muted-foreground">0:05</span>
                            </div>
                          </div>
                          <Volume2 className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="agent-message">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleVoiceInput}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleAttachment}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleImageUpload}
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`Ask your ${agentType} agent...`}
                className="flex-1 min-h-10 max-h-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              
              <Button 
                type="submit" 
                size="icon" 
                className="bg-iqube-primary hover:bg-iqube-primary/80"
                disabled={!inputValue.trim() || isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="knowledge" className="flex-1 p-4 m-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">
                Access specialized information related to {agentType === 'learn' ? 'web3 education' : 
                  agentType === 'earn' ? 'MonDAI tokens' : 'community connections'}.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 hover:bg-card/90 transition-colors cursor-pointer">
                  <h4 className="font-medium">
                    {agentType === 'learn' && `Web3 Learning Module ${i}`}
                    {agentType === 'earn' && `Token Economics Guide ${i}`}
                    {agentType === 'connect' && `Community Guide ${i}`}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {agentType === 'learn' && "Learn about blockchain fundamentals and web3 applications."}
                    {agentType === 'earn' && "Understand MonDAI token metrics and rewards."}
                    {agentType === 'connect' && "Connect with like-minded individuals in the community."}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AgentInterface;
