
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { qryptoKB, QryptoKnowledgeItem } from '@/services/qrypto-knowledge-base';

const QryptoCOYNKnowledgeBase: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<QryptoKnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all Qrypto COYN knowledge items
  const allItems = qryptoKB.getAllKnowledge();
  
  // Filter items based on search query
  const filteredItems = searchQuery 
    ? qryptoKB.searchKnowledge(searchQuery)
    : allItems;
  
  const handleItemClick = (item: QryptoKnowledgeItem) => {
    setSelectedItem(item);
  };
  
  const closeDialog = () => {
    setSelectedItem(null);
  };

  const getCategoryColor = (category: QryptoKnowledgeItem['category']) => {
    const colors = {
      'tokenomics': 'bg-blue-100 text-blue-800',
      'protocols': 'bg-green-100 text-green-800',
      'consensus': 'bg-purple-100 text-purple-800',
      'economics': 'bg-yellow-100 text-yellow-800',
      'mechanics': 'bg-orange-100 text-orange-800',
      'technical': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="flex flex-col h-[400px] overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Qrypto COYN Knowledge Base</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{filteredItems.length} items</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-qrypto-primary/50"
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? 'No matching knowledge items found.' : 'No knowledge base resources available.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 border rounded-md hover:bg-qrypto-accent/20 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {item.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                        {item.keywords.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{item.keywords.length - 3} more</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <span className="text-xs">Read more</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Detailed knowledge item dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8 flex items-center gap-2">
              {selectedItem?.title}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedItem ? getCategoryColor(selectedItem.category) : ''}`}>
                {selectedItem?.category}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Source: {selectedItem?.source} • Section: {selectedItem?.section}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="p-4 whitespace-pre-line text-sm leading-relaxed">
              {selectedItem?.content}
            </div>
            {selectedItem?.keywords && (
              <div className="p-4 border-t">
                <h4 className="text-sm font-medium mb-2">Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-qrypto-accent/20 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="border-t pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={closeDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QryptoCOYNKnowledgeBase;
