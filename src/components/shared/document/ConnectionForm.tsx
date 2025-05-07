
import React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionFormProps {
  clientId: string;
  setClientId: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  handleConnect: () => Promise<boolean>;
  isLoading: boolean;
  disabled?: boolean;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  handleConnect,
  isLoading,
  disabled = false
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <label htmlFor="client-id" className="text-sm font-medium">Google Client ID</label>
        <Input
          id="client-id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Enter your Google API Client ID"
          disabled={disabled || isLoading}
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
          disabled={disabled || isLoading}
        />
      </div>
      <Button 
        onClick={handleConnect} 
        disabled={disabled || isLoading || !clientId || !apiKey} 
        className="mt-2"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {disabled ? 'Waiting for Google API...' : 'Connect to Drive'}
      </Button>
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Please wait while we load the Google API. This may take a few moments.
        </p>
      )}
    </div>
  );
};

export default ConnectionForm;
