
import { GoogleApiLoader } from './googleApiLoader';
import { DriveConnectionService } from './services/driveConnectionService';
import { DriveDocumentService } from './services/driveDocumentService';

/**
 * Facade Service for Google Drive operations
 * Coordinates between connection and document services
 */
export class DriveService {
  private googleApiLoader: GoogleApiLoader;
  private connectionService: DriveConnectionService;
  private documentService: DriveDocumentService;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    this.googleApiLoader = googleApiLoader;
    this.connectionService = new DriveConnectionService(googleApiLoader);
    this.documentService = new DriveDocumentService(googleApiLoader);
  }
  
  /**
   * Connect to Google Drive and authorize access
   */
  public async connectToDrive(clientId: string, apiKey: string, cachedToken?: string | null): Promise<boolean> {
    const success = await this.connectionService.connectToDrive(clientId, apiKey, cachedToken);
    if (success) {
      this.documentService.setAuthenticated(true);
    }
    return success;
  }
  
  /**
   * Load document metadata from Google Drive
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    return this.documentService.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document content
   */
  public async fetchDocumentContent(documentId: string): Promise<{
    content: string;
    fileName: string;
    documentType: string;
  } | null> {
    return this.documentService.fetchDocumentContent(documentId);
  }
  
  /**
   * Check if connected to Google Drive
   */
  public isConnectedToDrive(): boolean {
    return this.connectionService.isConnectedToDrive();
  }
  
  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.connectionService.setAuthenticated(authenticated);
    this.documentService.setAuthenticated(authenticated);
  }
}
