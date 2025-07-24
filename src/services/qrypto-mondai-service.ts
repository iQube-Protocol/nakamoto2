
import { supabase } from '@/integrations/supabase/client';
import { MonDAIKnowledgeRouter } from '@/services/mondai-knowledge-router';
import { PersonaContextService } from '@/services/persona-context-service';

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

// Knowledge router for smart KB selection
const knowledgeRouter = MonDAIKnowledgeRouter.getInstance();

export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null = null,
  useVenice: boolean = false
): Promise<MonDAIResponse> {
  try {
    console.log(`🔄 MonDAI: Processing message with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔍 MonDAI: Original query: "${message}"`);
    
    // Use smart knowledge routing instead of hardcoded metaKnyts
    const knowledgeRoute = knowledgeRouter.routeQuery(message);
    
    console.log(`🧠 MonDAI: Knowledge routing result:`, {
      primarySource: knowledgeRoute.primarySource,
      sourcesUsed: knowledgeRoute.sourcesUsed,
      totalFound: knowledgeRoute.totalFound
    });
    
    // Log specific items found for debugging
    knowledgeRoute.results.forEach((item, index) => {
      console.log(`📚 KB Item ${index + 1}: ${item.title} (Source: ${item.source})`);
      if (item.content.includes('mermaid') || item.content.includes('```')) {
        console.log(`🎨 Visual content detected in: ${item.title}`);
      }
    });
    
    // Build knowledge context with explicit visual preservation instructions
    let knowledgeContext = '';
    if (knowledgeRoute.results.length > 0) {
      knowledgeContext = `
### Knowledge Base Results (Source: ${knowledgeRoute.primarySource})

**IMPORTANT VISUAL CONTENT PRESERVATION INSTRUCTIONS:**
- ALWAYS preserve and include ALL mermaid diagrams exactly as written in the knowledge base
- ALWAYS preserve and include ALL image references and visual guides 
- NEVER summarize or omit visual content - include complete mermaid code blocks
- When providing wallet setup guides, ALWAYS include the visual diagram and step-by-step images

${knowledgeRoute.results.map((item, index) => 
  `
[Knowledge Entry ${index + 1}] (${item.source})
Title: ${item.title}
${item.section ? `Section: ${item.section}` : ''}
Category: ${item.category}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
${item.content.includes('mermaid') ? '⚠️ CONTAINS MERMAID DIAGRAM - MUST PRESERVE EXACTLY' : ''}
${item.content.includes('![') ? '⚠️ CONTAINS IMAGES - MUST PRESERVE ALL IMAGE REFERENCES' : ''}
`
).join('\n')}

**REMINDER: Include ALL visual content (mermaid diagrams, images, code blocks) from the above knowledge base entries in your response.**
`;
    }
    
    // Get persona context using the service
    const conversationContext = await PersonaContextService.getConversationContext();
    const contextualPrompt = PersonaContextService.generateContextualPrompt(conversationContext, message);
    
    console.log(`📝 MonDAI: Using persona context - Anonymous: ${conversationContext.isAnonymous}`);
    if (conversationContext.preferredName) {
      console.log(`👤 MonDAI: Preferred name: ${conversationContext.preferredName}`);
    }
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: {
        message,
        conversationId,
        knowledgeItems: [], // No longer using KBAI
        qryptoKnowledgeContext: knowledgeContext,
        useVenice,
        personaContext: conversationContext,
        contextualPrompt,
        knowledgeRoute: {
          primarySource: knowledgeRoute.primarySource,
          sourcesUsed: knowledgeRoute.sourcesUsed,
          totalFound: knowledgeRoute.totalFound
        }
      }
    });

    if (error) {
      console.error('❌ MonDAI: Edge function error:', error);
      throw new Error(`MonDAI service error: ${error.message}`);
    }

    // Validate response for visual content
    const responseHasMermaid = data.message.includes('```mermaid');
    const responseHasImages = data.message.includes('![') || data.message.includes('src=');
    const knowledgeHadVisuals = knowledgeRoute.results.some(item => 
      item.content.includes('mermaid') || item.content.includes('![')
    );
    
    if (knowledgeHadVisuals && !responseHasMermaid && !responseHasImages) {
      console.warn('⚠️ MonDAI: Visual content was in knowledge base but missing from response');
      console.log('🔍 MonDAI: Knowledge items with visuals:', 
        knowledgeRoute.results.filter(item => 
          item.content.includes('mermaid') || item.content.includes('![')
        ).map(item => item.title)
      );
    }

    console.log(`✅ MonDAI: Response generated successfully`);
    console.log(`📊 MonDAI: Knowledge sources used: ${knowledgeRoute.primarySource}`);
    console.log(`🎨 MonDAI: Visual content in response - Mermaid: ${responseHasMermaid}, Images: ${responseHasImages}`);
    
    if (knowledgeRoute.results.length > 0) {
      // Update metadata with smart routing information
      data.metadata.knowledgeSource = knowledgeRoute.primarySource;
      data.metadata.sourcesUsed = knowledgeRoute.sourcesUsed;
      data.metadata.totalKnowledgeItems = knowledgeRoute.totalFound;
      
      // Source-specific counts
      data.metadata.iQubesItemsFound = knowledgeRoute.results.filter(r => r.source.includes('iQubes')).length;
      data.metadata.coynItemsFound = knowledgeRoute.results.filter(r => r.source.includes('COYN')).length;
      data.metadata.metaKnytsItemsFound = knowledgeRoute.results.filter(r => r.source.includes('metaKnyts')).length;
      
      // Enhanced visual content detection
      data.metadata.visualsProvided = responseHasMermaid || responseHasImages;
      data.metadata.mermaidDiagramIncluded = responseHasMermaid;
      data.metadata.imagesIncluded = responseHasImages;
    }

    return data;
  } catch (error) {
    console.error('❌ MonDAI: Service error:', error);
    throw error;
  }
}
