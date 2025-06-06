
import { COYNKnowledgeItem } from './types';
import { COYN_KNOWLEDGE_DATA } from './knowledge-data';

export class COYNKnowledgeBase {
  private static instance: COYNKnowledgeBase;
  private knowledgeItems: COYNKnowledgeItem[];

  private constructor() {
    this.knowledgeItems = [...COYN_KNOWLEDGE_DATA];
  }

  public static getInstance(): COYNKnowledgeBase {
    if (!COYNKnowledgeBase.instance) {
      COYNKnowledgeBase.instance = new COYNKnowledgeBase();
    }
    return COYNKnowledgeBase.instance;
  }

  public getAllKnowledge(): COYNKnowledgeItem[] {
    return [...this.knowledgeItems];
  }

  public searchKnowledge(query: string): COYNKnowledgeItem[] {
    if (!query.trim()) {
      return this.getAllKnowledge();
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return this.knowledgeItems.filter(item => {
      const searchableContent = [
        item.title,
        item.content,
        item.section,
        item.category,
        ...item.keywords
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchableContent.includes(term));
    }).sort((a, b) => {
      // Score items by relevance
      const scoreA = this.calculateRelevanceScore(a, searchTerms);
      const scoreB = this.calculateRelevanceScore(b, searchTerms);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(item: COYNKnowledgeItem, searchTerms: string[]): number {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const keywordsLower = item.keywords.join(' ').toLowerCase();
    
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) score += 10;
      if (keywordsLower.includes(term)) score += 5;
      if (contentLower.includes(term)) score += 1;
    });
    
    return score;
  }

  public getKnowledgeByCategory(category: COYNKnowledgeItem['category']): COYNKnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }

  public getKnowledgeById(id: string): COYNKnowledgeItem | undefined {
    return this.knowledgeItems.find(item => item.id === id);
  }

  public addKnowledgeItem(item: COYNKnowledgeItem): void {
    this.knowledgeItems.push(item);
  }

  public updateKnowledgeItem(id: string, updates: Partial<COYNKnowledgeItem>): boolean {
    const index = this.knowledgeItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.knowledgeItems[index] = { ...this.knowledgeItems[index], ...updates };
      return true;
    }
    return false;
  }

  public getKnowledgeStats(): {
    totalItems: number;
    categoryCounts: Record<string, number>;
    sections: string[];
  } {
    const categoryCounts: Record<string, number> = {};
    const sections = new Set<string>();
    
    this.knowledgeItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      sections.add(item.section);
    });
    
    return {
      totalItems: this.knowledgeItems.length,
      categoryCounts,
      sections: Array.from(sections).sort()
    };
  }
}
