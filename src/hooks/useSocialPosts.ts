/**
 * useSocialPosts
 * Bir sembol için sosyal medya gönderilerini (StockTwits/Reddit) proxy üzerinden yükler.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSocialPosts, SocialPost } from '../services/social/socialFeed';

interface Result {
  posts: SocialPost[];
  isLoading: boolean;
  loaded: boolean;
  reload: () => void;
}

export const useSocialPosts = (symbol: string | null | undefined): Result => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (sym: string) => {
    setIsLoading(true);
    setLoaded(false);
    const data = await getSocialPosts(sym);
    setPosts(data);
    setIsLoading(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!symbol) {
      setPosts([]);
      setLoaded(false);
      return;
    }
    void load(symbol);
  }, [symbol, load]);

  const reload = useCallback(() => {
    if (symbol) void load(symbol);
  }, [symbol, load]);

  return { posts, isLoading, loaded, reload };
};

export default useSocialPosts;
