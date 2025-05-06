
import React from 'react';
import KnowledgeBase from '../KnowledgeBase';

interface KnowledgeTabProps {
  agentType: 'learn' | 'earn' | 'connect';
  isActiveTab?: boolean;
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ agentType, isActiveTab = false }) => {
  return <KnowledgeBase agentType={agentType} />;
};

export default KnowledgeTab;
