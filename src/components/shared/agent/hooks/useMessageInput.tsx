
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
    // Submit form on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        // Create and dispatch a form submit event only once
        const form = e.currentTarget.form;
        if (form) {
          handleSubmit({
            preventDefault: () => {},
            target: form
          } as React.FormEvent);
        }
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
