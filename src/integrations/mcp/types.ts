
/**
 * Options for initializing the MCP client
 */
export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
  forceNewInstance?: boolean;
}

/**
 * Document metadata for MCP
 */
export interface DocumentMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

/**
 * Document in MCP context
 */
export interface DocumentInContext {
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  lastModified?: string;
}

/**
 * Message in MCP context
 */
export interface MessageInContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * MCP context structure
 */
export interface MCPContext {
  conversationId: string;
  messages: MessageInContext[];
  documentContext: DocumentInContext[];
  metadata: {
    environment?: string;
    modelPreference?: string;
    metisActive?: boolean;
    source?: string;
  };
}

/**
 * Document folder structure
 */
export interface DocumentFolder {
  id: string;
  name: string;
}
