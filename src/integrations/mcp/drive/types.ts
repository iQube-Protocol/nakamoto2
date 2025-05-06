
import { GoogleApiLoader } from '../api/google-api-loader';
import { ContextManager } from '../context-manager';

/**
 * Configuration options for DriveOperations
 */
export interface DriveOperationsConfig {
  apiLoader: GoogleApiLoader;
  contextManager: ContextManager;
}

/**
 * Connection status for drive operations
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
