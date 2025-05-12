
import { KBAIKnowledgeItem } from './types';

/**
 * Get fallback knowledge items when KBAI is unavailable
 */
export function getFallbackItems(): KBAIKnowledgeItem[] {
  return [
    {
      id: 'fallback-1',
      title: 'Introduction to Web3',
      content: 'Web3 represents the next evolution of the internet, focusing on decentralization, blockchain technology, and token-based economics.',
      type: 'concept',
      source: 'Local',
      relevance: 0.9,
      timestamp: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      title: 'Smart Contracts',
      content: 'Smart contracts are self-executing contracts with the terms directly written into code. They automatically execute when predetermined conditions are met.',
      type: 'concept',
      source: 'Local',
      relevance: 0.8,
      timestamp: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      title: 'Cryptocurrency Basics',
      content: 'Cryptocurrencies are digital or virtual currencies that use cryptography for security and operate on decentralized networks based on blockchain technology.',
      type: 'guide',
      source: 'Local',
      relevance: 0.7,
      timestamp: new Date().toISOString()
    }
  ];
}
