
export { QryptoKnowledgeItem } from './types';
export { QryptoKnowledgeBase } from './QryptoKnowledgeBase';
export { QRYPTO_KNOWLEDGE_DATA } from './knowledge-data';

// Create and export the singleton instance
import { QryptoKnowledgeBase } from './QryptoKnowledgeBase';
export const qryptoKB = QryptoKnowledgeBase.getInstance();
