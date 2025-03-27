export interface SocialPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  url: string;
  platform: 'twitter' | 'reddit' | 'youtube' | 'linkedin';
  metadata?: {
    score?: number;
    numComments?: number;
    views?: number;
    subreddit?: string;
    points?: number;
    comments?: number;
    repository?: string;
    category?: string;
    answers?: number;
    thumbnail?: string;
    duration?: number;
    reblogs?: number;
    favorites?: number;
  };
}