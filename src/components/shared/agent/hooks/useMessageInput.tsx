
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
        // Find the form element and trigger submit event
        const form = e.currentTarget.form;
        if (form) {
          // Create a proper form submit event
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          // Dispatch the event on the form, which will trigger the form's onSubmit handler
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
