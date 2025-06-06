
export interface iQubesKnowledgeItem {
  id: string;
  title: string;
  content: string;
  section: string;
  category: 'technical' | 'protocols' | 'architecture' | 'security' | 'consensus' | 'implementation';
  keywords: string[];
  timestamp: string;
  source: string;
  connections?: string[];
}
