import { useState, useEffect } from "react";
import { Country } from "../global";

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        const formattedCountries = data.map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
          currency: Object.keys(country.currencies || {})[0] || "",
          flag: country.flags.svg,
        }));

        setCountries(
          formattedCountries.sort((a: Country, b: Country) =>
            a.name.localeCompare(b.name)
          )
        );
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch countries");
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  return { countries, loading, error };
}
