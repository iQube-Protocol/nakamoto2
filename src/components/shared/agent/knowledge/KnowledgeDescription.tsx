
import React from 'react';

interface KnowledgeDescriptionProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeDescription = ({ agentType }: KnowledgeDescriptionProps) => {
  const getDescription = () => {
    switch(agentType) {
      case 'learn':
        return 'web3 education';
      case 'earn':
        return 'MonDAI tokens';
      case 'connect':
        return 'community connections';
      default:
        return 'relevant information';
    }
  };

  return (
    <p className="text-sm text-muted-foreground">
      Access specialized information related to {getDescription()}.
    </p>
  );
};

export default KnowledgeDescription;
