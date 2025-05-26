
import { QryptoKnowledgeItem } from './types';
import { QRYPTO_KNOWLEDGE_DATA } from './knowledge-data';

export class QryptoKnowledgeBase {
  private static instance: QryptoKnowledgeBase;
  private knowledgeItems: QryptoKnowledgeItem[] = [];

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): QryptoKnowledgeBase {
    if (!QryptoKnowledgeBase.instance) {
      QryptoKnowledgeBase.instance = new QryptoKnowledgeBase();
    }
    return QryptoKnowledgeBase.instance;
  }

  private initializeKnowledgeBase() {
    this.addKnowledgeItems(QRYPTO_KNOWLEDGE_DATA);
  }

  public addKnowledgeItems(items: QryptoKnowledgeItem[]) {
    this.knowledgeItems.push(...items);
  }

  public searchKnowledge(query: string): QryptoKnowledgeItem[] {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ');
    
    return this.knowledgeItems.filter(item => {
      const searchableText = `${item.title} ${item.content} ${item.keywords.join(' ')}`.toLowerCase();
      return searchTerms.some(term => 
        searchableText.includes(term) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    }).sort((a, b) => {
      // Sort by relevance - items with more keyword matches first
      const aMatches = searchTerms.filter(term => 
        `${a.title} ${a.content} ${a.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      const bMatches = searchTerms.filter(term => 
        `${b.title} ${b.content} ${b.keywords.join(' ')}`.toLowerCase().includes(term)
      ).length;
      return bMatches - aMatches;
    });
  }

  public getAllKnowledge(): QryptoKnowledgeItem[] {
    return this.knowledgeItems;
  }

  public getKnowledgeByCategory(category: QryptoKnowledgeItem['category']): QryptoKnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }
}
