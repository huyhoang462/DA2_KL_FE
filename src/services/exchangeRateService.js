import axios from 'axios';

const COINGECKO_SIMPLE_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price';

export async function getUsdtVndRate({ signal } = {}) {
  const response = await axios.get(COINGECKO_SIMPLE_PRICE_URL, {
    signal,
    params: {
      ids: 'tether',
      vs_currencies: 'vnd',
    },
  });

  const rate = response.data?.tether?.vnd;

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('Invalid USDT/VND exchange rate');
  }

  return rate;
}
