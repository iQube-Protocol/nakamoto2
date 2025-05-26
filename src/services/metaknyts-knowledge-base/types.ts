
export interface MetaKnytsKnowledgeItem {
  id: string;
  title: string;
  content: string;
  section: string;
  category: 'worldbuilding' | 'characters' | 'technology' | 'philosophy' | 'narrative' | 'economics' | 'education';
  keywords: string[];
  timestamp: string;
  source: string;
  connections?: string[]; // IDs of related Qrypto COYN knowledge items
}
