
export type { MetaKnytsKnowledgeItem } from './types';
export { MetaKnytsKnowledgeBase } from './MetaKnytsKnowledgeBase';
export { METAKNYTS_KNOWLEDGE_DATA } from './knowledge-data';

// Create and export the singleton instance
import { MetaKnytsKnowledgeBase } from './MetaKnytsKnowledgeBase';
export const metaKnytsKB = MetaKnytsKnowledgeBase.getInstance();
