
export type { iQubesKnowledgeItem } from './types';
export { iQubesKnowledgeBase } from './iQubesKnowledgeBase';
export { IQUBES_KNOWLEDGE_DATA } from './knowledge-data';

// Create and export the singleton instance
import { iQubesKnowledgeBase } from './iQubesKnowledgeBase';
export const iQubesKB = iQubesKnowledgeBase.getInstance();
