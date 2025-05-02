
import React, { useState, useEffect } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Loader2, FileText, FolderOpen } from 'lucide-react';

interface DocumentSelectorProps {
  onDocumentSelect: (document: any) => void;
  triggerButton?: React.ReactNode;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  onDocumentSelect,
  triggerButton 
}) => {
  const { 
    driveConnected, 
    connectToDrive, 
    listDocuments, 
    documents, 
    isLoading 
  } = useMCP();
  
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  
  // Fetch documents when dialog opens or folder changes
  useEffect(() => {
    if (isOpen && driveConnected) {
      listDocuments(currentFolder);
    }
  }, [isOpen, driveConnected, currentFolder, listDocuments]);
  
  const handleConnect = async () => {
    const success = await connectToDrive(clientId, apiKey);
    if (success) {
      listDocuments();
    }
  };
  
  const handleDocumentClick = (doc: any) => {
    if (doc.mimeType.includes('folder')) {
      setCurrentFolder(doc.id);
    } else {
      onDocumentSelect(doc);
      setIsOpen(false);
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex gap-2">
            <FileText className="h-4 w-4" />
            Select Document
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select a document from Google Drive</DialogTitle>
          <DialogDescription>
            {driveConnected 
              ? "Choose a document to analyze with your agent" 
              : "Connect to Google Drive to access your documents"}
          </DialogDescription>
        </DialogHeader>
        
        {!driveConnected ? (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="client-id" className="text-sm font-medium">Google Client ID</label>
              <Input
                id="client-id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Google API Client ID"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">API Key</label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google API Key"
                type="password"
              />
            </div>
          </div>
        ) : (
          <div className="py-4 h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {currentFolder && (
                  <Card 
                    className="p-4 cursor-pointer hover:bg-accent"
                    onClick={() => setCurrentFolder('')}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <span>Back</span>
                    </div>
                  </Card>
                )}
                
                {documents.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="p-4 cursor-pointer hover:bg-accent"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="flex items-center gap-2">
                      {doc.mimeType.includes('folder') ? (
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="truncate">{doc.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {!driveConnected ? (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect to Drive
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelector;
