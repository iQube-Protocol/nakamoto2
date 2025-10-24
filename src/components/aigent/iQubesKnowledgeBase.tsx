
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { iQubesKB } from '@/services/iqubes-knowledge-base';
import { coynKB } from '@/services/coyn-knowledge-base';
import KnowledgeBaseSearch from './components/KnowledgeBaseSearch';
import KnowledgeList from './components/KnowledgeList';
import KnowledgeItemDialog from './components/KnowledgeItemDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const iQubesKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('both');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isMobile = useIsMobile();

  // Get all knowledge items
  const iQubesItems = iQubesKB.getAllKnowledge();
  const coynItems = coynKB.getAllKnowledge();

  // Filter items based on search
  const filteredIQubesItems = searchTerm ? iQubesKB.searchKnowledge(searchTerm) : iQubesItems;
  const filteredCOYNItems = searchTerm ? coynKB.searchKnowledge(searchTerm) : coynItems;

  // Calculate the count for the "Both" tab
  const bothTabCount = searchTerm ? filteredIQubesItems.length + filteredCOYNItems.length : iQubesItems.length + coynItems.length;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const closeDialog = () => {
    setSelectedItem(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <KnowledgeBaseSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
          <TabsTrigger value="both">Both ({bothTabCount})</TabsTrigger>
          <TabsTrigger value="iqubes">{isMobile ? 'iQubes' : 'iQubes'} ({filteredIQubesItems.length})</TabsTrigger>
          <TabsTrigger value="coyn">{isMobile ? 'COYN' : 'COYN'} ({filteredCOYNItems.length})</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="both" className="mt-0 h-full overflow-hidden">
            <KnowledgeList
              filteredQryptoItems={filteredIQubesItems}
              filteredMetaKnytsItems={filteredCOYNItems}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              showBothSections={true}
            />
          </TabsContent>

          <TabsContent value="iqubes" className="mt-0 h-full overflow-hidden">
            <KnowledgeList
              filteredQryptoItems={filteredIQubesItems}
              filteredMetaKnytsItems={[]}
              searchTerm={searchTerm}
              onItemClick={handleItemClick}
              showBothSections={false}
            />
          </TabsContent>

          <TabsContent value="coyn" className="mt-0 h-full overflow-hidden">
            <KnowledgeList
              filteredQryptoItems={[]}
              filteredMetaKnytsItems={filteredCOYNItems}
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

export default iQubesKnowledgeBase;
