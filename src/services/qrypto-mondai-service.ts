import { qryptoKB, QryptoKnowledgeItem } from '@/services/qrypto-knowledge-base';
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
    citations: string[];
    [key: string]: any;
  };
}

/**
 * Enhanced Aigent Nakamoto system prompt with Qrypto COYN knowledge base integration
 */
export const AIGENT_NAKAMOTO_SYSTEM_PROMPT = `
## **Aigent Nakamoto: Crypto-Agentic AI for the QryptoCOYN Ecosystem**

**<role-description>**
You are Aigent Nakamoto, an AI agent specialized in the Qrypto COYN ecosystem and trained on foundational knowledge covering tokenomics, smart contract design, the COYN protocol, iQubes, VFTs, and associated mechanisms. You prioritize user sovereignty, privacy, and contextual intelligence using privacy-preserving iQube technology.

**<knowledge-base-priority>**
You MUST reference your internal Qrypto COYN Knowledge Base to respond accurately to any queries involving:
- iQubes and their primitives (metaQubes, blakQubes, tokenQubes)
- Variant Fungibility Tokens (VFTs)
- COYN Protocol technical architecture
- $QOYN staking, burn mechanics, emissions
- QryptoCOYN, Qryptocents, COYN terminology
- Techno Capital Machine (TCM)
- Chain Fusion and LayerZero interoperability
- Crypto-economic agent coordination models (PoR, PoP, governance)
- Proof of Risk, Proof of Price, Proof of State consensus frameworks
- Bitcoin-secured data assets and Satoshi entanglement

**<citation-requirement>**
For ANY concept from the knowledge base, you MUST include citations in this format:
(Source: [Document Name], Section: [Title/Subheading], Timestamp: [Date])

Example:
"iQubes manage risk using a Proof-of-Risk scoring framework that aligns pricing with verifiability."
(Source: Qrypto COYN Tokenomics, Section: Ecosystem Economics, Timestamp: ${new Date().toLocaleDateString()})

**<response-formatting>**
Your responses MUST be:
1. Concise and user-friendly - focus on clarity over verbosity
2. Well-structured with appropriate spacing and paragraphs for readability
3. Direct and to-the-point, avoiding unnecessary text
4. Include proper citations when referencing knowledge base content
5. Focused on summarizing knowledge, not quoting it verbatim
6. Natural and conversational, not overly formal or robotic

**<mermaid-diagrams>**
When explaining complex Qrypto COYN processes or concepts, create visual aids using Mermaid diagrams:

\`\`\`mermaid
diagram-code-here
\`\`\`

Use appropriate diagram types for topics like:
- iQube architecture and data flow
- TCM staking mechanisms
- Proof of Risk/Price/State processes
- Cross-chain interactions via LayerZero/ICP Chain Fusion
- Token emission and burn mechanics

**<handling-unknown-terms>**
When encountering terms like "metaKnyts," "QryptoCENT," "AigentQube," or other new primitives:
1. First attempt lookup in current knowledge base
2. If not found, inform the user and suggest they provide additional documentation
3. Flag these terms for future knowledge base inclusion

**<tone-guidance>**
Your tone is conversational, upbeat, and encouraging - like a knowledgeable friend who understands the technical depths of Web3 and Qrypto COYN but explains things clearly. Use accessible language and always explain technical terms when first mentioned.
`;

/**
 * Search for relevant Qrypto COYN knowledge based on user query
 */
function findRelevantQryptoKnowledge(query: string): QryptoKnowledgeItem[] {
  // Check for Qrypto COYN specific terms
  const qryptoTerms = [
    'qrypto', 'coyn', '$qoyn', 'iqube', 'iqubes', 'metaqube', 'blakqube', 'tokenqube',
    'aigent', 'proof of risk', 'proof of price', 'proof of state', 'por', 'pop', 'pos',
    'tcm', 'techno capital machine', 'chain fusion', 'layerzero', 'vft', 'variant fungibility',
    'satoshi entanglement', 'bitcoin security', 'qryptocent', 'qryptocoyn'
  ];
  
  const queryLower = query.toLowerCase();
  const hasQryptoTerms = qryptoTerms.some(term => queryLower.includes(term));
  
  if (hasQryptoTerms) {
    return qryptoKB.searchKnowledge(query);
  }
  
  // For general crypto/blockchain queries, still search but with lower priority
  const generalTerms = ['crypto', 'blockchain', 'token', 'defi', 'web3', 'staking', 'protocol'];
  const hasGeneralTerms = generalTerms.some(term => queryLower.includes(term));
  
  if (hasGeneralTerms) {
    return qryptoKB.searchKnowledge(query).slice(0, 3); // Limit to top 3 results
  }
  
  return [];
}

/**
 * Format citations for knowledge base items
 */
function formatCitations(items: QryptoKnowledgeItem[]): string[] {
  return items.map(item => 
    `(Source: ${item.source}, Section: ${item.section}, Timestamp: ${new Date(item.timestamp).toLocaleDateString()})`
  );
}

/**
 * Generate enhanced Aigent Nakamoto response with Qrypto knowledge base integration
 */
export async function generateAigentNakamotoResponse(
  message: string,
  conversationId: string | null
): Promise<QryptoMonDAIResponse> {
  // Get conversation context if we have a conversationId
  let contextResult;
  if (conversationId) {
    contextResult = await getConversationContext(conversationId, 'learn');
    conversationId = contextResult.conversationId;
  } else {
    conversationId = crypto.randomUUID();
  }

  // Search for relevant Qrypto COYN knowledge
  const relevantQryptoKnowledge = findRelevantQryptoKnowledge(message);
  const citations = formatCitations(relevantQryptoKnowledge);

  // Format knowledge items for the AI prompt
  let qryptoKnowledgeContext = '';
  if (relevantQryptoKnowledge.length > 0) {
    qryptoKnowledgeContext = `
### Qrypto COYN Knowledge Base Entries
${relevantQryptoKnowledge.map((item, index) => 
  `[Entry ${index + 1}]
Title: ${item.title}
Section: ${item.section}
Content: ${item.content}
Keywords: ${item.keywords.join(', ')}
Required Citation: (Source: ${item.source}, Section: ${item.section}, Timestamp: ${new Date(item.timestamp).toLocaleDateString()})
`
).join('\n')}

IMPORTANT: You MUST include the Required Citation for any information you use from these entries.
Use the information above to inform your responses and summarize this knowledge - do not quote verbatim.
`;
  }

  try {
    // Call the mondai-ai function with enhanced context
    const { data, error } = await supabase.functions.invoke('mondai-ai', {
      body: { 
        message, 
        conversationId,
        knowledgeItems: relevantQryptoKnowledge,
        historicalContext: contextResult?.historicalContext,
        systemPrompt: AIGENT_NAKAMOTO_SYSTEM_PROMPT,
        qryptoKnowledgeContext
      }
    });
    
    if (error) {
      console.error('Error calling mondai-ai function:', error);
      throw new Error(error.message);
    }
    
    // Enhance the response metadata
    return {
      ...data,
      metadata: {
        ...data.metadata,
        qryptoItemsFound: relevantQryptoKnowledge.length,
        citations: citations,
        knowledgeSource: relevantQryptoKnowledge.length > 0 ? 
          "Qrypto COYN Knowledge Base + AI" : 
          "General AI Knowledge"
      }
    };
    
  } catch (error) {
    console.error('Error generating Aigent Nakamoto response:', error);
    
    // Fallback response with knowledge base context
    const fallbackMessage = relevantQryptoKnowledge.length > 0 ? 
      `I found ${relevantQryptoKnowledge.length} relevant entries in my Qrypto COYN knowledge base about your query, but I'm experiencing connection issues with my AI processing service. The knowledge base contains information about: ${relevantQryptoKnowledge.map(item => item.title).join(', ')}. Please try your question again in a moment.` :
      "I'm experiencing connection issues with my AI processing service. Please try your question again in a moment.";
    
    return {
      conversationId,
      message: fallbackMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        version: "1.0",
        modelUsed: "fallback",
        knowledgeSource: "Qrypto COYN Knowledge Base",
        qryptoItemsFound: relevantQryptoKnowledge.length,
        citations: citations,
        isOffline: true
      }
    };
  }
}

// Export for backward compatibility
export const processAigentNakamotoInteraction = generateAigentNakamotoResponse;
