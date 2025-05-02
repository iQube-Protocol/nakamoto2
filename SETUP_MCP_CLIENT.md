
# Model Context Protocol (MCP) Client Setup

This document outlines the implementation of the Model Context Protocol client in this application, which allows the AI agents to analyze documents from Google Drive.

## Components

1. **MCP Client (`src/integrations/mcp/client.ts`)**
   - Core MCP client implementation
   - Context management for conversations
   - Document fetching and storage
   - Google Drive API integration

2. **MCP Hook (`src/hooks/use-mcp.ts`)**
   - React hook for accessing MCP functionality
   - Methods for connecting to Google Drive
   - Methods for listing and fetching documents

3. **Document UI Components**
   - `DocumentSelector.tsx` - UI for selecting documents from Google Drive
   - `DocumentContext.tsx` - UI for managing documents in the context

4. **Agent Integration**
   - Modified `AgentInterface.tsx` to support documents tab
   - Updated edge functions to process document context

## Implementation Details

### Context Management

The MCP client maintains a conversation context that includes:
- User and AI messages
- Document references and content
- Metadata about the conversation

This context is persisted locally and passed to the AI models.

### Google Drive Integration

The application integrates with the Google Drive API to:
1. Authenticate users with their Google account
2. Browse folders and files in their Drive
3. Select documents to be analyzed by the AI agent
4. Extract content from various file types

### Setup Requirements

To use the Google Drive integration, you need:

1. **Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project if needed
   - Enable the Google Drive API

2. **API Credentials**
   - Create OAuth 2.0 Client ID credentials
   - Create API Key credentials
   - Configure allowed origins and redirect URIs

3. **Application Configuration**
   - Enter your Google API credentials in the Document Selector dialog
   - Authenticate with your Google account

### Document Processing

When a document is selected:
1. The content is fetched using the Google Drive API
2. The document is stored in the MCP context
3. The AI model can reference and analyze the document in its responses

### Supported Document Types

The integration supports various document types:
- Text files (.txt)
- PDFs
- Google Docs (exported as plain text)
- Google Sheets (exported as CSV)
- Google Slides (exported as plain text)
- Microsoft Office documents
- Various text-based formats (JSON, HTML, etc.)

### Security Considerations

- Document content is currently stored in localStorage for demo purposes
- In production, this should be replaced with secure storage
- API keys and tokens should be stored securely

## Future Improvements

1. Add document summarization capabilities
2. Implement secure token management
3. Add version control for documents
4. Improve parsing for various document types
5. Add support for image analysis and OCR
