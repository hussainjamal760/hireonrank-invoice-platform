

let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getRates = async (): Promise<Record<string, number>> => {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    cachedRates = data.rates;
    lastFetchTime = now;
    return cachedRates || {};
  } catch (err) {
    console.error('Failed to fetch currency rates', err);
    return cachedRates || { USD: 1 };
  }
};

export const convertToUSD = async (amount: number, fromCurrency: string = 'USD'): Promise<number> => {
  if (!amount) return 0;
  if (fromCurrency === 'USD') return amount;
  
  const rates = await getRates();
  const rate = rates[fromCurrency];
  if (!rate) return amount; 

  return amount / rate;
};
