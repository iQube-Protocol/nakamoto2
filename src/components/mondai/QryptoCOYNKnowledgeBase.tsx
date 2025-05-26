
import React, { useState } from 'react';
import { qryptoKB } from '@/services/qrypto-knowledge-base';
import { metaKnytsKB } from '@/services/metaknyts-knowledge-base';
import KnowledgeBaseSearch from './components/KnowledgeBaseSearch';
import KnowledgeList from './components/KnowledgeList';
import KnowledgeItemDialog from './components/KnowledgeItemDialog';

const QryptoCOYNKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('both');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Get all knowledge items
  const qryptoItems = qryptoKB.getAllKnowledge();
  const metaKnytsItems = metaKnytsKB.getAllKnowledge();

  // Filter items based on search
  const filteredQryptoItems = searchTerm ? qryptoKB.searchKnowledge(searchTerm) : qryptoItems;
  const filteredMetaKnytsItems = searchTerm ? metaKnytsKB.searchKnowledge(searchTerm) : metaKnytsItems;

  // Calculate the count for the "Both" tab
  const bothTabCount = searchTerm ? filteredQryptoItems.length + filteredMetaKnytsItems.length : qryptoItems.length + metaKnytsItems.length;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const closeDialog = () => {
    setSelectedItem(null);
  };

  return (
    <div className="h-full flex flex-col">
      <KnowledgeBaseSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bothTabCount={bothTabCount}
        qryptoCount={filteredQryptoItems.length}
        metaKnytsCount={filteredMetaKnytsItems.length}
      />

      <div className="flex-1 overflow-hidden">
        <KnowledgeList
          activeTab={activeTab}
          filteredQryptoItems={filteredQryptoItems}
          filteredMetaKnytsItems={filteredMetaKnytsItems}
          searchTerm={searchTerm}
          onItemClick={handleItemClick}
        />
      </div>

      <KnowledgeItemDialog
        selectedItem={selectedItem}
        isOpen={!!selectedItem}
        onClose={closeDialog}
      />
    </div>
  );
};

export default QryptoCOYNKnowledgeBase;
