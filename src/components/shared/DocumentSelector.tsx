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
import { Loader2, FileText, FolderOpen, File, Image, Video, Headphones, FileSpreadsheet, Presentation, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
    isLoading,
    resetDriveConnection
  } = useMCP();
  
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  
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

  // Handle reconnection to Google Drive without page reload
  const handleReconnect = async () => {
    try {
      // Use the resetDriveConnection method from MCP hook
      await resetDriveConnection();
      
      // Reset connection state in local component
      setClientId('');
      setApiKey('');
      
      toast.info('Google Drive connection reset', {
        description: 'Please re-enter your credentials to reconnect'
      });
    } catch (error) {
      console.error('Error during reconnection:', error);
      toast.error('Failed to reset connection', {
        description: 'Please try again'
      });
    }
  };
  
  const handleDocumentClick = (doc: any) => {
    if (doc.mimeType.includes('folder')) {
      // Save current folder to history before navigating
      if (currentFolder) {
        // Find the current folder name from documents
        const currentFolderDoc = documents.find(d => d.id === currentFolder);
        if (currentFolderDoc) {
          setFolderHistory([...folderHistory, {
            id: currentFolder,
            name: currentFolderDoc.name
          }]);
        }
      }
      setCurrentFolder(doc.id);
    } else {
      onDocumentSelect(doc);
      setIsOpen(false);
    }
  };
  
  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Go back to the previous folder
      const newHistory = [...folderHistory];
      const lastFolder = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolder(lastFolder?.id || '');
    } else {
      // Go back to root
      setCurrentFolder('');
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (open && driveConnected) {
      listDocuments(currentFolder);
    }
  };
  
  // Get icon based on file mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <FolderOpen className="h-5 w-5 text-muted-foreground" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (mimeType.includes('audio')) {
      return <Headphones className="h-5 w-5 text-green-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="h-5 w-5 text-orange-500" />;
    } else {
      return <File className="h-5 w-5 text-muted-foreground" />;
    }
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
              <>
                {/* Breadcrumb navigation */}
                <div className="mb-4 flex items-center text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setCurrentFolder('');
                      setFolderHistory([]);
                    }}
                    disabled={!currentFolder}
                    className="flex gap-1 items-center"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Root
                  </Button>
                  
                  {folderHistory.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                      <span className="mx-1">/</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Navigate to this folder and update history
                          setCurrentFolder(folder.id);
                          setFolderHistory(folderHistory.slice(0, index));
                        }}
                      >
                        {folder.name}
                      </Button>
                    </React.Fragment>
                  ))}
                  
                  {currentFolder && !folderHistory.length && (
                    <>
                      <span className="mx-1">/</span>
                      <span className="text-muted-foreground">Current Folder</span>
                    </>
                  )}
                </div>
              
                <div className="grid grid-cols-2 gap-2">
                  {currentFolder && (
                    <Card 
                      className="p-4 cursor-pointer hover:bg-accent"
                      onClick={handleBack}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-amber-500" />
                        <span>Back</span>
                      </div>
                    </Card>
                  )}
                  
                  {documents.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      {currentFolder ? 'This folder is empty' : 'No documents found in root folder'}
                    </div>
                  )}
                  
                  {documents.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="p-4 cursor-pointer hover:bg-accent"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.mimeType)}
                        <span className="truncate text-sm">{doc.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
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
            <>
              <Button 
                variant="outline" 
                onClick={handleReconnect} 
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Connection
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                // Refresh the current folder
                listDocuments(currentFolder);
              }}>
                Refresh
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSelector;
