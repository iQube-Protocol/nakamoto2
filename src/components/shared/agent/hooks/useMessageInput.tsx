
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit form on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        // Create a properly typed form event
        const form = e.currentTarget.form;
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
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
