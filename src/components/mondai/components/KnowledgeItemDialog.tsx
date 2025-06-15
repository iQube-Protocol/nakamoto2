
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageContent from '@/components/shared/agent/message/MessageContent';

interface KnowledgeItemDialogProps {
  selectedItem: any;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeItemDialog = ({ selectedItem, isOpen, onClose }: KnowledgeItemDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="pr-8">{selectedItem?.title}</DialogTitle>
          <DialogDescription className="text-xs">
            Source: {selectedItem?.source} • Type: {selectedItem?.type}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 pr-6">
            {selectedItem?.content && (
              <MessageContent 
                content={selectedItem.content} 
                sender="agent" 
              />
            )}
            {selectedItem?.keywords && selectedItem.keywords.length > 0 && (
              <div className="mb-4 mt-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <h4 className="font-medium mb-2 text-blue-800">Related Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.keywords.map((keyword: string) => (
                    <Badge key={keyword} variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {selectedItem?.connections && selectedItem.connections.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <h4 className="font-medium mb-2 text-green-800">Connected Concepts:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.connections.map((connection: string) => (
                    <Badge key={connection} variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                      {connection}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t pt-2 flex justify-end flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeItemDialog;
