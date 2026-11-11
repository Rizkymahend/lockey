import { useState, useEffect } from 'react';

// Fallback constant in case network request fails
const FALLBACK_ETH_PRICE = 2510;

export function useEthPrice() {
  const [ethPriceUsd, setEthPriceUsd] = useState<number>(FALLBACK_ETH_PRICE);

  useEffect(() => {
    let isMounted = true;

    async function fetchPrice() {
      // fetched by our server: exchange APIs are blocked on some networks
      try {
        const res = await fetch('/api/eth-price', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const p = Number(data.price);
          if (p > 0 && isMounted) setEthPriceUsd(p);
        }
      } catch {
        // keep the last price
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return ethPriceUsd;
}

export function formatUsd(val: number): string {
  if (!val || isNaN(val) || val <= 0) return '$0.00';
  if (val >= 1_000_000) {
    return '$' + (val / 1_000_000).toFixed(2) + 'M';
  }
  if (val >= 1_000) {
    return '$' + (val / 1_000).toFixed(2) + 'K';
  }
  if (val >= 1) {
    return '$' + val.toFixed(2);
  }
  if (val >= 0.0001) {
    return '$' + val.toFixed(4);
  }
  return '$' + val.toFixed(7);
}
