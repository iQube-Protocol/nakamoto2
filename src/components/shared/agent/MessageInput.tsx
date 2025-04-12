
import React from 'react';
import { Send, Mic, Paperclip, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  inputValue: string;
  isProcessing: boolean;
  agentType: 'learn' | 'earn' | 'connect';
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleVoiceInput: () => void;
  handleAttachment: () => void;
  handleImageUpload: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  isProcessing,
  agentType,
  handleInputChange,
  handleSubmit,
  handleVoiceInput,
  handleAttachment,
  handleImageUpload,
}) => {
  return (
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
  );
};

export default MessageInput;
