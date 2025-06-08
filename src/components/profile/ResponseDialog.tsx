
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResponseDialogProps {
  selectedResponse: any;
  isOpen: boolean;
  onClose: () => void;
}

const ResponseDialog = ({ selectedResponse, isOpen, onClose }: ResponseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">Historic Response</DialogTitle>
          <DialogDescription className="text-xs">
            {selectedResponse?.interaction_type} • {selectedResponse?.created_at ? new Date(selectedResponse.created_at).toLocaleString() : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedResponse?.query && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-sm">Your Question:</h4>
              <div className="p-3 rounded-lg bg-[#2d1f17]/45 text-sm">
                {selectedResponse.query}
              </div>
            </div>
          )}
          {selectedResponse?.response && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                <Badge variant="secondary" className="bg-qrypto-primary text-xs">
                  {selectedResponse.interaction_type} agent response
                </Badge>
              </h4>
              <div className="p-3 rounded-lg bg-[#23223f]/[0.32] text-sm whitespace-pre-line">
                {selectedResponse.response}
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

export default ResponseDialog;
