
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { qryptoKB } from '@/services/qrypto-knowledge-base';
import { metaKnytsKB } from '@/services/metaknyts-knowledge-base';
import KnowledgeBaseSearch from './components/KnowledgeBaseSearch';
import KnowledgeList from './components/KnowledgeList';
import KnowledgeItemDialog from './components/KnowledgeItemDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const QryptoCOYNKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('both');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isMobile = useIsMobile();

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
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
          <TabsTrigger value="both">Both ({bothTabCount})</TabsTrigger>
          <TabsTrigger value="qrypto">{isMobile ? 'COYN' : 'QryptoCOYN'} ({filteredQryptoItems.length})</TabsTrigger>
          <TabsTrigger value="metaknyts">{isMobile ? 'KNYT' : 'mẹtaKnyts'} ({filteredMetaKnytsItems.length})</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="both" className="mt-0 h-full">
            <KnowledgeList
              filteredQryptoItems={filteredQryptoItems}
              filteredMetaKnytsItems={filteredMetaKnytsItems}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              showBothSections={true}
            />
          </TabsContent>

          <TabsContent value="qrypto" className="mt-0 h-full">
            <KnowledgeList
              filteredQryptoItems={filteredQryptoItems}
              filteredMetaKnytsItems={[]}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              showBothSections={false}
            />
          </TabsContent>

          <TabsContent value="metaknyts" className="mt-0 h-full">
            <KnowledgeList
              filteredQryptoItems={[]}
              filteredMetaKnytsItems={filteredMetaKnytsItems}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              showBothSections={false}
            />
          </TabsContent>
        </div>
      </Tabs>

      <KnowledgeItemDialog
        selectedItem={selectedItem}
        isOpen={!!selectedItem}
        onClose={closeDialog}
      />
    </div>
  );
};

export default QryptoCOYNKnowledgeBase;
