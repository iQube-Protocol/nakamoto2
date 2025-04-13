
import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { AgentMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface MessageItemProps {
  message: AgentMessage;
  isPlaying: boolean;
  onPlayAudio: (messageId: string) => void;
}

const MessageItem = ({ message, isPlaying, onPlayAudio }: MessageItemProps) => {
  return (
    <div className={message.sender === 'user' ? 'user-message' : 'agent-message'}>
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
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.sender === 'agent' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onPlayAudio(message.id)}
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          {isPlaying && (
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
  );
};

export default MessageItem;
