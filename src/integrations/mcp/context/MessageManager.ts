
import { MCPContext } from '../types';

/**
 * Manages message operations within the MCP context
 */
export class MessageManager {
  /**
   * Add a user message to the context
   */
  addUserMessage(context: MCPContext, message: string): MCPContext {
    context.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    return context;
  }
  
  /**
   * Add an agent response to the context
   */
  addAgentResponse(context: MCPContext, response: string): MCPContext {
    context.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });
    
    return context;
  }
}
