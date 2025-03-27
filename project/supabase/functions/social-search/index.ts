import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchRedditPosts(query: string) {
  try {
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=3&t=day`,
      {
        headers: {
          'User-Agent': 'Social Search/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.data?.children || []).map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      content: post.data.selftext || `${post.data.subreddit_name_prefixed} - ${post.data.score} points`,
      author: post.data.author,
      timestamp: new Date(post.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${post.data.permalink}`,
      platform: 'reddit',
      metadata: {
        score: post.data.score,
        subreddit: post.data.subreddit_name_prefixed,
        numComments: post.data.num_comments
      }
    }));
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
}

async function fetchTwitterAlternative(query: string) {
  try {
    // Using Mastodon public timeline search as Twitter alternative
    const response = await fetch(
      `https://mastodon.social/api/v2/search?q=${encodeURIComponent(query)}&type=statuses&limit=3`,
      {
        headers: {
          'User-Agent': 'Social Search/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Mastodon API error: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.statuses || []).map((post: any) => ({
      id: post.id,
      title: post.account.display_name,
      content: post.content.replace(/<[^>]*>/g, ''), // Remove HTML tags
      author: `@${post.account.username}`,
      timestamp: post.created_at,
      url: post.url,
      platform: 'twitter',
      metadata: {
        reblogs: post.reblogs_count,
        favorites: post.favourites_count
      }
    }));
  } catch (error) {
    console.error('Mastodon API error:', error);
    return [];
  }
}

async function fetchYouTubeVideos(query: string) {
  try {
    // Using PeerTube as YouTube alternative
    const response = await fetch(
      `https://tube.tchncs.de/api/v1/search/videos?search=${encodeURIComponent(query)}&sort=-publishedAt&count=3`,
      {
        headers: {
          'User-Agent': 'Social Search/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`PeerTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.data || []).map((video: any) => ({
      id: video.uuid,
      title: video.name,
      content: video.description,
      author: video.channel.name,
      timestamp: video.publishedAt,
      url: `https://tube.tchncs.de/videos/watch/${video.uuid}`,
      platform: 'youtube',
      metadata: {
        views: video.views,
        duration: video.duration,
        thumbnail: video.thumbnailUrl
      }
    }));
  } catch (error) {
    console.error('PeerTube API error:', error);
    return [];
  }
}

async function fetchGitHubDiscussions(query: string) {
  try {
    const response = await fetch(
      `https://api.github.com/search/discussions?q=${encodeURIComponent(query)}+created:>=${new Date(Date.now() - 86400000).toISOString().split('T')[0]}&sort=reactions&order=desc`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Social Search/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.items || []).slice(0, 3).map((discussion: any) => ({
      id: discussion.node_id,
      title: discussion.title,
      content: `${discussion.repository.full_name} - ${discussion.category.name}`,
      author: discussion.user.login,
      timestamp: discussion.created_at,
      url: discussion.html_url,
      platform: 'linkedin',
      metadata: {
        repository: discussion.repository.full_name,
        category: discussion.category.name,
        answers: discussion.answer_count || 0
      }
    }));
  } catch (error) {
    console.error('GitHub API error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch data from all platforms concurrently
    const [twitter, reddit, youtube, linkedin] = await Promise.all([
      fetchTwitterAlternative(query),  // Mastodon posts as Twitter replacement
      fetchRedditPosts(query),         // Reddit posts
      fetchYouTubeVideos(query),       // PeerTube videos as YouTube replacement
      fetchGitHubDiscussions(query)    // GitHub discussions as LinkedIn replacement
    ]);

    const results = {
      twitter,
      reddit,
      youtube,
      linkedin
    };

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        twitter: [],
        reddit: [],
        youtube: [],
        linkedin: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});