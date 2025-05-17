/**
 * Types related to the Model Context Protocol (MCP)
 */

export interface MCPDocumentContext {
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  summary?: string;
  lastModified?: string;
  metadata?: {
    originalLength?: number;
    addedTimestamp?: string;
    recoveryTimestamp?: string;
    [key: string]: any;
  };
}

export interface MCPContextMetadata {
  userProfile?: Record<string, any>;
  environment?: string;
  modelPreference?: string;
  source?: 'google-drive' | 'local' | 'other';
  metisActive?: boolean;
  contextVersion?: string;
}

export interface MCPContext {
  conversationId: string;
  messages: MCPMessage[];
  documentContext?: MCPDocumentContext[];
  metadata: MCPContextMetadata;
}

export interface MCPMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface MCPClientOptions {
  serverUrl?: string;
  authToken?: string;
  metisActive?: boolean;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}
