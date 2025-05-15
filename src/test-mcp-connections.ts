import { getMCPClient } from './integrations/mcp/client';
import { getKBAIService } from './integrations/kbai/KBAIMCPService';
import { getKBAIDirectService } from './integrations/kbai';

/**
 * This test script verifies that the MCP connections work properly.
 * It's meant to be run locally to test the connection fixes.
 */
async function testConnections() {
  console.log('Testing MCP connections...');
  
  const mcpClient = getMCPClient();
  
  try {
    console.log('Testing Google Drive connection...');
    try {
      const documents = await mcpClient.listDocuments();
      console.log(`✅ Google Drive connection successful, found ${documents.length} documents`);
    } catch (driveError) {
      console.error('❌ Google Drive connection error:', driveError);
    }
  } catch (error) {
    console.error('Error testing Google Drive connection:', error);
  }
  
  try {
    console.log('Testing KBAI connection...');
    const kbaiService = getKBAIService();
    
    console.log('Initial KBAI connection status:', kbaiService.getConnectionStatus());
    
    try {
      const items = await kbaiService.fetchKnowledgeItems({ query: 'test', limit: 5 });
      console.log(`✅ Fetched ${items.length} knowledge items`);
      
      const connectionStatus = kbaiService.getConnectionStatus();
      if (connectionStatus === 'connected') {
        console.log('✅ KBAI connection is working properly');
      } else {
        console.log(`⚠️ KBAI connection status: ${connectionStatus}`);
      }
    } catch (kbaiError) {
      console.error('❌ KBAI fetch error:', kbaiError);
    }
  } catch (error) {
    console.error('Error testing KBAI:', error);
  }
  
  console.log('Connection tests completed');
}

testConnections().catch(console.error);
