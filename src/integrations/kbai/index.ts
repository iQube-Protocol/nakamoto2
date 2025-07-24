
// Export common types
export interface KBAIKnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  relevance: number;
  timestamp: string;  // Making timestamp required for consistency
}

export interface KBAIQueryOptions {
  query?: string;
  category?: string;
  limit?: number;
  includeMetadata?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Export service classes
export { KBAIDirectService, getKBAIDirectService } from './KBAIDirectService';
export { KBAIMCPService, getKBAIService } from './KBAIMCPService';
