
import React from 'react';
import { Send, Mic, Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import ScoreTooltip from '../ScoreTooltips';

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

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-center space-x-2">
        <ScoreTooltip type="voice">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleVoiceInput}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </ScoreTooltip>
        
        <ScoreTooltip type="attachment">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleAttachment}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </ScoreTooltip>
        
        <ScoreTooltip type="image">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleImageUpload}
          >
            <Image className="h-4 w-4" />
          </Button>
        </ScoreTooltip>
        
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
  );
};

export default AgentInputBar;
