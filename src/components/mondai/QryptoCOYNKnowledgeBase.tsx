import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Users, Lightbulb, Coins, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { qryptoKB } from '@/services/qrypto-knowledge-base';
import { metaKnytsKB } from '@/services/metaknyts-knowledge-base';
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
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tokenomics':
      case 'economics':
        return <Coins className="h-4 w-4" />;
      case 'characters':
        return <Users className="h-4 w-4" />;
      case 'technology':
      case 'technical':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tokenomics':
      case 'economics':
        return 'bg-green-100/70 text-green-800 border-green-300/70';
      case 'characters':
        return 'bg-purple-100/70 text-purple-800 border-purple-300/70';
      case 'technology':
      case 'technical':
        return 'bg-blue-100/70 text-blue-800 border-blue-300/70';
      case 'worldbuilding':
        return 'bg-orange-100/70 text-orange-800 border-orange-300/70';
      case 'philosophy':
        return 'bg-indigo-100/70 text-indigo-800 border-indigo-300/70';
      case 'narrative':
        return 'bg-pink-100/70 text-pink-800 border-pink-300/70';
      case 'education':
        return 'bg-yellow-100/70 text-yellow-800 border-yellow-300/70';
      default:
        return 'bg-gray-100/70 text-gray-800 border-gray-300/70';
    }
  };
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };
  const closeDialog = () => {
    setSelectedItem(null);
  };
  const renderKnowledgeItems = (items: any[], knowledgeBase: string) => (
    <div className="space-y-4">
      {items.map(item => {
        // Truncated content for summary
        const truncatedContent = item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content;

        // Show only first 3 keywords, with +X indicator if more
        const visibleKeywords = item.keywords.slice(0, 3);
        const remainingKeywords = item.keywords.length - 3;

        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleItemClick(item)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="leading-tight text-base">{item.title}</CardTitle>
                <Badge variant="outline" className={`ml-2 rounded-md ${getCategoryColor(item.category)} flex items-center gap-1`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                <strong>Source:</strong> {item.source} | <strong>Section:</strong> {item.section}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{truncatedContent}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {visibleKeywords.map((keyword: string) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className={`text-xs rounded-md px-2 py-1 transition-colors bg-gray-500 text-white border-${knowledgeBase === (isMobile ? 'COYN' : 'QryptoCOYN') ? 'orange' : 'violet'}-300/70 hover:bg-amber-600`}
                  >
                    {keyword}
                  </Badge>
                ))}
                {remainingKeywords > 0 && (
                  <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
                    +{remainingKeywords}
                  </Badge>
                )}
              </div>
              {item.connections && item.connections.length > 0 && (
                <div className="mb-3 pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Connected to {isMobile ? 'COYN' : 'QryptoCOYN'} concepts:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.connections.slice(0, 2).map((connection: string) => (
                      <Badge 
                        key={connection} 
                        variant="outline" 
                        className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-rose-300/70 hover:bg-amber-600"
                      >
                        {connection}
                      </Badge>
                    ))}
                    {item.connections.length > 2 && (
                      <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
                        +{item.connections.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs rounded-md px-2 py-1 bg-gray-500 text-white border-gray-300/70">
                  {knowledgeBase}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-800">
                  <span className="text-xs">Read more</span>
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
  return <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search both knowledge bases..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
            <TabsTrigger value="both">Both ({bothTabCount})</TabsTrigger>
            <TabsTrigger value="qrypto">{isMobile ? 'COYN' : 'QryptoCOYN'} ({filteredQryptoItems.length})</TabsTrigger>
            <TabsTrigger value="metaknyts">{isMobile ? 'KNYT' : 'mẹtaKnyts'} ({filteredMetaKnytsItems.length})</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 pb-2">
            <TabsContent value="both" className="mt-0">
              <div className="space-y-6">
                {filteredQryptoItems.length > 0 && <div>
                    <h3 className="font-semibold mb-3 text-orange-400 text-base">{isMobile ? 'COYN' : 'QryptoCOYN'} Factual Knowledge</h3>
                    {renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN')}
                  </div>}
                {filteredMetaKnytsItems.length > 0 && <div>
                    <h3 className="font-semibold mb-3 text-violet-400 text-base">{isMobile ? 'COYN' : 'QryptoCOYN'} fictional lore: {isMobile ? 'KNYT' : 'mẹtaKnyts'}</h3>
                    {renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts')}
                  </div>}
                {filteredQryptoItems.length === 0 && filteredMetaKnytsItems.length === 0 && <p className="text-center text-gray-500 py-8">
                    No items found matching "{searchTerm}"
                  </p>}
              </div>
            </TabsContent>

            <TabsContent value="qrypto" className="mt-0">
              {filteredQryptoItems.length > 0 ? renderKnowledgeItems(filteredQryptoItems, isMobile ? 'COYN' : 'QryptoCOYN') : <p className="text-center text-gray-500 py-8">
                  {searchTerm ? `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items found matching "${searchTerm}"` : `No ${isMobile ? 'COYN' : 'QryptoCOYN'} items available`}
                </p>}
            </TabsContent>

            <TabsContent value="metaknyts" className="mt-0">
              {filteredMetaKnytsItems.length > 0 ? renderKnowledgeItems(filteredMetaKnytsItems, isMobile ? 'KNYT' : 'mẹtaKnyts') : <p className="text-center text-gray-500 py-8">
                  {searchTerm ? `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items found matching "${searchTerm}"` : `No ${isMobile ? 'KNYT' : 'mẹtaKnyts'} items available`}
                </p>}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Detailed knowledge item dialog */}
      <Dialog open={!!selectedItem} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8">{selectedItem?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Source: {selectedItem?.source} • Type: {selectedItem?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="whitespace-pre-line mb-4">
              {selectedItem?.content}
            </div>
            {selectedItem?.keywords && selectedItem.keywords.length > 0 && <div className="mb-4">
                <h4 className="font-medium mb-2">Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.keywords.map((keyword: string) => <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>)}
                </div>
              </div>}
            {selectedItem?.connections && selectedItem.connections.length > 0 && <div>
                <h4 className="font-medium mb-2">Connected Concepts:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.connections.map((connection: string) => <Badge key={connection} variant="outline" className="text-xs">
                      {connection}
                    </Badge>)}
                </div>
              </div>}
          </div>
          <div className="border-t pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={closeDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default QryptoCOYNKnowledgeBase;
