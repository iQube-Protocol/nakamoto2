
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import KnowledgeItem from './KnowledgeItem';
import { useIsMobile } from '@/hooks/use-mobile';

interface KnowledgeListProps {
  activeTab: string;
  filteredQryptoItems: any[];
  filteredMetaKnytsItems: any[];
  searchTerm: string;
  onItemClick: (item: any) => void;
}

const KnowledgeList = ({ 
  activeTab,
  filteredQryptoItems, 
  filteredMetaKnytsItems, 
  searchTerm, 
  onItemClick 
}: KnowledgeListProps) => {
  const isMobile = useIsMobile();

  const renderKnowledgeItems = (items: any[], knowledgeBase: string) => (
    <div className="space-y-4">
      {items.map(item => (
        <KnowledgeItem 
          key={item.id} 
          item={item} 
          knowledgeBase={knowledgeBase} 
          onItemClick={onItemClick} 
        />
      ))}
    </div>
  );

  return (
    <Tabs value={activeTab} className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        <TabsContent value="both" className="mt-0">
          <div className="space-y-6">
            {filteredQryptoItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-orange-400 text-base">{isMobile ? 'COYN' : 'QryptoCOYN'} Factual Knowledge</h3>
                {renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN')}
              </div>
            )}
            {filteredMetaKnytsItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-violet-400 text-base">{isMobile ? 'COYN' : 'QryptoCOYN'} fictional lore: {isMobile ? 'KNYT' : 'mẹtaKnyts'}</h3>
                {renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts')}
              </div>
            )}
            {filteredQryptoItems.length === 0 && filteredMetaKnytsItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No items found matching "{searchTerm}"
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="qrypto" className="mt-0">
          {filteredQryptoItems.length > 0 ? (
            renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN')
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items found matching "${searchTerm}"` : `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items available`}
            </p>
          )}
        </TabsContent>

        <TabsContent value="metaknyts" className="mt-0">
          {filteredMetaKnytsItems.length > 0 ? (
            renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts')
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items found matching "${searchTerm}"` : `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items available`}
            </p>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default KnowledgeList;
