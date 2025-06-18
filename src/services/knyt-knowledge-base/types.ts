
export interface KNYTKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  source: string;
  section: string;
  connections: string[];
  type: string;
}

export interface KNYTKnowledgeSection {
  title: string;
  items: KNYTKnowledgeItem[];
}

export interface KNYTSearchResult {
  items: KNYTKnowledgeItem[];
  totalResults: number;
  searchTerm: string;
}
