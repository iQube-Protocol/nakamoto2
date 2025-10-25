
import React, { useRef } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import ScoreTooltip from '../ScoreTooltips';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgentInputBarProps {
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  agentType: 'learn' | 'earn' | 'connect' | 'aigent';
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onAfterSubmit?: () => void;
}

const AgentInputBar = ({
  inputValue,
  handleInputChange,
  handleSubmit,
  isProcessing,
  agentType,
  handleKeyDown,
  onAfterSubmit
}: AgentInputBarProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input Activated",
      description: "Voice recognition is listening... (Simulated)",
    });
  };

  const handleAttachment = () => {
    toast({
      title: "Attach Files",
      description: "File attachment functionality coming soon.",
    });
  };

  // Enhanced form submit handler that calls the callback after submission
  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    // Call the callback after submission if provided
    if (onAfterSubmit) {
      onAfterSubmit();
    }
  };

  // Custom input change handler to adjust textarea height
  const customHandleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    
    // Reset height to auto to properly calculate scrollHeight
    e.target.style.height = 'auto';
    
    // Set height based on content (with min height)
    const minHeight = 40; // in pixels
    const newHeight = Math.max(e.target.scrollHeight, minHeight);
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <form onSubmit={handleFormSubmit} className="border-t p-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 flex items-center space-x-2 z-10">
            <ScoreTooltip type="voice">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={handleVoiceInput}
              >
                <Mic className="h-4 w-4 text-muted-foreground" />
              </Button>
            </ScoreTooltip>
            
            <ScoreTooltip type="attachment">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={handleAttachment}
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </ScoreTooltip>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={customHandleInputChange}
            onKeyDown={handleKeyDown} 
            placeholder={window.location.pathname === '/aigent' ? 'Ask Nakamoto...' : `Ask your ${agentType} agent...`}
            className="w-full pl-24 pr-3 py-2.5 min-h-[40px] max-h-32 resize-none"
            style={{
              lineHeight: '1.5',
            }}
            disabled={isProcessing}
          />
        </div>
        
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
  );
};

export default AgentInputBar;
