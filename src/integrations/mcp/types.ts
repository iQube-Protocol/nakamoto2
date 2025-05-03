
/**
 * MCP Types and Interfaces
 */

// Define interfaces for our MCP client
export interface MCPContext {
  conversationId: string;
  documentContext?: {
    documentId: string;
    documentName: string;
    documentType: string;
    content: string;
    summary?: string;
    lastModified?: string;
  }[];
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  metadata: {
    userProfile?: Record<string, any>;
    environment?: string;
    modelPreference?: string;
    source?: 'google-drive' | 'local' | 'other';
    metisActive?: boolean;
  };
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
  debug?: boolean;
  apiLoadTimeout?: number;
  onApiLoadStart?: () => void;
  onApiLoadComplete?: () => void;
}
