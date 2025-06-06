
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
        // Create a properly typed form event
        const form = e.currentTarget.form;
        if (form) {
          // First cast to unknown, then to React.FormEvent to satisfy TypeScript
          const syntheticEvent = {
            preventDefault: () => {},
            target: form,
            currentTarget: form,
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => {},
            stopPropagation: () => {},
            nativeEvent: e.nativeEvent,
            type: 'submit'
          } as unknown as React.FormEvent;
          
          handleSubmit(syntheticEvent);
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
