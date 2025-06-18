
import { knytKnowledgeData } from './knowledge-data';
import { KNYTKnowledgeItem, KNYTSearchResult } from './types';

export class KNYTKnowledgeBase {
  private static instance: KNYTKnowledgeBase;
  private knowledgeItems: KNYTKnowledgeItem[];

  private constructor() {
    this.knowledgeItems = knytKnowledgeData;
  }

  public static getInstance(): KNYTKnowledgeBase {
    if (!KNYTKnowledgeBase.instance) {
      KNYTKnowledgeBase.instance = new KNYTKnowledgeBase();
    }
    return KNYTKnowledgeBase.instance;
  }

  public search(query: string, limit: number = 10): KNYTSearchResult {
    if (!query.trim()) {
      return {
        items: this.knowledgeItems.slice(0, limit),
        totalResults: this.knowledgeItems.length,
        searchTerm: query
      };
    }

    const searchTerms = query.toLowerCase().split(' ');
    const results = this.knowledgeItems.filter(item => {
      const searchText = `${item.title} ${item.content} ${item.keywords.join(' ')} ${item.category}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });

    return {
      items: results.slice(0, limit),
      totalResults: results.length,
      searchTerm: query
    };
  }

  public getByCategory(category: string): KNYTKnowledgeItem[] {
    return this.knowledgeItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  public getById(id: string): KNYTKnowledgeItem | undefined {
    return this.knowledgeItems.find(item => item.id === id);
  }

  public getAllItems(): KNYTKnowledgeItem[] {
    return [...this.knowledgeItems];
  }

  public getCategories(): string[] {
    const categories = new Set(this.knowledgeItems.map(item => item.category));
    return Array.from(categories);
  }
}
