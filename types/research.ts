export interface ResearchSource {
  title: string;
  url: string;
  publisher: string;
  type: 'article' | 'textbook' | 'video' | 'website';
}

export interface ResearchHistoryItem {
  id: string;
  subject: string;
  queryText: string;
  response: string;
  sources: ResearchSource[];
  createdAt: string;
}
