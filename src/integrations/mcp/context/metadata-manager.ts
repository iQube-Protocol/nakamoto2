
import { MCPContextData } from '../types';

/**
 * Manager for metadata operations in the context
 */
export class MetadataManager {
  /**
   * Set user profile in context metadata
   */
  static setUserProfile(context: MCPContextData, userProfile: Record<string, any>): void {
    context.metadata.userProfile = userProfile;
  }
  
  /**
   * Set metadata in context
   */
  static setMetadata(context: MCPContextData, metadata: Record<string, any>): void {
    context.metadata = {
      ...context.metadata,
      ...metadata
    };
  }
  
  /**
   * Update model preferences in the context
   */
  static setModelPreference(context: MCPContextData, model: string): void {
    context.metadata.modelPreference = model;
  }
  
  /**
   * Enable or disable Metis capabilities
   */
  static setMetisActive(context: MCPContextData, active: boolean): void {
    context.metadata.metisActive = active;
  }
}
