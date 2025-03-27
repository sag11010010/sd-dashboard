import React from 'react';
import { Twitter, Edit as Reddit, Youtube, Linkedin } from 'lucide-react';
import { SocialPost } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface SocialTileProps {
  platform: 'twitter' | 'reddit' | 'youtube' | 'linkedin';
  posts: SocialPost[];
  isLoading: boolean;
}

const platformConfig = {
  twitter: {
    icon: Twitter,
    color: 'bg-blue-500',
    name: 'Twitter', // Updated name since we're using Mastodon
  },
  reddit: {
    icon: Reddit,
    color: 'bg-orange-500',
    name: 'Reddit',
  },
  youtube: {
    icon: Youtube,
    color: 'bg-red-500',
    name: 'PeerTube', // Updated name since we're using PeerTube
  },
  linkedin: {
    icon: Linkedin,
    color: 'bg-blue-700',
    name: 'GitHub Discussions',
  },
};

export function SocialTile({ platform, posts = [], isLoading }: SocialTileProps) {
  const config = platformConfig[platform];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <config.icon className={`text-white p-1 rounded ${config.color}`} size={24} />
        <h2 className="text-lg font-semibold">{config.name}</h2>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : Array.isArray(posts) && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{post.author}</span>
                <span>{formatDistanceToNow(new Date(post.timestamp))} ago</span>
              </div>
              {post.metadata && (
                <div className="mt-2 text-xs text-gray-500 flex gap-2">
                  {post.metadata.score && (
                    <span>👍 {post.metadata.score}</span>
                  )}
                  {post.metadata.reblogs && (
                    <span>🔄 {post.metadata.reblogs}</span>
                  )}
                  {post.metadata.favorites && (
                    <span>⭐ {post.metadata.favorites}</span>
                  )}
                  {post.metadata.views && (
                    <span>👁️ {post.metadata.views}</span>
                  )}
                  {post.metadata.numComments && (
                    <span>💬 {post.metadata.numComments}</span>
                  )}
                </div>
              )}
              {platform === 'youtube' && post.metadata?.thumbnail && (
                <img 
                  src={post.metadata.thumbnail} 
                  alt={post.title}
                  className="mt-2 rounded-md w-full h-32 object-cover"
                />
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No posts found. Try searching for something!
        </div>
      )}
    </div>
  );
}

export default SocialTile