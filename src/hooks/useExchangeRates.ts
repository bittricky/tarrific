import { useState, useEffect } from "react";

export function useExchangeRates() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch("https://api.exchangerate.host/latest");
        const data = await response.json();
        setRates(data.rates);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch exchange rates");
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  const convert = (amount: number, from: string, to: string): number => {
    if (!rates[from] || !rates[to]) return amount;
    return (amount / rates[from]) * rates[to];
  };

  return { rates, loading, error, convert };
}
