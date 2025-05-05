
/**
 * Google Drive API integration for MCP client
 */
import { toast } from 'sonner';
import { getExportMimeType, getDocumentType } from './utils';

/**
 * Connect to Google Drive and authorize access
 */
export const connectToDrive = async (
  clientId: string, 
  apiKey: string, 
  gapi: any, 
  setTokenClient: (client: any) => void,
  setIsAuthenticated: (value: boolean) => void
): Promise<boolean> => {
  console.log('MCP: Connecting to Google Drive with credentials:', { clientId, apiKeyLength: apiKey?.length });

  try {
    // Initialize the Google API client with provided credentials
    await gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    
    // Create token client for OAuth 2.0 flow
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          setIsAuthenticated(true);
          localStorage.setItem('gdrive-connected', 'true');
          toast.success('Connected to Google Drive', {
            description: 'Your Google Drive documents are now available to the AI agents'
          });
          console.log('Successfully authenticated with Google Drive');
        }
      },
    });
    
    setTokenClient(tokenClient);
    
    // Request access token
    tokenClient.requestAccessToken();
    
    return true;
  } catch (error) {
    console.error('MCP: Error connecting to Google Drive:', error);
    toast.error('Google Drive connection failed', { 
      description: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
};

/**
 * Load document metadata from Google Drive
 */
export const listDocuments = async (
  gapi: any, 
  isAuthenticated: boolean, 
  folderId?: string
): Promise<any[]> => {
  console.log(`MCP: Listing documents${folderId ? ' in folder ' + folderId : ''}`);
  
  if (!isAuthenticated) {
    console.error('MCP: Not authenticated with Google Drive');
    toast.error('Not connected to Google Drive', { 
      description: 'Please connect to Google Drive first' 
    });
    return [];
  }
  
  try {
    const query = folderId ? 
      `'${folderId}' in parents and trashed = false` : 
      `'root' in parents and trashed = false`;
    
    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 50
    });
    
    const files = response.result.files;
    console.log(`MCP: Found ${files.length} files in Google Drive`, files);
    return files;
  } catch (error) {
    console.error('MCP: Error listing documents from Google Drive:', error);
    toast.error('Failed to list documents', { 
      description: error instanceof Error ? error.message : 'Unknown error' 
    });
    return [];
  }
};

/**
 * Fetch document content from Google Drive
 */
export const fetchDocumentContent = async (
  documentId: string,
  gapi: any,
  isAuthenticated: boolean,
  updateContext: (docData: {
    documentId: string,
    documentName: string,
    documentType: string,
    content: string
  }) => void
): Promise<string | null> => {
  console.log(`MCP: Fetching document content for ${documentId}`);
  
  if (!isAuthenticated) {
    console.error('MCP: Not authenticated with Google Drive');
    toast.error('Not connected to Google Drive', { 
      description: 'Please connect to Google Drive first' 
    });
    return null;
  }
  
  try {
    // First get the file metadata
    const fileMetadata = await gapi.client.drive.files.get({
      fileId: documentId,
      fields: 'name,mimeType'
    });
    
    const fileName = fileMetadata.result.name;
    const mimeType = fileMetadata.result.mimeType;
    
    // Handle different file types
    let documentContent = '';
    
    // For Google Docs, Sheets, and Slides, we need to export them in a readable format
    if (mimeType.includes('google-apps')) {
      const exportMimeType = getExportMimeType(mimeType);
      const exportResponse = await gapi.client.drive.files.export({
        fileId: documentId,
        mimeType: exportMimeType
      });
      
      documentContent = exportResponse.body;
    } else {
      // For other file types, use the files.get method with alt=media
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${documentId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${gapi.auth.getToken().access_token}`
          }
        }
      );
      
      // Check if response is ok and get content
      if (response.ok) {
        // For text-based files
        if (mimeType.includes('text') || mimeType.includes('json') || 
            mimeType.includes('javascript') || mimeType.includes('xml') ||
            mimeType.includes('html') || mimeType.includes('css')) {
          documentContent = await response.text();
        } else {
          // For binary files, we can only provide basic info
          documentContent = `This file (${fileName}) is a binary file of type ${mimeType} and cannot be displayed as text.`;
        }
      } else {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }
    }
    
    // Extract document type from mimeType
    const documentType = getDocumentType(mimeType);
    
    // Call the callback to update the context
    updateContext({
      documentId,
      documentName: fileName,
      documentType,
      content: documentContent
    });
    
    return documentContent;
  } catch (error) {
    console.error(`MCP: Error fetching document ${documentId}:`, error);
    toast.error('Failed to fetch document', { 
      description: error instanceof Error ? error.message : 'Unknown error' 
    });
    return null;
  }
};
