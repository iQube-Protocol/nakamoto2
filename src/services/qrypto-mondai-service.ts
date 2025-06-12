
import { qryptoKB, QryptoKnowledgeItem } from '@/services/qrypto-knowledge-base';
import { metaKnytsKB, MetaKnytsKnowledgeItem } from '@/services/metaknyts-knowledge-base';
import { supabase } from '@/integrations/supabase/client';
import { getConversationContext } from '@/services/agent-service';

export interface QryptoMonDAIResponse {
  conversationId: string;
  message: string;
  timestamp: string;
  metadata: {
    version: string;
    modelUsed: string;
    knowledgeSource: string;
    qryptoItemsFound: number;
    metaKnytsItemsFound: number;
    citations: string[];
    [key: string]: any;
  };
}

/**
 * Enhanced Aigent Nakamoto system prompt with dual knowledge base integration
 */
export const AIGENT_NAKAMOTO_SYSTEM_PROMPT = `
## **Aigent Nakamoto: Crypto-Agentic AI for the QryptoCOYN Ecosystem**

**<role-description>**
You are Aigent Nakamoto, an AI agent specialized in both the QryptoCOYN ecosystem and the mẹtaKnyts narrative universe. You are trained on foundational knowledge covering tokenomics, smart contract design, the COYN protocol, iQubes, VFTs, and the science fictional mẹtaKnyts saga that provides the narrative backdrop for these technologies.

**<spelling-note>**
IMPORTANT: Always spell "QryptoCOYN" as one word (Q-r-y-p-t-o-C-O-Y-N), never as "Qrypto COYN" or "Qrypto-COYN". This is the correct branding and must be maintained consistently.

**<dual-knowledge-integration>**
You have access to two interconnected knowledge bases:
1. **QryptoCOYN Technical Knowledge** - Real-world protocol specifications, tokenomics, and implementation details
2. **mẹtaKnyts Narrative Knowledge** - Science fictional storytelling that explores the creation and implications of these technologies

These knowledge bases are correlated - mẹtaKnyts is the science fictional tale about the creation of iQubes and Bitcoin, featuring Satoshi Nakamoto as a character who catalyzes the crypto revolution.

**<terminology-note>**
The correct spelling is "mẹtaKnyts" but you should recognize and respond to queries using any of these alternate spellings: "metaKnyts", "mẹtaKnights", "metaKnights". All refer to the same narrative universe and characters.

**<knowledge-base-priority>**
You MUST reference your internal knowledge bases to respond accurately to queries involving:
- iQubes and their primitives (metaQubes, blakQubes, tokenQubes)
- Variant Fungibility Tokens (VFTs) and their narrative origins
- COYN Protocol technical architecture and its fictional genesis
- $QOYN staking, burn mechanics, emissions
- mẹtaKnyts characters (KnowOne, Satoshi Nakamoto, FANG Gang, BAT Pack)
- Terra/Digitterra dual reality framework
- The philosophical implications of decentralized vs centralized AI

**<citation-requirement>**
For ANY concept from either knowledge base, you MUST include citations in this format:
(Source: [Document Name], Section: [Title/Subheading], Knowledge Base: [QryptoCOYN/mẹtaKnyts])

**<narrative-technical-integration>**
When discussing technical concepts, you can reference their narrative origins in mẹtaKnyts. When exploring story elements, you can connect them to real technical implementations in QryptoCOYN. This creates a rich, multilayered understanding that bridges fiction and reality.

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Include proper citations when referencing knowledge base content
5. Integrate narrative and technical perspectives when relevant
6. Natural and conversational, not overly formal or robotic

**<mermaid-diagrams>**
When explaining complex concepts, create visual aids using Mermaid diagrams that can illustrate both technical architectures and narrative relationships.

**<tone-guidance>**
Your tone is conversational, upbeat, and encouraging - like a knowledgeable friend who understands both the technical depths of Web3 and the visionary storytelling of mẹtaKnyts. You bridge the gap between technical implementation and narrative inspiration.
`;

/**
 * Search for relevant knowledge from both bases
 */
function findRelevantKnowledge(query: string): {
  qryptoItems: QryptoKnowledgeItem[];
  metaKnytsItems: MetaKnytsKnowledgeItem[];
} {
  // Check for terms that might appear in either knowledge base
  const queryLower = query.toLowerCase();
  
  // Always search both knowledge bases for comprehensive results
  const qryptoItems = qryptoKB.searchKnowledge(query);
  const metaKnytsItems = metaKnytsKB.searchKnowledge(query);
  
  // Limit results to most relevant items
  return {
    qryptoItems: qryptoItems.slice(0, 5),
    metaKnytsItems: metaKnytsItems.slice(0, 5)
  };
}

/**
 * Format citations for both knowledge bases
 */
function formatCitations(qryptoItems: QryptoKnowledgeItem[], metaKnytsItems: MetaKnytsKnowledgeItem[]): string[] {
  const qryptoCitations = qryptoItems.map(item => 
    `(Source: ${item.source}, Section: ${item.section}, Knowledge Base: QryptoCOYN)`
  );
  
  const metaKnytsCitations = metaKnytsItems.map(item => 
    `(Source: ${item.source}, Section: ${item.section}, Knowledge Base: metaKnyts)`
  );
  
  return [...qryptoCitations, ...metaKnytsCitations];
}

/**
 * Generate enhanced Aigent Nakamoto response with dual knowledge base integration
 */
export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null,
  useVenice: boolean = false
): Promise<QryptoMonDAIResponse> {
  console.log(`🚀 QryptoMondAI Service: Starting with Venice ${useVenice ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔧 QryptoMondAI Service: useVenice parameter:`, useVenice);
  
  // Get conversation context if we have a conversationId
  let contextResult;
  if (conversationId) {
    // Use 'learn' for backend compatibility since MonDAI shares infrastructure with Learn agent
    contextResult = await getConversationContext(conversationId, 'learn');
    conversationId = contextResult.conversationId;
  } else {
    conversationId = crypto.randomUUID();
  }

  // Search both knowledge bases for relevant information
  const { qryptoItems, metaKnytsItems } = findRelevantKnowledge(message);
  const citations = formatCitations(qryptoItems, metaKnytsItems);

  // Format knowledge items for the AI prompt
  let knowledgeContext = '';
  
  if (qryptoItems.length > 0) {
    knowledgeContext += `
### QryptoCOYN Technical Knowledge Base Entries
${qryptoItems.map((item, index) => 
  `[QryptoCOYN Entry ${index + 1}]
Title: ${item.title}
Section: ${item.section}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
Required Citation: (Source: ${item.source}, Section: ${item.section}, Knowledge Base: QryptoCOYN)
`
).join('\n')}`;
  }

  if (metaKnytsItems.length > 0) {
    knowledgeContext += `
### metaKnyts Narrative Knowledge Base Entries
${metaKnytsItems.map((item, index) => 
  `[metaKnyts Entry ${index + 1}]
Title: ${item.title}
Section: ${item.section}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
${item.connections ? `Connected QryptoCOYN Concepts: ${item.connections.join(', ')}` : ''}
Required Citation: (Source: ${item.source}, Section: ${item.section}, Knowledge Base: metaKnyts)
`
).join('\n')}`;
  }

  if (knowledgeContext) {
    knowledgeContext += `
IMPORTANT: You MUST include the Required Citation for any information you use from these entries.
Use this information to inform your responses and synthesize knowledge from both technical and narrative perspectives.
`;
  }

  try {
    console.log(`🌐 QryptoMondAI Service: Calling mondai-ai function with Venice: ${useVenice}`);
    
    // Call the mondai-ai function with enhanced dual knowledge context and Venice toggle
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: { 
        message, 
        conversationId,
        knowledgeItems: [...qryptoItems, ...metaKnytsItems],
        historicalContext: contextResult?.historicalContext,
        systemPrompt: AIGENT_NAKAMOTO_SYSTEM_PROMPT,
        knowledgeContext,
        useVenice
      }
    });
    
    if (error) {
      console.error('Error calling mondai-ai function:', error);
      throw new Error(error.message);
    }
    
    console.log(`🎯 QryptoMondAI Service: Response received from ${data.metadata?.aiProvider || (useVenice ? 'Venice AI' : 'OpenAI')}`);
    
    // Enhance the response metadata
    return {
      ...data,
      metadata: {
        ...data.metadata,
        qryptoItemsFound: qryptoItems.length,
        metaKnytsItemsFound: metaKnytsItems.length,
        citations: citations,
        knowledgeSource: qryptoItems.length > 0 || metaKnytsItems.length > 0 ? 
          "QryptoCOYN + metaKnyts Knowledge Bases + AI" : 
          "General AI Knowledge",
        aiProvider: useVenice ? "Venice AI" : "OpenAI"
      }
    };
    
  } catch (error) {
    console.error('Error generating Aigent Nakamoto response:', error);
    
    // Fallback response with knowledge base context
    const totalItems = qryptoItems.length + metaKnytsItems.length;
    const aiProvider = useVenice ? "Venice AI" : "OpenAI";
    const fallbackMessage = totalItems > 0 ? 
      `I found ${qryptoItems.length} QryptoCOYN entries and ${metaKnytsItems.length} metaKnyts narrative entries related to your query, but I'm experiencing connection issues with my ${aiProvider} processing service. Please try your question again in a moment.` :
      `I'm experiencing connection issues with my ${aiProvider} processing service. Please try your question again in a moment.`;
    
    return {
      conversationId,
      message: fallbackMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        version: "1.0",
        modelUsed: "fallback",
        knowledgeSource: "Dual Knowledge Base",
        qryptoItemsFound: qryptoItems.length,
        metaKnytsItemsFound: metaKnytsItems.length,
        citations: citations,
        isOffline: true,
        aiProvider: aiProvider
      }
    };
  }
}

// Export for backward compatibility
export const processAigentNakamotoInteraction = generateAigentNakamotoResponse;
