
/**
 * Types for Drive Connection functionality
 */

export interface DriveConnectionState {
  clientId: string;
  apiKey: string;
  connectionInProgress: boolean;
  connectionAttempts: number;
  connectionTimeout: NodeJS.Timeout | null;
  apiErrorCount: number;
  lastConnectionResult: boolean | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface DriveConnectionActions {
  setClientId: (id: string) => void;
  setApiKey: (key: string) => void;
  handleConnect: () => Promise<boolean>;
  resetConnection: () => void;
}

export type DriveConnectionHook = DriveConnectionState & DriveConnectionActions & {
  driveConnected: boolean;
  isLoading: boolean;
  isApiLoading: boolean;
};
