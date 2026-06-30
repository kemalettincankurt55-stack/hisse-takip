/**
 * useWeeklyMovers
 * Hisse evreni için haftalık en çok yükselen/düşen listelerini yükler.
 */

import { useState, useEffect } from 'react';
import { StockData } from '../store/stockStore';
import { getBistMovers, WeeklyMovers } from '../services/api/movers';

interface Result extends WeeklyMovers {
  isLoading: boolean;
  loaded: boolean;
}

/**
 * Tüm BIST evreni üzerinde haftalık en çok yükselen/düşenler.
 * `nameSource` yalnızca bilinen hisselerin adlarını göstermek için kullanılır.
 */
export const useWeeklyMovers = (nameSource: StockData[], limit = 5): Result => {
  const [gainers, setGainers] = useState<StockData[]>([]);
  const [losers, setLosers] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const data = await getBistMovers(nameSource, limit);
      if (cancelled) return;
      setGainers(data.gainers);
      setLosers(data.losers);
      setIsLoading(false);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { gainers, losers, isLoading, loaded };
};

export default useWeeklyMovers;
