import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
// import { SocialTile } from './components/SocialTile';
import SocialTile from './components/SocialTile';  // ✅ Correct

import type { SearchResults } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    twitter: [],
    reddit: [],
    youtube: [],
    linkedin: [],
  });

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);

      // Save search to Supabase
      await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Error fetching social media data:', error);
      setResults({ twitter: [], reddit: [], youtube: [], linkedin: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SocialTile platform="twitter" posts={results.twitter} isLoading={isLoading} />
          <SocialTile platform="reddit" posts={results.reddit} isLoading={isLoading} />
          <SocialTile platform="youtube" posts={results.youtube} isLoading={isLoading} />
          <SocialTile platform="linkedin" posts={results.linkedin} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default App;
