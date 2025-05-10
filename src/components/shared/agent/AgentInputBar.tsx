
import React from 'react';
import { Send, Mic, Paperclip, Image } from 'lucide-react';
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
  agentType: 'learn' | 'earn' | 'connect';
}

const AgentInputBar = ({
  inputValue,
  handleInputChange,
  handleSubmit,
  isProcessing,
  agentType
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

  const handleImageUpload = () => {
    toast({
      title: "Upload Image",
      description: "Image upload functionality coming soon.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-center space-x-2">
        {/* Unified design for both mobile and desktop with icons inside the textarea container */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-2 flex items-center space-x-2">
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
            
            {!isMobile && (
              <ScoreTooltip type="image">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleImageUpload}
                >
                  <Image className="h-4 w-4 text-muted-foreground" />
                </Button>
              </ScoreTooltip>
            )}
          </div>
          
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholderText()}
            className={`${isMobile ? 'pl-20' : 'pl-28'} min-h-10 max-h-32 flex-1 pr-2`}
            style={{
              resize: 'none',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
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
