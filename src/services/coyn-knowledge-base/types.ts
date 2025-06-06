
export interface COYNKnowledgeItem {
  id: string;
  title: string;
  content: string;
  section: string;
  category: 'tokenomics' | 'governance' | 'economics' | 'philosophy' | 'community';
  keywords: string[];
  timestamp: string;
  source: string;
  connections?: string[];
}
