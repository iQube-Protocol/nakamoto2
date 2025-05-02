
import { DriveConnectionManager } from './authentication/driveConnectionManager';
import { GoogleApiLoader } from '../googleApiLoader';
import { BaseService } from './baseService';

/**
 * Service for Google Drive connection and authentication
 */
export class DriveConnectionService extends BaseService {
  private connectionManager: DriveConnectionManager;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    super();
    this.connectionManager = new DriveConnectionManager(googleApiLoader);
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    return this.connectionManager.connectToDrive(clientId, apiKey, cachedToken);
  }

  /**
   * Check if connected to Google Drive
   */
  public isConnectedToDrive(): boolean {
    return this.connectionManager.isConnectedToDrive();
  }
  
  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.connectionManager.setAuthenticated(authenticated);
  }
}
