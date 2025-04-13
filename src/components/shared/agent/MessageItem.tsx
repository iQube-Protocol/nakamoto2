
import React from 'react';
import { Play, Pause, Volume2, BookOpen, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
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

// Function to process message content and convert it to JSX with formatting
const formatMessageContent = (content: string): JSX.Element => {
  // Split content by double newlines to identify paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        // Handle bullet points
        if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
          const bulletItems = paragraph.split(/\n/).filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
          return (
            <ul key={pIndex} className="pl-5 my-4 space-y-2">
              {bulletItems.map((item, iIndex) => (
                <li key={iIndex} className="flex items-start">
                  <span className="mr-2 mt-1 text-iqube-primary">•</span>
                  <span>{item.replace(/^[*-] /, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        
        // Handle numbered lists
        else if (/^\d+\.\s/.test(paragraph.trim())) {
          const listItems = paragraph.split(/\n/).filter(line => /^\d+\.\s/.test(line.trim()));
          return (
            <ol key={pIndex} className="pl-5 my-4 space-y-2 list-decimal">
              {listItems.map((item, iIndex) => (
                <li key={iIndex} className="ml-4">{item.replace(/^\d+\.\s/, '')}</li>
              ))}
            </ol>
          );
        }
        
        // Handle headings
        else if (paragraph.startsWith('# ')) {
          return <h2 key={pIndex} className="text-xl font-bold mt-4 mb-2">{paragraph.substring(2)}</h2>;
        }
        else if (paragraph.startsWith('## ')) {
          return <h3 key={pIndex} className="text-lg font-bold mt-3 mb-2">{paragraph.substring(3)}</h3>;
        }
        else if (paragraph.startsWith('### ')) {
          return <h4 key={pIndex} className="text-base font-bold mt-3 mb-2">{paragraph.substring(4)}</h4>;
        }
        
        // Handle key concepts with an icon
        else if (paragraph.toLowerCase().includes('key concept') || paragraph.toLowerCase().includes('important:')) {
          return (
            <div key={pIndex} className="flex my-4 p-3 bg-iqube-primary/10 rounded-md">
              <Lightbulb className="h-5 w-5 mr-2 flex-shrink-0 text-iqube-primary" />
              <div>{paragraph}</div>
            </div>
          );
        }
        
        // Handle tips with an icon
        else if (paragraph.toLowerCase().includes('tip:') || paragraph.toLowerCase().includes('hint:')) {
          return (
            <div key={pIndex} className="flex my-4 p-3 bg-green-100 rounded-md">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
              <div>{paragraph}</div>
            </div>
          );
        }
        
        // Handle warnings or notes
        else if (paragraph.toLowerCase().includes('note:') || paragraph.toLowerCase().includes('warning:')) {
          return (
            <div key={pIndex} className="flex my-4 p-3 bg-amber-100 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
              <div>{paragraph}</div>
            </div>
          );
        }
        
        // Handle code examples
        else if (paragraph.includes('```')) {
          const parts = paragraph.split('```');
          return (
            <div key={pIndex} className="my-4">
              {parts.map((part, partIndex) => {
                if (partIndex % 2 === 1) { // This is a code block
                  // Extract language if specified
                  const codeLines = part.split('\n');
                  const language = codeLines[0].trim();
                  const code = codeLines.slice(language ? 1 : 0).join('\n');
                  
                  return (
                    <pre key={partIndex} className="bg-gray-100 p-3 rounded-md overflow-x-auto my-2">
                      <code>{code}</code>
                    </pre>
                  );
                } else if (part.trim()) { // Regular text before/after code block
                  return <p key={partIndex} className="my-2">{part}</p>;
                }
                return null;
              })}
            </div>
          );
        }
        
        // Handle definition lists or term explanations
        else if (paragraph.includes(':') && paragraph.split(':')[0].trim().length < 30) {
          const term = paragraph.split(':')[0].trim();
          const definition = paragraph.split(':').slice(1).join(':').trim();
          
          return (
            <div key={pIndex} className="my-4">
              <dt className="font-bold">{term}:</dt>
              <dd className="ml-4">{definition}</dd>
            </div>
          );
        }
        
        // Regular paragraph
        else if (paragraph.trim()) {
          return <p key={pIndex} className="my-3">{paragraph}</p>;
        }
        
        return null;
      })}
    </>
  );
};

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
          
          {/* Apply formatted message content */}
          <div className="prose prose-sm max-w-none">
            {message.sender === 'user' ? (
              <p>{message.message}</p>
            ) : (
              formatMessageContent(message.message)
            )}
          </div>
          
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

