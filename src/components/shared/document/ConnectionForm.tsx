
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConnectionFormProps {
  clientId: string;
  setClientId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  handleConnect: () => Promise<boolean>;
  isLoading: boolean;
  disabled?: boolean;
  isApiLoading?: boolean;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  handleConnect,
  isLoading,
  disabled = false,
  isApiLoading = false
}) => {
  // Local validation
  const isValid = Boolean(clientId && apiKey);
  
  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save credentials to localStorage to ensure they're available for connection
    if (clientId) localStorage.setItem('gdrive-client-id', clientId);
    if (apiKey) localStorage.setItem('gdrive-api-key', apiKey);
    
    await handleConnect();
  };
  
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="clientId">Google OAuth Client ID</Label>
        <Input
          id="clientId"
          placeholder="Your Google OAuth Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          From your Google Cloud Console project
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiKey">Google API Key</Label>
        <Input
          id="apiKey"
          placeholder="Your Google API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isLoading}
          type="password"
          required
        />
        <p className="text-xs text-muted-foreground">
          From your Google Cloud Console project
        </p>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || disabled || !isValid || isApiLoading}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Connecting...
          </>
        ) : isApiLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Loading API...
          </>
        ) : (
          'Connect to Google Drive'
        )}
      </Button>
    </form>
  );
};

export default ConnectionForm;
