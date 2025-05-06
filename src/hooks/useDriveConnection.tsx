
import { useState } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

export function useDriveConnection() {
  const { driveConnected, connectToDrive, isLoading } = useMCP();
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const handleConnect = async () => {
    const success = await connectToDrive(clientId, apiKey);
    if (success) {
      return true;
    }
    return false;
  };
  
  return {
    driveConnected,
    isLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect
  };
}
