
import { useState } from 'react';
import { useMCP } from '@/hooks/use-mcp';
import { toast } from 'sonner';

export function useDriveConnection() {
  const { driveConnected, connectToDrive, isLoading, resetDriveConnection } = useMCP();
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const handleConnect = async () => {
    const success = await connectToDrive(clientId, apiKey);
    if (success) {
      toast.success('Connected to Google Drive successfully');
    }
    return success;
  };
  
  const resetConnection = async () => {
    try {
      await resetDriveConnection();
      toast.success('Google Drive connection reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting connection:', error);
      toast.error('Failed to reset Google Drive connection');
      return false;
    }
  };
  
  return {
    driveConnected,
    isLoading,
    clientId,
    setClientId,
    apiKey,
    setApiKey,
    handleConnect,
    resetConnection
  };
}
