
import { supabase } from '@/integrations/supabase/client';
import { AigentKnowledgeRouter } from '@/services/aigent-knowledge-router';
import { PersonaContextService } from '@/services/persona-context-service';
import { AigentConversationService } from './aigent-conversation-service';

interface AigentResponse {
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
    conversationMemoryUsed?: boolean;
    memoryThemes?: string[];
    [key: string]: any;
  };
}

// Enhanced search terms with better topic isolation
const enhanceSearchQuery = (message: string, conversationThemes: string[] = []): string[] => {
  const baseTerm = message.toLowerCase();
  const enhancedTerms = [baseTerm];
  
  console.log(`🔍 Aigent Search: Enhancing query "${message}" with conversation themes: [${conversationThemes.join(', ')}]`);
  
  // Only add metaKnyts terms if the conversation is already about metaKnyts or explicitly mentions it
  const isMetaKnytsContext = conversationThemes.includes('metaKnyts') || 
                             conversationThemes.includes('KNYT COYN') ||
                             baseTerm.includes('metaknyts') || 
                             baseTerm.includes('knyt');
  
  // Only add specific enhancement terms if contextually relevant
  if (baseTerm.includes('wallet') || baseTerm.includes('add') || baseTerm.includes('token')) {
    if (isMetaKnytsContext) {
      enhancedTerms.push('knyt coyn', 'wallet setup', 'contract address', 'metamask', 'coinbase wallet');
    } else {
      enhancedTerms.push('wallet setup', 'metamask', 'coinbase wallet');
    }
  }
  
  if (baseTerm.includes('knyt') || baseTerm.includes('coyn')) {
    enhancedTerms.push('wallet setup', 'add token', 'contract', 'ethereum', 'metamask');
  }
  
  if (baseTerm.includes('metaknyts')) {
    enhancedTerms.push('cryptocomic', 'blockchain gaming', 'nft', 'ecosystem');
  }
  
  // Don't enhance with unrelated topics
  if (baseTerm.includes('rune') && !isMetaKnytsContext) {
    console.log(`🔍 Aigent Search: Query is about runes, avoiding metaKnyts enhancement`);
    // Only add rune-specific terms
    enhancedTerms.push('bitcoin rune', 'btc rune', 'rune protocol');
    return enhancedTerms.slice(0, 3); // Limit to avoid cross-contamination
  }
  
  console.log(`🔍 Aigent Search: Enhanced terms: [${enhancedTerms.join(', ')}]`);
  return enhancedTerms;
};

export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null = null,
  useVenice: boolean = false,
  useChainGPT: boolean = false
): Promise<AigentResponse> {
  try {
    console.log(`🔄 Aigent: Processing message with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}, ChainGPT ${useChainGPT ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔍 Aigent: Original query: "${message}"`);
    
    // Generate conversation ID if not provided
    const currentConversationId = conversationId || crypto.randomUUID();
    console.log(`🔄 Aigent: Using conversation ID: ${currentConversationId}`);
    
    // Get conversation memory
    let conversationMemory;
    let memoryContext = '';
    let conversationThemes: string[] = [];
    
    if (conversationId) {
      try {
        console.log(`🧠 Aigent: Retrieving conversation memory for ID: ${conversationId}`);
        const service = AigentConversationService.getInstance();
        conversationMemory = await service.getConversationMemory(conversationId);
        memoryContext = service.formatMemoryForContext(conversationMemory);
        conversationThemes = conversationMemory.sessionContext.themes;
        console.log(`🧠 Aigent: Memory retrieved with ${conversationMemory.recentHistory.length} recent exchanges`);
        console.log(`🎯 Aigent: Session themes: ${conversationThemes.join(', ')}`);
      } catch (error) {
        console.warn('🧠 Aigent: Failed to retrieve conversation memory:', error);
        conversationMemory = null;
      }
    }
    
    // Get smart knowledge router
    const knowledgeRouter = AigentKnowledgeRouter.getInstance();
    
    // Only use knowledge base search if no conversation memory or for specific knowledge requests
    let knowledgeSearchResult = { results: [], sources: [], totalItems: 0 };
    const needsKnowledgeSearch = !conversationMemory || 
                                 message.toLowerCase().includes('how to') || 
                                 message.toLowerCase().includes('what is') ||
                                 message.toLowerCase().includes('explain') ||
                                 conversationMemory.recentHistory.length === 0;
    
    if (needsKnowledgeSearch) {
      console.log(`🔍 MonDAI: Using knowledge search because: ${!conversationMemory ? 'no memory' : 'knowledge request detected'}`);
      
      // Smart knowledge base search with intent detection
      knowledgeSearchResult = knowledgeRouter.searchKnowledge(message, conversationThemes);
      console.log(`🔍 MonDAI: Found ${knowledgeSearchResult.totalItems} items from: ${knowledgeSearchResult.sources.join(', ')}`);
    } else {
      console.log(`🧠 MonDAI: Prioritizing conversation memory over knowledge search`);
    }
    
    const knowledgeResults = knowledgeSearchResult.results;
    
    // Log specific items found for debugging
    knowledgeResults.forEach((item, index) => {
      console.log(`📚 Knowledge Item ${index + 1}: ${item.title} (ID: ${item.id})`);
      if (item.content.includes('mermaid') || item.content.includes('```')) {
        console.log(`🎨 Visual content detected in: ${item.title}`);
      }
    });
    
    // Build enhanced knowledge context with explicit visual preservation instructions
    let knowledgeContext = '';
    if (knowledgeResults.length > 0) {
      knowledgeContext = `
### Multi-Knowledge Base Search Results
Sources: ${knowledgeSearchResult.sources.join(', ')}

**IMPORTANT CONTEXT AWARENESS:**
- Current conversation themes: ${conversationThemes.join(', ') || 'None established'}
- Only use knowledge base information if relevant to the user's question or conversation context
- Do not force connections between unrelated topics

**IMPORTANT VISUAL CONTENT PRESERVATION INSTRUCTIONS:**
- ALWAYS preserve and include ALL mermaid diagrams exactly as written in the knowledge base
- ALWAYS preserve and include ALL image references and visual guides 
- NEVER summarize or omit visual content - include complete mermaid code blocks
- When providing wallet setup guides, ALWAYS include the visual diagram and step-by-step images

${knowledgeResults.slice(0, 5).map((item, index) => 
  `
[Knowledge Entry ${index + 1}]
Title: ${item.title}
Section: ${item.section}
Category: ${item.category}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
Source: ${item.source}
${item.content.includes('mermaid') ? '⚠️ CONTAINS MERMAID DIAGRAM - MUST PRESERVE EXACTLY' : ''}
${item.content.includes('![') ? '⚠️ CONTAINS IMAGES - MUST PRESERVE ALL IMAGE REFERENCES' : ''}
`
).join('\n')}

**REMINDER: Only reference this knowledge base if directly relevant to the user's question or established conversation context.**
`;
    }
    
    // No longer using KBAI - knowledge is handled by smart router
    
    // Get persona context using the service
    const conversationContext = await PersonaContextService.getConversationContext();
    const contextualPrompt = PersonaContextService.generateContextualPrompt(conversationContext, message);
    
    console.log(`📝 MonDAI: Using persona context - Anonymous: ${conversationContext.isAnonymous}`);
    if (conversationContext.preferredName) {
      console.log(`👤 MonDAI: Preferred name: ${conversationContext.preferredName}`);
    }
    
    // Call the edge function with conversation memory
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: {
        message,
        conversationId: currentConversationId,
        knowledgeItems: [], // No longer using KBAI
        qryptoKnowledgeContext: knowledgeContext,
        conversationMemory: memoryContext,
        useVenice,
        useChainGPT,
        personaContext: conversationContext,
        contextualPrompt
      }
    });

    if (error) {
      console.error('❌ MonDAI: Edge function error:', error);
      throw new Error(`MonDAI service error: ${error.message}`);
    }

    // Validate response for visual content
    const responseHasMermaid = data.message.includes('```mermaid');
    const responseHasImages = data.message.includes('![') || data.message.includes('src=');
    const knowledgeHadVisuals = knowledgeResults.some(item => 
      item.content.includes('mermaid') || item.content.includes('![')
    );
    
    if (knowledgeHadVisuals && !responseHasMermaid && !responseHasImages) {
      console.warn('⚠️ MonDAI: Visual content was in knowledge base but missing from response');
      console.log('🔍 MonDAI: Knowledge items with visuals:', 
        knowledgeResults.filter(item => 
          item.content.includes('mermaid') || item.content.includes('![')
        ).map(item => item.title)
      );
    }

    console.log(`✅ MonDAI: Response generated successfully`);
    console.log(`📊 MonDAI: Knowledge sources used: ${data.metadata.knowledgeSource}`);
    console.log(`🎨 MonDAI: Visual content in response - Mermaid: ${responseHasMermaid}, Images: ${responseHasImages}`);
    
    // Enhance metadata with memory information
    if (knowledgeResults.length > 0) {
      data.metadata.knowledgeItemsFound = knowledgeResults.length;
      data.metadata.knowledgeSource = knowledgeSearchResult.sources.length > 0 
        ? knowledgeSearchResult.sources.join(' + ')
        : data.metadata.knowledgeSource;
      
      // Enhanced visual content detection
      data.metadata.visualsProvided = responseHasMermaid || responseHasImages;
      data.metadata.mermaidDiagramIncluded = responseHasMermaid;
      data.metadata.imagesIncluded = responseHasImages;
    }

    // Add memory metadata
    if (conversationMemory) {
      data.metadata.conversationMemoryUsed = true;
      data.metadata.memoryThemes = conversationMemory.sessionContext.themes;
      data.metadata.recentExchangeCount = conversationMemory.recentHistory.length;
    }

    // Update conversation memory after successful response
    if (conversationId) {
      try {
        console.log(`🧠 MonDAI: Updating conversation memory for ${currentConversationId}`);
        const service = AigentConversationService.getInstance();
        await service.storeConversationExchange(
          currentConversationId, 
          message, 
          data.message
        );
      } catch (error) {
        console.warn('🧠 MonDAI: Failed to update session context:', error);
      }
    }

    return data;
  } catch (error) {
    console.error('❌ MonDAI: Service error:', error);
    throw error;
  }
}
