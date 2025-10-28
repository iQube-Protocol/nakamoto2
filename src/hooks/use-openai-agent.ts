import { useState, useEffect } from 'react';

const OPENAI_STORAGE_KEY = 'openai_activated';

export const useOpenAIAgent = () => {
  const [openAIActivated, setOpenAIActivated] = useState(() => {
    const stored = localStorage.getItem(OPENAI_STORAGE_KEY);
    console.log('🏗️ OpenAI Hook: Initial state from localStorage:', stored);
    
    // If no stored value exists, check if any other agent is active
    if (stored === null) {
      const veniceActive = localStorage.getItem('venice_activated') === 'true';
      const chainGPTActive = localStorage.getItem('chaingpt_activated') === 'true';
      
      // If no other agent is active, default OpenAI to true
      if (!veniceActive && !chainGPTActive) {
        localStorage.setItem(OPENAI_STORAGE_KEY, 'true');
        return true;
      }
      return false;
    }
    
    return stored === 'true';
  });

  const [openAIVisible, setOpenAIVisible] = useState(() => {
    const stored = localStorage.getItem(OPENAI_STORAGE_KEY);
    
    // If no stored value exists, check if any other agent is active
    if (stored === null) {
      const veniceActive = localStorage.getItem('venice_activated') === 'true';
      const chainGPTActive = localStorage.getItem('chaingpt_activated') === 'true';
      
      // If no other agent is active, default OpenAI to true
      if (!veniceActive && !chainGPTActive) {
        return true;
      }
      return false;
    }
    
    return stored === 'true';
  });

  const activateOpenAI = () => {
    console.log('🟢 OpenAI: Activating OpenAI agent');
    setOpenAIActivated(true);
    setOpenAIVisible(true);
    localStorage.setItem(OPENAI_STORAGE_KEY, 'true');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openAIStateChanged', { 
      detail: { activated: true, visible: true } 
    }));
  };

  const deactivateOpenAI = () => {
    console.log('🔴 OpenAI: Deactivating OpenAI agent');
    setOpenAIActivated(false);
    setOpenAIVisible(false);
    localStorage.setItem(OPENAI_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openAIStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  const hideOpenAI = () => {
    console.log('👁️ OpenAI: Hiding OpenAI agent');
    setOpenAIVisible(false);
    setOpenAIActivated(false);
    localStorage.setItem(OPENAI_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openAIStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === OPENAI_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('💾 OpenAI: Storage change detected, new value:', newValue);
        setOpenAIActivated(newValue);
        setOpenAIVisible(newValue);
      }
    };

    // Listen for custom OpenAI state changes
    const handleOpenAIStateChange = (e: CustomEvent) => {
      console.log('📡 OpenAI: Custom event received:', e.detail);
      setOpenAIActivated(e.detail.activated);
      setOpenAIVisible(e.detail.visible);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('openAIStateChanged', handleOpenAIStateChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('openAIStateChanged', handleOpenAIStateChange as EventListener);
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎯 OpenAI: State updated - activated:', openAIActivated, 'visible:', openAIVisible);
  }, [openAIActivated, openAIVisible]);

  return {
    openAIActivated,
    openAIVisible,
    activateOpenAI,
    deactivateOpenAI,
    hideOpenAI
  };
};