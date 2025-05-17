
/**
 * Types related to the Model Context Protocol (MCP)
 */

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
  timestamp: string; // Required timestamp field
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
  debug?: boolean; // Added debug option
}

export interface DocumentMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  content?: string; // Make content optional in metadata
}
