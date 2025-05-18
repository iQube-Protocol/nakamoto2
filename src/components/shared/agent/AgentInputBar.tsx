
import React from 'react';
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
  agentType: 'learn' | 'earn' | 'connect' | 'mondai';
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const AgentInputBar = ({
  inputValue,
  handleInputChange,
  handleSubmit,
  isProcessing,
  agentType,
  handleKeyDown
}: AgentInputBarProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const defaultHandleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSubmit(e);
      }
    }
  };

  // Create custom placeholder text based on the agent type
  const getPlaceholderText = () => {
    if (window.location.pathname === '/mondai') {
      return 'Ask MonDAI...';
    }
    return `Ask your ${agentType} agent...`;
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
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-center space-x-2">
        {/* Unified design for both mobile and desktop with icons inside the textarea container */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 flex items-center space-x-2">
            <ScoreTooltip type="voice">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
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
                className="h-8 w-8 p-0"
                onClick={handleAttachment}
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </ScoreTooltip>
          </div>
          
          <Textarea
            value={inputValue}
            onChange={customHandleInputChange}
            onKeyDown={handleKeyDown || defaultHandleKeyDown}
            placeholder={getPlaceholderText()}
            className="pl-24 min-h-[40px] max-h-32 flex-1 pr-3 py-2 flex items-center"
            style={{
              resize: 'none',
              paddingTop: inputValue ? '0.5rem' : '0.625rem', 
              paddingBottom: inputValue ? '0.5rem' : '0.625rem',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'center',
              overflow: 'auto',
            }}
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
