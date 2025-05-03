
import { MCPContext } from '../types';
import { MCPClientBase } from './client-base';
import axios from 'axios';

/**
 * API operations for communicating with the MCP server
 */
export class ApiOperations extends MCPClientBase {
  // Add axiosInstance property
  protected axiosInstance = axios.create({
    baseURL: 'https://api.example.com', // Replace with actual API URL when available
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  /**
   * Submit the current context to the MCP server
   */
  async submitContext(context?: MCPContext): Promise<any> {
    try {
      const contextToSubmit = context || this.contextManager.getContext();
      console.log('Submitting context to MCP server:', contextToSubmit);
      
      const response = await this.axiosInstance.post('/context', contextToSubmit);
      console.log('Context submission successful', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit context to MCP server:', error.message, error.response?.data);
      throw error;
    }
  }
  
  /**
   * Submit a query to the MCP server
   */
  async submitQuery(query: string, context?: MCPContext): Promise<any> {
    try {
      const contextToSubmit = context || this.contextManager.getContext();
      console.log('Submitting query to MCP server:', query, contextToSubmit);
      
      const response = await this.axiosInstance.post('/query', {
        query: query,
        context: contextToSubmit
      });
      
      console.log('Query submission successful', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit query to MCP server:', error.message, error.response?.data);
      throw error;
    }
  }
}
