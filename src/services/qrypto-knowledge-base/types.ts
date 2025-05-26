
export interface QryptoKnowledgeItem {
  id: string;
  title: string;
  content: string;
  section: string;
  category: 'tokenomics' | 'protocols' | 'consensus' | 'economics' | 'mechanics' | 'technical' | 'legal' | 'implementation';
  keywords: string[];
  timestamp: string;
  source: string;
}
