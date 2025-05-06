
import React from 'react';
import KnowledgeBase from '../KnowledgeBase';

interface KnowledgeTabProps {
  agentType: 'learn' | 'earn' | 'connect';
  isActiveTab?: boolean;
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ agentType, isActiveTab = false }) => {
  // Only render the KnowledgeBase component when the tab is active
  if (!isActiveTab) {
    return <div className="p-4 text-center text-muted-foreground">Select this tab to load knowledge base.</div>;
  }
  
  return <KnowledgeBase agentType={agentType} />;
};

export default KnowledgeTab;
