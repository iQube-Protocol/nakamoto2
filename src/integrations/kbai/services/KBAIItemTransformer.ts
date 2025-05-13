
import { KBAIKnowledgeItem } from '../types';

/**
 * Service for transforming KBAI items
 */
export class KBAIItemTransformer {
  /**
   * Transform raw knowledge item from KBAI format
   */
  public transformKnowledgeItem(item: any): KBAIKnowledgeItem {
    return {
      id: item.id || `kb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title || 'Untitled Knowledge Item',
      content: item.content || item.text || '',
      type: item.type || 'general',
      source: item.source || 'KBAI',
      relevance: item.relevance || item.score || 0.5,
      timestamp: item.timestamp || new Date().toISOString()
    };
  }
}
