
import { useState, KeyboardEvent } from 'react';

/**
 * Hook to manage message input state and changes
 */
export const useMessageInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, handleSubmit: (e: React.FormEvent) => void) => {
    // Improved mobile keyboard handling
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        // Create a synthetic form event
        const syntheticEvent = {
          preventDefault: () => {},
          currentTarget: e.currentTarget.form,
          target: e.currentTarget.form,
        } as React.FormEvent;
        handleSubmit(syntheticEvent);
      }
    }
  };
  
  return {
    inputValue,
    setInputValue,
    isProcessing, 
    setIsProcessing,
    handleInputChange,
    handleKeyDown
  };
};
