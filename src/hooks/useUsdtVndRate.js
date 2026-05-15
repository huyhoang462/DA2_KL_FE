import { useQuery } from '@tanstack/react-query';
import { getUsdtVndRate } from '../services/exchangeRateService';

export default function useUsdtVndRate({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['exchangeRate', 'USDT', 'VND'],
    queryFn: ({ signal }) => getUsdtVndRate({ signal }),
    enabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
