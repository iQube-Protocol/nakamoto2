
import { GoogleApiLoader } from '../googleApiLoader';
import { BaseService } from './baseService';
import { DocumentLister } from './document/documentLister';
import { DocumentFetcher } from './document/documentFetcher';
import { DocumentContent } from './document/documentTypes';

/**
 * Service for Google Drive document operations
 */
export class DriveDocumentService extends BaseService {
  private googleApiLoader: GoogleApiLoader;
  private documentLister: DocumentLister;
  private documentFetcher: DocumentFetcher;
  private isAuthenticated: boolean = false;
  
  constructor(googleApiLoader: GoogleApiLoader) {
    super();
    this.googleApiLoader = googleApiLoader;
    this.documentLister = new DocumentLister(googleApiLoader);
    this.documentFetcher = new DocumentFetcher(googleApiLoader);
  }

  /**
   * Set authentication state
   */
  public setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
  }
  
  /**
   * Load document metadata from Google Drive
   */
  public async listDocuments(folderId?: string): Promise<any[]> {
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      this.showErrorToast('Not connected to Google Drive', 'Please connect to Google Drive first');
      return [];
    }
    
    return this.documentLister.listDocuments(folderId);
  }
  
  /**
   * Fetch a specific document content
   */
  public async fetchDocumentContent(documentId: string): Promise<DocumentContent | null> {
    if (!this.isAuthenticated) {
      console.error('MCP: Not authenticated with Google Drive');
      this.showErrorToast('Not connected to Google Drive', 'Please connect to Google Drive first');
      return null;
    }
    
    return this.documentFetcher.fetchDocumentContent(documentId);
  }
}
