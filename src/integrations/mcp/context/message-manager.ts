
import { MCPContextData } from '../types';

/**
 * Manager for message operations in the context
 */
export class MessageManager {
  /**
   * Add a message to the context
   */
  static addMessage(context: MCPContextData, role: string, content: string): void {
    context.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Add a user message to the context
   */
  static addUserMessage(context: MCPContextData, message: string): void {
    this.addMessage(context, 'user', message);
  }
  
  /**
   * Add an agent response to the context
   */
  static addAgentResponse(context: MCPContextData, response: string): void {
    this.addMessage(context, 'assistant', response);
  }
  
  /**
   * Clear all messages from context
   */
  static clearMessages(context: MCPContextData): boolean {
    if (context.messages.length === 0) {
      return false;
    }
    
    context.messages = [];
    return true;
  }
}
