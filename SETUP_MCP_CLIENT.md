
# Model Context Protocol (MCP) Client Setup

This document outlines the implementation of the Model Context Protocol client in this application, which allows the AI agents to analyze documents from Google Drive.

## Components

1. **MCP Client (`src/integrations/mcp/client.ts`)**
   - Core MCP client implementation
   - Context management for conversations
   - Document fetching and storage
   - Google Drive integration

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

The current implementation simulates Google Drive integration. In a production environment, you would:

1. Set up OAuth 2.0 authentication with Google
2. Use the Google Drive API to list and fetch documents
3. Process and store document content securely

### Document Processing

Documents are stored in the MCP context and passed to the AI model with each request. The AI model can then reference and analyze these documents in its responses.

## Configuration

To use this feature, users need:
1. A Google account with documents in Google Drive
2. API credentials for Google Drive API
   - Client ID
   - API Key

## Security Considerations

- Document content is currently stored in localStorage for demo purposes
- In production, this should be replaced with secure storage
- API keys and tokens should be stored securely

## Future Improvements

1. Implement actual Google Drive API integration
2. Add document type processing (PDF, DOCX, etc.)
3. Add document summarization capabilities
4. Implement secure token management
5. Add version control for documents
