import { useState, useEffect } from 'react';

const CHAINGPT_STORAGE_KEY = 'chaingpt_activated';

export const useChainGPTAgent = () => {
  const [chainGPTActivated, setChainGPTActivated] = useState(() => {
    const stored = localStorage.getItem(CHAINGPT_STORAGE_KEY);
    console.log('🏗️ ChainGPT Hook: Initial state from localStorage:', stored);
    return stored === 'true';
  });

  const [chainGPTVisible, setChainGPTVisible] = useState(() => {
    const stored = localStorage.getItem(CHAINGPT_STORAGE_KEY);
    return stored === 'true';
  });

  const activateChainGPT = () => {
    console.log('🟢 ChainGPT: Activating ChainGPT agent');
    setChainGPTActivated(true);
    setChainGPTVisible(true);
    localStorage.setItem(CHAINGPT_STORAGE_KEY, 'true');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('chainGPTStateChanged', { 
      detail: { activated: true, visible: true } 
    }));
  };

  const deactivateChainGPT = () => {
    console.log('🔴 ChainGPT: Deactivating ChainGPT agent');
    setChainGPTActivated(false);
    setChainGPTVisible(false);
    localStorage.setItem(CHAINGPT_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('chainGPTStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  const hideChainGPT = () => {
    console.log('👁️ ChainGPT: Hiding ChainGPT agent');
    setChainGPTVisible(false);
    setChainGPTActivated(false);
    localStorage.setItem(CHAINGPT_STORAGE_KEY, 'false');
    
    // Force a state update by dispatching a custom event
    window.dispatchEvent(new CustomEvent('chainGPTStateChanged', { 
      detail: { activated: false, visible: false } 
    }));
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAINGPT_STORAGE_KEY) {
        const newValue = e.newValue === 'true';
        console.log('💾 ChainGPT: Storage change detected, new value:', newValue);
        setChainGPTActivated(newValue);
        setChainGPTVisible(newValue);
      }
    };

    // Listen for custom ChainGPT state changes
    const handleChainGPTStateChange = (e: CustomEvent) => {
      console.log('📡 ChainGPT: Custom event received:', e.detail);
      setChainGPTActivated(e.detail.activated);
      setChainGPTVisible(e.detail.visible);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chainGPTStateChanged', handleChainGPTStateChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chainGPTStateChanged', handleChainGPTStateChange as EventListener);
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎯 ChainGPT: State updated - activated:', chainGPTActivated, 'visible:', chainGPTVisible);
  }, [chainGPTActivated, chainGPTVisible]);

  return {
    chainGPTActivated,
    chainGPTVisible,
    activateChainGPT,
    deactivateChainGPT,
    hideChainGPT
  };
};