
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
  const isButtonDisabled = disabled || isLoading || isApiLoading || !clientId || !apiKey;
  const getButtonText = () => {
    if (disabled) return 'Waiting for Google API...';
    if (isApiLoading) return 'Loading Google API...';
    if (isLoading) return 'Connecting...';
    return 'Connect to Drive';
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <label htmlFor="client-id" className="text-sm font-medium">Google Client ID</label>
        <Input
          id="client-id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Enter your Google API Client ID"
          disabled={disabled || isLoading || isApiLoading}
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
          disabled={disabled || isLoading || isApiLoading}
        />
      </div>
      <Button 
        onClick={handleConnect} 
        disabled={isButtonDisabled}
        className="mt-2"
      >
        {(isLoading || isApiLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>
      {(disabled || isApiLoading) && (
        <p className="text-xs text-muted-foreground">
          Please wait while we load the Google API. This may take a few moments.
        </p>
      )}
    </div>
  );
};

export default ConnectionForm;
