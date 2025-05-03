
import axios, { AxiosInstance } from 'axios';
import { GoogleApiLoader } from '../api/google-api-loader';
import { ContextManager } from '../context-manager';
import { MCPClientOptions, MCPContext } from '../types';

/**
 * Base client class with core functionality
 */
export class MCPClientBase {
  protected serverUrl: string;
  protected authToken: string | null;
  protected axiosInstance: AxiosInstance;
  protected apiLoader: GoogleApiLoader;
  protected contextManager: ContextManager;
  protected metisActive: boolean;
  protected options: MCPClientOptions;
  
  constructor(options: MCPClientOptions = {}) {
    this.serverUrl = options.serverUrl || process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000';
    this.authToken = options.authToken || process.env.NEXT_PUBLIC_MCP_AUTH_TOKEN || null;
    this.metisActive = options.metisActive !== undefined ? options.metisActive : localStorage.getItem('metisActive') === 'true';
    this.options = options;
    
    // Initialize Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.serverUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      },
    });
    
    // Initialize Google API loader
    this.apiLoader = new GoogleApiLoader({
      onApiLoadStart: options.onApiLoadStart,
      onApiLoadComplete: options.onApiLoadComplete
    });
    
    // Initialize context manager
    this.contextManager = new ContextManager(this.metisActive);
  }
  
  /**
   * Get the current metisActive status
   */
  getMetisActive(): boolean {
    return this.metisActive;
  }
  
  /**
   * Set metisActive status
   */
  setMetisActive(value: boolean): void {
    this.metisActive = value;
    localStorage.setItem('metisActive', value.toString());
    this.contextManager.setMetadata({ metisActive: value });
  }
  
  /**
   * Check if the Google API is loaded
   */
  isApiLoaded(): boolean {
    return this.apiLoader.isLoaded();
  }
  
  /**
   * Get the GAPI client
   */
  getGapiClient(): any {
    return this.apiLoader.getGapiClient();
  }
}
