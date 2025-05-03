
import { MCPClient } from './client';

/**
 * Client options for the MCP client
 */
export interface MCPClientOptions {
  metisActive?: boolean;
}

/**
 * Context for the MCP hook
 */
export interface MCPContext {
  // Client instance
  client: MCPClient | null;
  
  // State flags
  isInitialized: boolean;
  driveConnected: boolean;
  isLoading: boolean;
  isApiLoading: boolean;
  apiLoadError: Error | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // Connection methods
  getConnectionStatus: () => 'disconnected' | 'connecting' | 'connected' | 'error';
  connectToDrive: (clientId: string, apiKey: string, cachedToken?: string | null) => Promise<boolean>;
  resetDriveConnection: () => void;
  checkApiStatus: () => Promise<boolean>;
  
  // Drive operations
  listDocuments: (folderId?: string) => Promise<any[]>;
  fetchDocument: (documentId: string) => Promise<string | null>;
  forceRefreshDocuments: () => Promise<void>;
  documents: any[];
  
  // Context operations
  initializeContext: (existingConversationId?: string) => Promise<string | null>;
  getDocumentsInContext: (conversationId?: string) => Promise<any[]>;
  addDocumentToContext: (conversationId: string, document: any, documentType?: string, content?: string) => Promise<boolean>;
  removeDocumentFromContext: (conversationId: string, documentId: string) => Promise<boolean>;
}

/**
 * Structure of the context data
 */
export interface MCPContextData {
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  metadata: {
    environment?: string;
    modelPreference?: string;
    metisActive?: boolean;
    source?: string;
    [key: string]: any;
  };
  documentContext?: Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    lastModified?: string;
  }>;
  userProfile?: Record<string, any>;
}
