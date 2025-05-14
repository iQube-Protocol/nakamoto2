
import React, { useState } from 'react';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import SearchBar from './SearchBar';
import ConnectionStatus from './ConnectionStatus';
import KnowledgeHeader from './KnowledgeHeader';
import KnowledgeContent from './KnowledgeContent';
import KnowledgeDescription from './KnowledgeDescription';

interface KnowledgeBaseProps {
  agentType: 'learn' | 'earn' | 'connect';
}

const KnowledgeBase = ({ agentType }: KnowledgeBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    items,
    isLoading,
    connectionStatus,
    fetchKnowledgeItems,
    searchKnowledge,
    resetSearch
  } = useKnowledgeBase({
    limit: 8
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchKnowledge(searchQuery.trim());
    } else {
      resetSearch();
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchKnowledgeItems(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Knowledge Base</h3>
        <KnowledgeDescription agentType={agentType} />
        
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />
        
        <ConnectionStatus 
          status={connectionStatus}
        />
      </div>
      
      <KnowledgeHeader 
        searchQuery={searchQuery}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
      
      <KnowledgeContent 
        items={items}
        isLoading={isLoading}
        connectionStatus={connectionStatus}
      />
    </div>
  );
};

export default KnowledgeBase;
