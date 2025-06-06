
import { iQubesKnowledgeItem } from './types';
import { IQUBES_KNOWLEDGE_DATA } from './knowledge-data';

export class iQubesKnowledgeBase {
  private static instance: iQubesKnowledgeBase;
  private knowledgeItems: iQubesKnowledgeItem[] = [];

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): iQubesKnowledgeBase {
    if (!iQubesKnowledgeBase.instance) {
      iQubesKnowledgeBase.instance = new iQubesKnowledgeBase();
    }
    return iQubesKnowledgeBase.instance;
  }

  private initializeKnowledgeBase() {
    this.addKnowledgeItems(IQUBES_KNOWLEDGE_DATA);
  }

  public addKnowledgeItems(items: iQubesKnowledgeItem[]) {
    this.knowledgeItems.push(...items);
  }

  public searchKnowledge(query: string): iQubesKnowledgeItem[] {
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

  public getAllKnowledge(): iQubesKnowledgeItem[] {
    return this.knowledgeItems;
  }

  public getKnowledgeByCategory(category: iQubesKnowledgeItem['category']): iQubesKnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }
}
