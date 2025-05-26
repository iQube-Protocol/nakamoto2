import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Users, Lightbulb, Coins } from 'lucide-react';
import { qryptoKB } from '@/services/qrypto-knowledge-base';
import { metaKnytsKB } from '@/services/metaknyts-knowledge-base';
const QryptoCOYNKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('both');

  // Get all knowledge items
  const qryptoItems = qryptoKB.getAllKnowledge();
  const metaKnytsItems = metaKnytsKB.getAllKnowledge();

  // Filter items based on search
  const filteredQryptoItems = searchTerm ? qryptoKB.searchKnowledge(searchTerm) : qryptoItems;
  const filteredMetaKnytsItems = searchTerm ? metaKnytsKB.searchKnowledge(searchTerm) : metaKnytsItems;
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
        return 'bg-green-100 text-green-800';
      case 'characters':
        return 'bg-purple-100 text-purple-800';
      case 'technology':
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'worldbuilding':
        return 'bg-orange-100 text-orange-800';
      case 'philosophy':
        return 'bg-indigo-100 text-indigo-800';
      case 'narrative':
        return 'bg-pink-100 text-pink-800';
      case 'education':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const renderKnowledgeItems = (items: any[], knowledgeBase: string) => <div className="space-y-4">
      {items.map(item => <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
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
            <p className="text-sm text-gray-600 mb-3">{item.content}</p>
            <div className="flex flex-wrap gap-1">
              {item.keywords.map((keyword: string) => <Badge key={keyword} variant="secondary" className="text-xs rounded-md px-2 py-1">
                  {keyword}
                </Badge>)}
            </div>
            {item.connections && item.connections.length > 0 && <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Connected to Qrypto COYN concepts:</p>
                <div className="flex flex-wrap gap-1">
                  {item.connections.map((connection: string) => <Badge key={connection} variant="outline" className="text-xs rounded-md px-2 py-1 bg-blue-50">
                      {connection}
                    </Badge>)}
                </div>
              </div>}
            <div className="mt-2 pt-2 border-t">
              <Badge variant="outline" className="text-xs rounded-md px-2 py-1">
                {knowledgeBase}
              </Badge>
            </div>
          </CardContent>
        </Card>)}
    </div>;
  return <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-2">Dual Knowledge Base</h2>
        <p className="text-sm text-gray-600 mb-4">Explore both QryptoCOYN factual knowledge base and fictional lore</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search both knowledge bases..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
            <TabsTrigger value="both">Both ({qryptoItems.length + metaKnytsItems.length})</TabsTrigger>
            <TabsTrigger value="qrypto">Qrypto COYN ({filteredQryptoItems.length})</TabsTrigger>
            <TabsTrigger value="metaknyts">mẹtaKnyts ({filteredMetaKnytsItems.length})</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="both" className="mt-0">
              <div className="space-y-6">
                {filteredQryptoItems.length > 0 && <div>
                    <h3 className="font-semibold mb-3 text-orange-400 text-base">QryptoCOYN Factual Knowledge</h3>
                    {renderKnowledgeItems(filteredQryptoItems, 'Qrypto COYN')}
                  </div>}
                {filteredMetaKnytsItems.length > 0 && <div>
                    <h3 className="font-semibold mb-3 text-violet-400 text-base">QryptoCOYN fictional lore: mẹtaKnyts</h3>
                    {renderKnowledgeItems(filteredMetaKnytsItems, 'mẹtaKnyts')}
                  </div>}
                {filteredQryptoItems.length === 0 && filteredMetaKnytsItems.length === 0 && <p className="text-center text-gray-500 py-8">
                    No items found matching "{searchTerm}"
                  </p>}
              </div>
            </TabsContent>

            <TabsContent value="qrypto" className="mt-0">
              {filteredQryptoItems.length > 0 ? renderKnowledgeItems(filteredQryptoItems, 'Qrypto COYN') : <p className="text-center text-gray-500 py-8">
                  {searchTerm ? `No Qrypto COYN items found matching "${searchTerm}"` : 'No Qrypto COYN items available'}
                </p>}
            </TabsContent>

            <TabsContent value="metaknyts" className="mt-0">
              {filteredMetaKnytsItems.length > 0 ? renderKnowledgeItems(filteredMetaKnytsItems, 'mẹtaKnyts') : <p className="text-center text-gray-500 py-8">
                  {searchTerm ? `No mẹtaKnyts items found matching "${searchTerm}"` : 'No mẹtaKnyts items available'}
                </p>}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>;
};
export default QryptoCOYNKnowledgeBase;