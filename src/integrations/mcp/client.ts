
import { MCPClientOptions } from './types';
import { DriveClientExtension } from './client/drive-client-extension';
import { ApiOperations } from './client/api-operations';
import { ContextOperations } from './client/context-operations';

/**
 * Main class for interacting with the MCP (Meta-Contextual Processor) server
 * Combines API, Context, and Drive operations
 */
export class MCPClient extends DriveClientExtension {
  constructor(options: MCPClientOptions = {}) {
    super(options);
    
    // Initialize Drive operations (conditionally after API is loaded)
    this.initializeDriveOperations();
  }
}

/**
 * Create a new MCP client
 */
export function getMCPClient(options: MCPClientOptions = {}): MCPClient {
  try {
    // Use a singleton pattern to prevent multiple instances
    if (typeof window !== 'undefined') {
      if (!(window as any).__mcpClient) {
        (window as any).__mcpClient = new MCPClient(options);
      }
      return (window as any).__mcpClient;
    }
    
    // Fallback to creating a new instance if window is not available
    return new MCPClient(options);
  } catch (error) {
    console.error('Error creating MCP client:', error);
    throw error;
  }
}

// Export types
export type { MCPClientOptions } from './types';
