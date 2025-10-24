import React, { useState, useEffect, useRef } from 'react';
import SimplifiedAgentInterface from './SimplifiedAgentInterface';
import NavigationGuard from '@/utils/NavigationGuard';

interface NavigationAwareAgentInterfaceProps {
  agentType: 'learn' | 'earn' | 'connect' | 'aigent';
  title?: string;
  description?: string;
  className?: string;
}

const NavigationAwareAgentInterface: React.FC<NavigationAwareAgentInterfaceProps> = ({
  agentType,
  title,
  description,
  className
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldDefer, setShouldDefer] = useState(true);
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    NavigationGuard.init();
    
    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Progressive agent interface initialization
    const initializeAgent = () => {
      if (!mountedRef.current) return;
      
      const isNavigating = NavigationGuard.isNavigationInProgress();
      
      if (isNavigating) {
        console.log(`NavigationGuard: Deferring ${agentType} agent initialization during navigation`);
        setShouldDefer(true);
        setIsInitialized(false);
        
        // Check again after navigation might complete
        initTimeoutRef.current = setTimeout(initializeAgent, 200);
      } else {
        console.log(`NavigationGuard: Initializing ${agentType} agent interface`);
        setShouldDefer(false);
        
        // Stagger initialization to prevent resource contention
        const initDelay = agentType === 'aigent' ? 0 : 
                         agentType === 'learn' ? 100 :
                         agentType === 'earn' ? 200 : 300;
        
        initTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setIsInitialized(true);
          }
        }, initDelay);
      }
    };

    initializeAgent();
  }, [agentType]);

  // Show loading state during navigation or deferred initialization
  if (shouldDefer || !isInitialized) {
    return (
      <div className={`flex h-full items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {shouldDefer ? 'Preparing interface...' : 'Initializing agent...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <SimplifiedAgentInterface 
        agentType={agentType}
        title={title || `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`}
        description={description || `AI assistant for ${agentType} interactions`}
      />
    </div>
  );
};

export default NavigationAwareAgentInterface;