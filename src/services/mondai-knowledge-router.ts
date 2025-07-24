import { COYNKnowledgeBase } from '@/services/coyn-knowledge-base';
import { iQubesKnowledgeBase } from '@/services/iqubes-knowledge-base';
import { QryptoKnowledgeBase } from '@/services/qrypto-knowledge-base';

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  section: string;
  category: string;
  keywords: string[];
  timestamp: string;
  source: string;
}

interface KnowledgeSearchResult {
  results: KnowledgeResult[];
  sources: string[];
  totalItems: number;
}

/**
 * Smart Knowledge Base Router
 * Routes queries to appropriate knowledge bases and combines results intelligently
 */
export class MonDAIKnowledgeRouter {
  private static instance: MonDAIKnowledgeRouter;
  private coynKB: COYNKnowledgeBase;
  private iQubesKB: iQubesKnowledgeBase;
  private qryptoKB: QryptoKnowledgeBase;

  private constructor() {
    this.coynKB = COYNKnowledgeBase.getInstance();
    this.iQubesKB = iQubesKnowledgeBase.getInstance();
    this.qryptoKB = QryptoKnowledgeBase.getInstance();
  }

  public static getInstance(): MonDAIKnowledgeRouter {
    if (!MonDAIKnowledgeRouter.instance) {
      MonDAIKnowledgeRouter.instance = new MonDAIKnowledgeRouter();
    }
    return MonDAIKnowledgeRouter.instance;
  }

  /**
   * Detect query intent and route to appropriate knowledge bases
   */
  private detectQueryIntent(message: string): {
    iqube: boolean;
    coyn: boolean;
    qrypto: boolean;
    priority: 'iqube' | 'coyn' | 'qrypto' | 'general';
  } {
    const lowerMessage = message.toLowerCase();
    
    // iQube-specific terms
    const iQubeTerms = [
      'proof of state', 'proof-of-state', 'iqube', 'metaqube', 'blakqube', 'tokenqube',
      'cryptographic entanglement', 'dual-network', 'agentic ai', 'didqube',
      'proof-of-risk', 'risk scoring', 'data primitive', 'aigent protocol'
    ];
    
    // COYN-specific terms
    const coynTerms = [
      'coyn', 'wallet', 'metamask', 'add token', 'contract address',
      'micro-stable', 'stablecoin', 'ethereum', 'evm'
    ];
    
    // Qrypto-specific terms  
    const qryptoTerms = [
      'consensus', 'blockchain', 'mining', 'proof of work', 'proof of stake',
      'tokenomics', 'defi', 'smart contract', 'gas fees'
    ];

    const hasIQubeTerms = iQubeTerms.some(term => lowerMessage.includes(term));
    const hasCoynTerms = coynTerms.some(term => lowerMessage.includes(term));
    const hasQryptoTerms = qryptoTerms.some(term => lowerMessage.includes(term));

    // Determine priority based on specificity
    let priority: 'iqube' | 'coyn' | 'qrypto' | 'general' = 'general';
    if (hasIQubeTerms) priority = 'iqube';
    else if (hasCoynTerms) priority = 'coyn';
    else if (hasQryptoTerms) priority = 'qrypto';

    console.log(`🎯 Knowledge Router: Query intent detected - iQube: ${hasIQubeTerms}, COYN: ${hasCoynTerms}, Qrypto: ${hasQryptoTerms}, Priority: ${priority}`);

    return {
      iqube: hasIQubeTerms,
      coyn: hasCoynTerms || priority === 'general', // Always search COYN as fallback
      qrypto: hasQryptoTerms,
      priority
    };
  }

  /**
   * Search knowledge bases based on query intent
   */
  public searchKnowledge(message: string, conversationThemes: string[] = []): KnowledgeSearchResult {
    console.log(`🔍 Knowledge Router: Searching for "${message}" with themes: [${conversationThemes.join(', ')}]`);
    
    const intent = this.detectQueryIntent(message);
    const allResults: KnowledgeResult[] = [];
    const sources: string[] = [];

    // Enhanced search terms
    const searchTerms = this.enhanceSearchQuery(message, conversationThemes);
    
    // Search iQube KB if relevant
    if (intent.iqube || intent.priority === 'iqube') {
      console.log(`📚 Knowledge Router: Searching iQube KB`);
      for (const term of searchTerms) {
        const results = this.iQubesKB.searchKnowledge(term);
        allResults.push(...results);
      }
      if (allResults.length > 0) sources.push('iQube Knowledge Base');
    }

    // Search COYN KB if relevant or as fallback
    if (intent.coyn || intent.priority === 'coyn' || allResults.length === 0) {
      console.log(`📚 Knowledge Router: Searching COYN KB`);
      for (const term of searchTerms) {
        const results = this.coynKB.searchKnowledge(term);
        allResults.push(...results);
      }
      if (allResults.some(r => r.source.includes('COYN'))) sources.push('COYN Knowledge Base');
    }

    // Search Qrypto KB if relevant
    if (intent.qrypto || intent.priority === 'qrypto') {
      console.log(`📚 Knowledge Router: Searching Qrypto KB`);
      for (const term of searchTerms) {
        const results = this.qryptoKB.searchKnowledge(term);
        allResults.push(...results);
      }
      if (allResults.some(r => r.source.includes('Qrypto'))) sources.push('Qrypto Knowledge Base');
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = this.deduplicateAndRank(allResults, searchTerms);
    
    console.log(`✅ Knowledge Router: Found ${uniqueResults.length} items from sources: ${sources.join(', ')}`);
    
    return {
      results: uniqueResults,
      sources,
      totalItems: uniqueResults.length
    };
  }

  /**
   * Enhanced search query with conversation context
   */
  private enhanceSearchQuery(message: string, conversationThemes: string[] = []): string[] {
    const baseTerm = message.toLowerCase();
    const enhancedTerms = [baseTerm];
    
    // Context-aware enhancement
    const isMetaKnytsContext = conversationThemes.includes('metaKnyts') || 
                               conversationThemes.includes('KNYT COYN') ||
                               baseTerm.includes('metaknyts') || 
                               baseTerm.includes('knyt');
    
    // Add specific enhancements based on content
    if (baseTerm.includes('proof of state') || baseTerm.includes('proof-of-state')) {
      enhancedTerms.push('iqube protocol', 'cryptographic entanglement', 'data primitives');
    }
    
    if (baseTerm.includes('wallet') || baseTerm.includes('add') || baseTerm.includes('token')) {
      if (isMetaKnytsContext) {
        enhancedTerms.push('knyt coyn', 'wallet setup', 'contract address', 'metamask');
      } else {
        enhancedTerms.push('wallet setup', 'metamask', 'contract address');
      }
    }
    
    console.log(`🔍 Knowledge Router: Enhanced terms: [${enhancedTerms.join(', ')}]`);
    return enhancedTerms;
  }

  /**
   * Remove duplicates and rank by relevance
   */
  private deduplicateAndRank(results: KnowledgeResult[], searchTerms: string[]): KnowledgeResult[] {
    // Remove duplicates based on ID
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    // Sort by relevance - items with more search term matches first
    return uniqueResults.sort((a, b) => {
      const aMatches = searchTerms.filter(term => 
        `${a.title} ${a.content} ${a.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      const bMatches = searchTerms.filter(term => 
        `${b.title} ${b.content} ${b.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      return bMatches - aMatches;
    });
  }
}