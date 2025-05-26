
import { MetaKnytsKnowledgeItem } from './types';
import { METAKNYTS_KNOWLEDGE_DATA } from './knowledge-data';

export class MetaKnytsKnowledgeBase {
  private static instance: MetaKnytsKnowledgeBase;
  private knowledgeItems: MetaKnytsKnowledgeItem[];

  private constructor() {
    this.knowledgeItems = [...METAKNYTS_KNOWLEDGE_DATA];
  }

  public static getInstance(): MetaKnytsKnowledgeBase {
    if (!MetaKnytsKnowledgeBase.instance) {
      MetaKnytsKnowledgeBase.instance = new MetaKnytsKnowledgeBase();
    }
    return MetaKnytsKnowledgeBase.instance;
  }

  public getAllKnowledge(): MetaKnytsKnowledgeItem[] {
    return [...this.knowledgeItems];
  }

  public searchKnowledge(query: string): MetaKnytsKnowledgeItem[] {
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

  private calculateRelevanceScore(item: MetaKnytsKnowledgeItem, searchTerms: string[]): number {
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

  public getKnowledgeByCategory(category: MetaKnytsKnowledgeItem['category']): MetaKnytsKnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }

  public getKnowledgeById(id: string): MetaKnytsKnowledgeItem | undefined {
    return this.knowledgeItems.find(item => item.id === id);
  }

  public getConnectedQryptoItems(metaKnytsId: string): string[] {
    const item = this.getKnowledgeById(metaKnytsId);
    return item?.connections || [];
  }

  public addKnowledgeItem(item: MetaKnytsKnowledgeItem): void {
    this.knowledgeItems.push(item);
  }

  public updateKnowledgeItem(id: string, updates: Partial<MetaKnytsKnowledgeItem>): boolean {
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
