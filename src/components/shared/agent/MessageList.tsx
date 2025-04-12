
import React, { useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { AgentMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MessageListProps {
  messages: AgentMessage[];
  isProcessing: boolean;
  playing: string | null;
  handlePlayAudio: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isProcessing,
  playing,
  handlePlayAudio,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyMessageState />
        ) : (
          messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              playing={playing} 
              handlePlayAudio={handlePlayAudio} 
            />
          ))
        )}
        {isProcessing && <ProcessingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

const EmptyMessageState = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="text-center p-6">
      <Bot className="mx-auto h-12 w-12 text-iqube-primary opacity-50 mb-4" />
      <h3 className="font-medium text-lg">Start a conversation</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Your agent is ready to assist you. Ask any question
        to get started.
      </p>
    </div>
  </div>
);

const ProcessingIndicator = () => (
  <div className="agent-message">
    <div className="flex space-x-2 items-center">
      <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.2s'}}></div>
      <div className="w-2 h-2 rounded-full bg-iqube-primary animate-pulse" style={{animationDelay: '0.4s'}}></div>
    </div>
  </div>
);

const MessageItem = ({ message, playing, handlePlayAudio }: { 
  message: AgentMessage, 
  playing: string | null,
  handlePlayAudio: (messageId: string) => void
}) => {
  return (
    <div
      className={message.sender === 'user' ? 'user-message' : 'agent-message'}
    >
      <div className="flex">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            {message.sender === 'agent' && message.metadata && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-[10px] mr-1 py-0 h-4">
                        <span className="text-muted-foreground">MCP v{message.metadata.version}</span>
                      </Badge>
                      {message.metadata.modelUsed && (
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                          {message.metadata.modelUsed}
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Using Model Context Protocol</p>
                    {message.metadata.contextRetained && 
                      <p className="text-xs text-muted-foreground">Context maintained between messages</p>
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p>{message.message}</p>
          <MessageFooter 
            message={message} 
            playing={playing} 
            handlePlayAudio={handlePlayAudio} 
          />
        </div>
      </div>
    </div>
  );
};

const MessageFooter = ({ message, playing, handlePlayAudio }: { 
  message: AgentMessage, 
  playing: string | null,
  handlePlayAudio: (messageId: string) => void
}) => {
  return (
    <>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {message.sender === 'agent' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handlePlayAudio(message.id)}
          >
            {playing === message.id ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {playing === message.id && (
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
    </>
  );
};

// Missing import for Bot icon
import { Bot } from 'lucide-react';

export default MessageList;
