import React, { useState, useEffect } from 'react';
import KnowledgeBase from '../KnowledgeBase';

interface KnowledgeTabProps {
  agentType: 'learn' | 'earn' | 'connect';
  isActiveTab?: boolean;
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ agentType, isActiveTab = false }) => {
  // Use state to track if the component has been loaded yet
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Set loaded state when tab becomes active
  useEffect(() => {
    if (isActiveTab && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isActiveTab, hasLoaded]);
  
  // If tab is not active and hasn't been loaded yet, return placeholder
  if (!isActiveTab && !hasLoaded) {
    return <div className="p-4 text-center text-muted-foreground">Select this tab to load knowledge base.</div>;
  }
  
  // If tab is not currently active but has been loaded before, return hidden content
  if (!isActiveTab && hasLoaded) {
    return <div className="hidden"><KnowledgeBase agentType={agentType} /></div>;
  }
  
  // Otherwise render the KnowledgeBase component
  return <KnowledgeBase agentType={agentType} />;
};

export default KnowledgeTab;
