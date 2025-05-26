
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KnowledgeItemDialogProps {
  selectedItem: any;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeItemDialog = ({ selectedItem, isOpen, onClose }: KnowledgeItemDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
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
          {selectedItem?.keywords && selectedItem.keywords.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Keywords:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedItem.keywords.map((keyword: string) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {selectedItem?.connections && selectedItem.connections.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Connected Concepts:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedItem.connections.map((connection: string) => (
                  <Badge key={connection} variant="outline" className="text-xs">
                    {connection}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeItemDialog;
