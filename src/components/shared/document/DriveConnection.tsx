
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useDriveConnection } from '@/hooks/useDriveConnection';

const DriveConnection: React.FC = () => {
  const {
    driveConnected,
    isLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  } = useDriveConnection();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Drive Connection</CardTitle>
        <CardDescription>
          Connect to Google Drive to add documents to your AI conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {driveConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <Check className="h-5 w-5" />
              <span>Connected to Google Drive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can now select documents from your Google Drive to include in your AI conversations.
            </p>
            <Button onClick={resetConnection} variant="outline">
              Reset Connection
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5" />
              <span>Not connected to Google Drive</span>
            </div>
            
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
                type="password"
                placeholder="Enter your Google API Key"
              />
            </div>
            
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect to Google Drive
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Note: You'll need to enable the Google Drive API in Google Cloud Console and create OAuth credentials.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriveConnection;
