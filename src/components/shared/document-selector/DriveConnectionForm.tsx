
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface DriveConnectionFormProps {
  clientId: string;
  setClientId: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  handleConnect: () => void;
  isLoading: boolean;
}

const DriveConnectionForm: React.FC<DriveConnectionFormProps> = ({
  clientId,
  setClientId,
  apiKey,
  setApiKey,
  handleConnect,
  isLoading
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
      <Button 
        onClick={handleConnect} 
        disabled={isLoading}
        className="mt-2"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Connect to Drive
      </Button>
    </div>
  );
};

export default DriveConnectionForm;
