import { iQubesKnowledgeBase } from '@/services/iqubes-knowledge-base/iQubesKnowledgeBase';
import { COYNKnowledgeBase } from '@/services/coyn-knowledge-base/COYNKnowledgeBase';
import { MetaKnytsKnowledgeBase } from '@/services/metaknyts-knowledge-base/MetaKnytsKnowledgeBase';

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  category: string;
  section?: string;
  keywords: string[];
  source: string;
  [key: string]: any;
}

interface RouteResult {
  results: KnowledgeResult[];
  primarySource: string;
  sourcesUsed: string[];
  totalFound: number;
}

export class MonDAIKnowledgeRouter {
  private static instance: MonDAIKnowledgeRouter;
  private iQubesKB: iQubesKnowledgeBase;
  private coynKB: COYNKnowledgeBase;
  private metaKnytsKB: MetaKnytsKnowledgeBase;

  private constructor() {
    this.iQubesKB = iQubesKnowledgeBase.getInstance();
    this.coynKB = COYNKnowledgeBase.getInstance();
    this.metaKnytsKB = MetaKnytsKnowledgeBase.getInstance();
  }

  public static getInstance(): MonDAIKnowledgeRouter {
    if (!MonDAIKnowledgeRouter.instance) {
      MonDAIKnowledgeRouter.instance = new MonDAIKnowledgeRouter();
    }
    return MonDAIKnowledgeRouter.instance;
  }

  /**
   * Routes a query to the appropriate knowledge base(s) based on content analysis
   */
  public routeQuery(query: string): RouteResult {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ');

    // Detect query intent based on keywords
    const isIQubesQuery = this.detectIQubesQuery(queryLower, searchTerms);
    const isCOYNQuery = this.detectCOYNQuery(queryLower, searchTerms);
    const isMetaKnytsQuery = this.detectMetaKnytsQuery(queryLower, searchTerms);

    console.log(`🧠 Knowledge Router: Query analysis - iQubes: ${isIQubesQuery}, COYN: ${isCOYNQuery}, metaKnyts: ${isMetaKnytsQuery}`);

    let results: KnowledgeResult[] = [];
    let primarySource = '';
    let sourcesUsed: string[] = [];

    // Priority routing: iQubes -> COYN -> metaKnyts -> All
    if (isIQubesQuery) {
      results = this.searchIQubes(query);
      primarySource = 'iQubes Knowledge Base';
      sourcesUsed.push('iQubes');
      
      // If no results, try COYN as fallback
      if (results.length === 0 && (isCOYNQuery || this.isGeneralTechQuery(queryLower))) {
        const coynResults = this.searchCOYN(query);
        results.push(...coynResults);
        if (coynResults.length > 0) {
          primarySource = 'COYN Knowledge Base';
          sourcesUsed.push('COYN');
        }
      }
    } else if (isCOYNQuery) {
      results = this.searchCOYN(query);
      primarySource = 'COYN Knowledge Base';
      sourcesUsed.push('COYN');
      
      // If no results, try iQubes as fallback
      if (results.length === 0) {
        const iQubesResults = this.searchIQubes(query);
        results.push(...iQubesResults);
        if (iQubesResults.length > 0) {
          primarySource = 'iQubes Knowledge Base';
          sourcesUsed.push('iQubes');
        }
      }
    } else if (isMetaKnytsQuery) {
      results = this.searchMetaKnyts(query);
      primarySource = 'metaKnyts Knowledge Base';
      sourcesUsed.push('metaKnyts');
    } else {
      // General query - search all KBs with priority
      const iQubesResults = this.searchIQubes(query);
      const coynResults = this.searchCOYN(query);
      const metaKnytsResults = this.searchMetaKnyts(query);

      // Prioritize results: iQubes > COYN > metaKnyts
      results = [...iQubesResults, ...coynResults, ...metaKnytsResults];
      
      if (iQubesResults.length > 0) {
        primarySource = 'iQubes Knowledge Base';
        sourcesUsed.push('iQubes');
      }
      if (coynResults.length > 0) {
        if (!primarySource) primarySource = 'COYN Knowledge Base';
        sourcesUsed.push('COYN');
      }
      if (metaKnytsResults.length > 0) {
        if (!primarySource) primarySource = 'metaKnyts Knowledge Base';
        sourcesUsed.push('metaKnyts');
      }

      // If we have results from multiple sources, update primary source
      if (sourcesUsed.length > 1) {
        primarySource = `Multiple Knowledge Bases (${sourcesUsed.join(', ')})`;
      }
    }

    // Remove duplicates by ID and limit results
    results = this.deduplicateResults(results).slice(0, 5);

    console.log(`📚 Knowledge Router: Found ${results.length} results from: ${sourcesUsed.join(', ')}`);

    return {
      results,
      primarySource: primarySource || 'No Knowledge Base',
      sourcesUsed,
      totalFound: results.length
    };
  }

  private detectIQubesQuery(queryLower: string, searchTerms: string[]): boolean {
    const iQubesKeywords = [
      'iqube', 'iqubes', 'i-qube', 'i-qubes',
      'vft', 'vfts', 'volume function token',
      'data qube', 'agent qube', 'tool qube',
      'coyn protocol', 'protocol',
      'smart contract', 'blockchain',
      'tokenomics', 'defi'
    ];

    return iQubesKeywords.some(keyword => 
      queryLower.includes(keyword) || 
      searchTerms.some(term => keyword.includes(term))
    );
  }

  private detectCOYNQuery(queryLower: string, searchTerms: string[]): boolean {
    const coynKeywords = [
      'coyn', 'coin', 'qrypto coyn',
      'cryptocurrency', 'crypto',
      'wallet', 'metamask', 'coinbase',
      'add token', 'contract address',
      'ethereum', 'polygon', 'bsc'
    ];

    return coynKeywords.some(keyword => 
      queryLower.includes(keyword) || 
      searchTerms.some(term => keyword.includes(term))
    );
  }

  private detectMetaKnytsQuery(queryLower: string, searchTerms: string[]): boolean {
    const metaKnytsKeywords = [
      'metaknyts', 'meta knyts', 'metaknyts',
      'knowone', 'satoshi nakamoto', 'nakamoto',
      'fang gang', 'bat pack',
      'terra', 'digitterra', 'dual reality',
      'narrative', 'story', 'character',
      'cryptocomic', 'comic', 'gaming'
    ];

    return metaKnytsKeywords.some(keyword => 
      queryLower.includes(keyword) || 
      searchTerms.some(term => keyword.includes(term))
    );
  }

  private isGeneralTechQuery(queryLower: string): boolean {
    const techKeywords = [
      'how', 'what', 'why', 'explain', 'define',
      'web3', 'blockchain', 'crypto', 'defi',
      'smart contract', 'token', 'nft'
    ];

    return techKeywords.some(keyword => queryLower.includes(keyword));
  }

  private searchIQubes(query: string): KnowledgeResult[] {
    try {
      const results = this.iQubesKB.searchKnowledge(query);
      return results.map(item => ({
        ...item,
        source: 'iQubes Knowledge Base'
      }));
    } catch (error) {
      console.error('Error searching iQubes KB:', error);
      return [];
    }
  }

  private searchCOYN(query: string): KnowledgeResult[] {
    try {
      const results = this.coynKB.searchKnowledge(query);
      return results.map(item => ({
        ...item,
        source: 'COYN Knowledge Base'
      }));
    } catch (error) {
      console.error('Error searching COYN KB:', error);
      return [];
    }
  }

  private searchMetaKnyts(query: string): KnowledgeResult[] {
    try {
      const results = this.metaKnytsKB.searchKnowledge(query);
      return results.map(item => ({
        ...item,
        source: 'metaKnyts Knowledge Base'
      }));
    } catch (error) {
      console.error('Error searching metaKnyts KB:', error);
      return [];
    }
  }

  private deduplicateResults(results: KnowledgeResult[]): KnowledgeResult[] {
    const seen = new Set<string>();
    return results.filter(item => {
      const key = `${item.id}-${item.source}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get statistics about available knowledge bases
   */
  public getKnowledgeStats() {
    const iQubesStats = {
      name: 'iQubes',
      totalItems: this.iQubesKB.getAllKnowledge().length
    };
    
    const coynStats = {
      name: 'COYN',
      totalItems: this.coynKB.getKnowledgeStats().totalItems
    };
    
    const metaKnytsStats = {
      name: 'metaKnyts',
      totalItems: this.metaKnytsKB.getKnowledgeStats().totalItems
    };

    return {
      knowledgeBases: [iQubesStats, coynStats, metaKnytsStats],
      totalItems: iQubesStats.totalItems + coynStats.totalItems + metaKnytsStats.totalItems
    };
  }
}