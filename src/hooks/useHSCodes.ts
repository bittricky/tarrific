import { useState, useEffect } from "react";
import { HSCode } from "../global";

export function useHSCodes() {
  const [hsCodes, setHSCodes] = useState<HSCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHSCodes = async () => {
      try {
        // Using the U.S. International Trade Administration's open data source
        const response = await fetch(
          "https://dataus.api.trade.gov/trade_tariff_rates?format=json&limit=10",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        const formattedCodes: HSCode[] = data
          .map((item: any) => ({
            code: item.hs_code,
            description: item.description,
          }))
          .filter((code: HSCode) => code.code && code.description);

        setHSCodes(formattedCodes);
        setLoading(false);
      } catch (err) {
        console.error("HS Codes Fetch Error:", err);

        const fallbackHSCodes: HSCode[] = [
          {
            code: "8471.30",
            description: "Portable automatic data processing machines",
          },
          { code: "8517.12", description: "Mobile phones and smartphones" },
          {
            code: "8528.72",
            description: "Television reception apparatus, color",
          },
          {
            code: "8542.31",
            description:
              "Electronic integrated circuits - processors and controllers",
          },
          {
            code: "8703.23",
            description: "Motor vehicles with spark-ignition engine",
          },
          {
            code: "8708.29",
            description: "Parts and accessories of motor vehicles",
          },
          {
            code: "9013.80",
            description: "Liquid crystal devices and optical appliances",
          },
          { code: "9504.50", description: "Video game consoles and machines" },
          {
            code: "6110.20",
            description: "Sweaters, pullovers, sweatshirts of cotton",
          },
          {
            code: "6204.43",
            description: "Women's or girls' dresses of synthetic fibers",
          },
        ];

        setHSCodes(fallbackHSCodes);
        setError(
          "Failed to fetch HS codes from public API. Using fallback list."
        );
        setLoading(false);
      }
    };

    fetchHSCodes();
  }, []);

  return { hsCodes, loading, error };
}
