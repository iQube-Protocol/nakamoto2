
import { GoogleApiLoader } from './api/google-api-loader';
import { ContextManager } from './context-manager';

/**
 * Options for creating an MCP client
 */
export interface MCPClientOptions {
  metisActive?: boolean;
  debug?: boolean;
  apiLoadTimeout?: number;
  onApiLoadStart?: () => void;
  onApiLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Internal context data structure
 */
export interface MCPContextData {
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  metadata: {
    environment: string;
    modelPreference?: string;
    metisActive?: boolean;
    source?: string;
    userProfile?: Record<string, any>;
    [key: string]: any;
  };
  documentContext?: Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    lastModified?: string;
  }>;
}

/**
 * Context for MCP operations
 */
export interface MCPContext {
  client: any;
  isInitialized: boolean;
  driveConnected: boolean;
  isLoading: boolean;
  isApiLoading: boolean;
  apiLoadError: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  getConnectionStatus: () => 'disconnected' | 'connecting' | 'connected' | 'error';
  connectToDrive: (clientId: string, apiKey: string) => Promise<boolean>;
  resetDriveConnection: () => void;
  checkApiStatus: () => boolean;
  listDocuments: (folderId?: string) => Promise<any[]>;
  fetchDocument: (documentId: string) => Promise<string | null>;
  forceRefreshDocuments: (folderId?: string) => Promise<any[]>;
  initializeContext: (existingConversationId?: string) => Promise<string>;
  getDocumentsInContext: (conversationId?: string) => Promise<any[]>;
  addDocumentToContext: (conversationId: string, document: any, documentType?: string, content?: string) => Promise<boolean>;
  removeDocumentFromContext: (conversationId: string, documentId: string) => Promise<boolean>;
  documents: any[];
}
