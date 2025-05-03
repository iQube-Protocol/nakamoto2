
// Types for drive operations

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DriveOperationsConfig {
  apiLoader: any; // GoogleApiLoader 
  contextManager: any; // ContextManager
}

export interface DocumentExportOptions {
  mimeType: string;
  exportFormat?: string;
}
