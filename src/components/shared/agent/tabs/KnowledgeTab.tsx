
import React from 'react';
import KnowledgeBase from '../KnowledgeBase';

interface KnowledgeTabProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ agentType }) => {
  return <KnowledgeBase agentType={agentType} />;
};

export default KnowledgeTab;
