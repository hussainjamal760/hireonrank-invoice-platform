import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function useCurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number> | null>(cachedRates);
  const [loading, setLoading] = useState<boolean>(!cachedRates);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const now = Date.now();
      if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
        setRates(cachedRates);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        cachedRates = data.rates;
        lastFetchTime = now;
        setRates(data.rates);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convert = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    if (!rates || !amount) return amount;
    
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // Convert to USD first (base), then to target currency
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  }, [rates]);

  const formatCurrency = useCallback((amount: number, currency: string, compact: boolean = false) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: compact ? 1 : 2,
      notation: compact ? "compact" : "standard",
    }).format(amount);
  }, []);

  return {
    rates,
    loading,
    error,
    convert,
    formatCurrency,
  };
}
