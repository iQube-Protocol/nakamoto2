
import { supabase } from '@/integrations/supabase/client';
import { useKnowledgeBase } from '@/hooks/mcp/useKnowledgeBase';
import { MetaKnytsKnowledgeBase } from '@/services/metaknyts-knowledge-base/MetaKnytsKnowledgeBase';
import { PersonaContextService } from '@/services/persona-context-service';
import { mondaiConversationService } from './mondai-conversation-service';

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
    conversationMemoryUsed?: boolean;
    memoryThemes?: string[];
    [key: string]: any;
  };
}

// Enhanced search terms with better topic isolation
const enhanceSearchQuery = (message: string, conversationThemes: string[] = []): string[] => {
  const baseTerm = message.toLowerCase();
  const enhancedTerms = [baseTerm];
  
  console.log(`🔍 MonDAI Search: Enhancing query "${message}" with conversation themes: [${conversationThemes.join(', ')}]`);
  
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
    console.log(`🔍 MonDAI Search: Query is about runes, avoiding metaKnyts enhancement`);
    // Only add rune-specific terms
    enhancedTerms.push('bitcoin rune', 'btc rune', 'rune protocol');
    return enhancedTerms.slice(0, 3); // Limit to avoid cross-contamination
  }
  
  console.log(`🔍 MonDAI Search: Enhanced terms: [${enhancedTerms.join(', ')}]`);
  return enhancedTerms;
};

export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null = null,
  useVenice: boolean = false
): Promise<MonDAIResponse> {
  try {
    console.log(`🔄 MonDAI: Processing message with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔍 MonDAI: Original query: "${message}"`);
    
    // Generate conversation ID if not provided
    const currentConversationId = conversationId || crypto.randomUUID();
    console.log(`🔄 MonDAI: Using conversation ID: ${currentConversationId}`);
    
    // Get conversation memory
    let conversationMemory;
    let memoryContext = '';
    let conversationThemes: string[] = [];
    
    if (conversationId) {
      try {
        console.log(`🧠 MonDAI: Retrieving conversation memory for ID: ${conversationId}`);
        conversationMemory = await mondaiConversationService.getConversationMemory(conversationId);
        memoryContext = mondaiConversationService.formatMemoryForContext(conversationMemory);
        conversationThemes = conversationMemory.sessionContext.themes;
        console.log(`🧠 MonDAI: Memory retrieved with ${conversationMemory.recentHistory.length} recent exchanges`);
        console.log(`🎯 MonDAI: Session themes: ${conversationThemes.join(', ')}`);
      } catch (error) {
        console.warn('🧠 MonDAI: Failed to retrieve conversation memory:', error);
        conversationMemory = null;
      }
    }
    
    // Get metaKnyts knowledge base
    const metaKnytsKB = MetaKnytsKnowledgeBase.getInstance();
    
    // Enhanced search with conversation context
    const searchTerms = enhanceSearchQuery(message, conversationThemes);
    console.log(`🔍 MonDAI: Enhanced search terms:`, searchTerms);
    
    let metaKnytsResults: any[] = [];
    
    // Search with each enhanced term and combine results
    for (const term of searchTerms) {
      const results = metaKnytsKB.searchKnowledge(term);
      metaKnytsResults = [...metaKnytsResults, ...results];
    }
    
    // Remove duplicates based on ID
    metaKnytsResults = metaKnytsResults.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    console.log(`🔍 MonDAI: Found ${metaKnytsResults.length} metaKnyts knowledge items after enhanced search`);
    
    // Log specific items found for debugging
    metaKnytsResults.forEach((item, index) => {
      console.log(`📚 MetaKnyts Item ${index + 1}: ${item.title} (ID: ${item.id})`);
      if (item.content.includes('mermaid') || item.content.includes('```')) {
        console.log(`🎨 Visual content detected in: ${item.title}`);
      }
    });
    
    // Build enhanced metaKnyts knowledge context with explicit visual preservation instructions
    let metaKnytsContext = '';
    if (metaKnytsResults.length > 0) {
      metaKnytsContext = `
### metaKnyts Knowledge Base Results

**IMPORTANT CONTEXT AWARENESS:**
- Current conversation themes: ${conversationThemes.join(', ') || 'None established'}
- Only use metaKnyts knowledge if relevant to the user's question or conversation context
- Do not force connections between unrelated topics

**IMPORTANT VISUAL CONTENT PRESERVATION INSTRUCTIONS:**
- ALWAYS preserve and include ALL mermaid diagrams exactly as written in the knowledge base
- ALWAYS preserve and include ALL image references and visual guides 
- NEVER summarize or omit visual content - include complete mermaid code blocks
- When providing wallet setup guides, ALWAYS include the visual diagram and step-by-step images

${metaKnytsResults.slice(0, 5).map((item, index) => 
  `
[metaKnyts Entry ${index + 1}]
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
    
    // Get KBAI knowledge items as fallback/supplement
    let kbaiKnowledgeItems: any[] = [];
    try {
      // Try to get from KBAI service
      const { fetchKnowledgeItems } = useKnowledgeBase();
      kbaiKnowledgeItems = await fetchKnowledgeItems();
      console.log(`🔍 MonDAI: Found ${kbaiKnowledgeItems.length} KBAI knowledge items`);
    } catch (error) {
      console.log('📚 MonDAI: KBAI service not available, using fallback');
      // Fallback will be handled by the edge function
    }
    
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
        knowledgeItems: kbaiKnowledgeItems,
        qryptoKnowledgeContext: metaKnytsContext,
        conversationMemory: memoryContext,
        useVenice,
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
    const knowledgeHadVisuals = metaKnytsResults.some(item => 
      item.content.includes('mermaid') || item.content.includes('![')
    );
    
    if (knowledgeHadVisuals && !responseHasMermaid && !responseHasImages) {
      console.warn('⚠️ MonDAI: Visual content was in knowledge base but missing from response');
      console.log('🔍 MonDAI: Knowledge items with visuals:', 
        metaKnytsResults.filter(item => 
          item.content.includes('mermaid') || item.content.includes('![')
        ).map(item => item.title)
      );
    }

    console.log(`✅ MonDAI: Response generated successfully`);
    console.log(`📊 MonDAI: Knowledge sources used: ${data.metadata.knowledgeSource}`);
    console.log(`🎨 MonDAI: Visual content in response - Mermaid: ${responseHasMermaid}, Images: ${responseHasImages}`);
    
    // Enhance metadata with memory information
    if (metaKnytsResults.length > 0) {
      data.metadata.metaKnytsItemsFound = metaKnytsResults.length;
      data.metadata.knowledgeSource = data.metadata.knowledgeSource.includes('metaKnyts') 
        ? data.metadata.knowledgeSource 
        : `metaKnyts Knowledge Base + ${data.metadata.knowledgeSource}`;
      
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
        await mondaiConversationService.updateSessionContext(
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
