import { NextApiRequest, NextApiResponse } from 'next';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!TWITTER_BEARER_TOKEN) {
  throw new Error('Missing TWITTER_BEARER_TOKEN in environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=created_at,author_id`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = await response.text();
    console.log("Twitter API Raw Response:", text); // Debugging output
    
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return res.status(500).json({ error: 'Invalid JSON response from Twitter API' });
    }
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
