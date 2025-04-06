
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wand2, ThumbsUp, ThumbsDown, MessageSquare, BookOpen, Play, Pause } from 'lucide-react';

interface AgentInterfaceProps {
  title: string;
  description: string;
  chatHistory: { role: 'agent' | 'user', content: string }[];
  knowledgeBase?: { title: string, content: string }[];
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

interface ScoreDisplayProps {
  score: number;
  total?: number;
  label: string;
}

const ScoreDisplay = ({ score, total = 5, label }: ScoreDisplayProps) => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-medium mb-1">{label}</span>
      <div className="flex gap-0.5">
        {[...Array(total)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 w-1.5 rounded-full ${i < score ? 'bg-iqube-primary' : 'bg-gray-400/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

const AgentInterface = ({ 
  title, 
  description, 
  chatHistory, 
  knowledgeBase,
  onSubmit, 
  isLoading = false 
}: AgentInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handlePlayVoice = () => {
    setIsPlaying(!isPlaying);
    // Voice playback logic would go here
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="p-4 pb-3 flex flex-row justify-between items-center space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-lg font-bold">
              {title}
              {isLoading && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreDisplay score={4} label="Reliability" />
            <ScoreDisplay score={4} label="Trust" />
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="p-2 border-b">
          <Tabs defaultValue="chat" className="w-full" onValueChange={(v) => setActiveTab(v as 'chat' | 'knowledge')}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-48 grid-cols-2">
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="knowledge">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Knowledge
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'chat' && chatHistory.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2" 
                  onClick={handlePlayVoice}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:flex-1">
            <ScrollArea className="flex-1 p-4">
              {chatHistory.map((message, i) => (
                <div
                  key={i}
                  className={message.role === 'agent' ? 'agent-message' : 'user-message'}
                >
                  {message.content}
                  
                  {message.role === 'agent' && isPlaying && i === chatHistory.length - 1 && (
                    <div className="mt-2 h-8 flex items-center gap-1">
                      {/* Audio waveform visualization */}
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="h-full w-1 bg-iqube-primary/50 rounded-full"
                          style={{
                            height: `${Math.max(15, Math.min(100, Math.random() * 100))}%`,
                            animationDelay: `${i * 0.05}s`,
                            animation: 'bounce 0.5s ease infinite alternate'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="agent-message">
                  <div className="flex space-x-2 items-center">
                    <div className="h-2 w-2 bg-iqube-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-iqube-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-iqube-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </ScrollArea>
            
            <style jsx>{`
              @keyframes bounce {
                0% {
                  height: 30%;
                }
                100% {
                  height: 100%;
                }
              }
            `}</style>
            
            <div className="border-t p-2">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="Ask a question..."
                />
                <Button type="submit" size="sm" disabled={isLoading}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Ask
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="flex-1 data-[state=active]:flex flex-col mt-0">
            <ScrollArea className="flex-1 p-4">
              {knowledgeBase && knowledgeBase.map((item, i) => (
                <div key={i} className="mb-4">
                  <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentInterface;
