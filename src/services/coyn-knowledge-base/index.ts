
export type { COYNKnowledgeItem } from './types';
export { COYNKnowledgeBase } from './COYNKnowledgeBase';
export { COYN_KNOWLEDGE_DATA } from './knowledge-data';

// Create and export the singleton instance
import { COYNKnowledgeBase } from './COYNKnowledgeBase';
export const coynKB = COYNKnowledgeBase.getInstance();
