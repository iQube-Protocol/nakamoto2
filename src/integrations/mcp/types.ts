
/**
 * MCP Context types for document management and conversation state
 */

export interface MCPDocument {
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  summary?: string;
  lastModified?: string;
}

export interface MCPMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface MCPMetadata {
  userProfile?: Record<string, any>;
  environment?: string;
  modelPreference?: string;
  source?: 'google-drive' | 'local' | 'other';
  metisActive?: boolean;
}

export interface MCPContext {
  conversationId: string;
  documentContext?: MCPDocument[];
  messages: MCPMessage[];
  metadata: MCPMetadata;
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
}
