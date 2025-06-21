
import { supabase } from '@/integrations/supabase/client';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { MetaKnytsKnowledgeBase } from '@/services/metaknyts-knowledge-base/MetaKnytsKnowledgeBase';
import { useQryptoPersona } from '@/hooks/use-qrypto-persona';
import { useKNYTPersona } from '@/hooks/use-knyt-persona';

interface MonDAIResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  metadata: {
    version: string;
    modelUsed: string;
    knowledgeSource: string;
    itemsFound: number;
    visualsProvided?: boolean;
    mermaidDiagramIncluded?: boolean;
    aiProvider?: string;
    personaContextUsed?: boolean;
    preferredName?: string;
    [key: string]: any;
  };
}

export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null = null,
  useVenice: boolean = false
): Promise<MonDAIResponse> {
  try {
    console.log(`🔄 MonDAI: Processing message with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}`);
    
    // Get metaKnyts knowledge base
    const metaKnytsKB = MetaKnytsKnowledgeBase.getInstance();
    
    // Search metaKnyts knowledge base for relevant content
    const metaKnytsResults = metaKnytsKB.searchKnowledge(message);
    console.log(`🔍 MonDAI: Found ${metaKnytsResults.length} metaKnyts knowledge items`);
    
    // Build metaKnyts knowledge context
    let metaKnytsContext = '';
    if (metaKnytsResults.length > 0) {
      metaKnytsContext = `
### metaKnyts Knowledge Base Results
${metaKnytsResults.slice(0, 3).map((item, index) => 
  `
[metaKnyts Entry ${index + 1}]
Title: ${item.title}
Section: ${item.section}
Category: ${item.category}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
Source: ${item.source}
`
).join('\n')}
`;
    }
    
    // Get KBAI knowledge items as fallback/supplement
    let kbaiKnowledgeItems: any[] = [];
    try {
      // Try to get from KBAI service
      const { fetchKnowledgeItems } = useKnowledgeBase();
      kbaiKnowledgeItems = await fetchKnowledgeItems(message);
      console.log(`🔍 MonDAI: Found ${kbaiKnowledgeItems.length} KBAI knowledge items`);
    } catch (error) {
      console.log('📚 MonDAI: KBAI service not available, using fallback');
      // Fallback will be handled by the edge function
    }
    
    // Get persona context
    let personaContext: any = { isAnonymous: true };
    let contextualPrompt = '';
    
    // Check for active personas
    try {
      const qryptoPersona = useQryptoPersona();
      const knytPersona = useKNYTPersona();
      
      if (qryptoPersona.qryptoPersonaActivated && qryptoPersona.qryptoProfile) {
        personaContext = {
          isAnonymous: false,
          preferredName: qryptoPersona.qryptoProfile.firstName || 'Friend',
          profileType: 'qrypto',
          experienceLevel: qryptoPersona.qryptoProfile.experienceLevel,
          interests: qryptoPersona.qryptoProfile.web3Interests,
          portfolioValue: qryptoPersona.qryptoProfile.portfolioValue
        };
        
        contextualPrompt = `User Profile Context:
- Name: ${qryptoPersona.qryptoProfile.firstName}
- Experience Level: ${qryptoPersona.qryptoProfile.experienceLevel}
- Web3 Interests: ${qryptoPersona.qryptoProfile.web3Interests?.join(', ') || 'General'}
- Portfolio Value: ${qryptoPersona.qryptoProfile.portfolioValue || 'Not specified'}`;
        
        console.log(`🧠 MonDAI: Using Qrypto persona for ${personaContext.preferredName}`);
      } else if (knytPersona.knytPersonaActivated && knytPersona.knytProfile) {
        personaContext = {
          isAnonymous: false,
          preferredName: knytPersona.knytProfile.knytId || 'KNYT Member',
          profileType: 'knyt',
          membershipTier: knytPersona.knytProfile.membershipTier,
          knytTokens: knytPersona.knytProfile.knytTokensOwned,
          memberSince: knytPersona.knytProfile.memberSince
        };
        
        contextualPrompt = `User Profile Context:
- KNYT ID: ${knytPersona.knytProfile.knytId}
- Membership Tier: ${knytPersona.knytProfile.membershipTier}
- KNYT Tokens: ${knytPersona.knytProfile.knytTokensOwned}
- Member Since: ${knytPersona.knytProfile.memberSince}`;
        
        console.log(`🧠 MonDAI: Using KNYT persona for ${personaContext.preferredName}`);
      }
    } catch (error) {
      console.log('📝 MonDAI: Persona context not available, proceeding anonymously');
    }
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: {
        message,
        conversationId,
        knowledgeItems: kbaiKnowledgeItems,
        qryptoKnowledgeContext: metaKnytsContext,
        useVenice,
        personaContext,
        contextualPrompt
      }
    });

    if (error) {
      console.error('❌ MonDAI: Edge function error:', error);
      throw new Error(`MonDAI service error: ${error.message}`);
    }

    console.log(`✅ MonDAI: Response generated successfully`);
    console.log(`📊 MonDAI: Knowledge sources used: ${data.metadata.knowledgeSource}`);
    
    if (metaKnytsResults.length > 0) {
      data.metadata.metaKnytsItemsFound = metaKnytsResults.length;
      data.metadata.knowledgeSource = data.metadata.knowledgeSource.includes('metaKnyts') 
        ? data.metadata.knowledgeSource 
        : `metaKnyts Knowledge Base + ${data.metadata.knowledgeSource}`;
    }

    return data;
  } catch (error) {
    console.error('❌ MonDAI: Service error:', error);
    throw error;
  }
}
