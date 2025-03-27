import { useState, useEffect } from "react";
import { HSCode } from "../global";

interface HSCodeRaw {
  section: string;
  hscode: string;
  description: string;
  parent: string;
  level: string;
}

interface HSCodeSection {
  section: string;
  name: string;
}

export function useHSCodes() {
  const [hsCodes, setHSCodes] = useState<HSCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHSCodes = async () => {
      try {
        const [hsCodesResponse, sectionsResponse] = await Promise.all([
          fetch("/src/data/HSCode.csv"),
          fetch("/src/data/HSCodeSections.csv"),
        ]);

        if (!hsCodesResponse.ok || !sectionsResponse.ok) {
          throw new Error("Failed to fetch HS code data");
        }

        const hsCodesText = await hsCodesResponse.text();
        const sectionsText = await sectionsResponse.text();

        const parsedHSCodes = parseCSV<HSCodeRaw>(hsCodesText);
        const parsedSections = parseCSV<HSCodeSection>(sectionsText);

        const sectionsMap = new Map<string, string>();
        parsedSections.forEach((section) => {
          sectionsMap.set(section.section, section.name);
        });

        const formattedCodes: HSCode[] = parsedHSCodes
          .filter((code) => code.level === "6")
          .map((code) => ({
            code: code.hscode,
            description: `${code.description} (${code.hscode})`,
          }))
          .sort((a, b) => a.code.localeCompare(b.code));

        setHSCodes(formattedCodes);
        setLoading(false);
      } catch (err) {
        console.error("HS Codes Fetch Error:", err);

        const fallbackHSCodes: HSCode[] = [
          {
            code: "8471.30",
            description:
              "Portable automatic data processing machines (8471.30)",
          },
          {
            code: "8517.12",
            description: "Mobile phones and smartphones (8517.12)",
          },
          {
            code: "8528.72",
            description: "Television reception apparatus, color (8528.72)",
          },
          {
            code: "8542.31",
            description:
              "Electronic integrated circuits - processors and controllers (8542.31)",
          },
          {
            code: "8703.23",
            description: "Motor vehicles with spark-ignition engine (8703.23)",
          },
          {
            code: "8708.29",
            description: "Parts and accessories of motor vehicles (8708.29)",
          },
          {
            code: "9013.80",
            description:
              "Liquid crystal devices and optical appliances (9013.80)",
          },
          {
            code: "9504.50",
            description: "Video game consoles and machines (9504.50)",
          },
          {
            code: "6110.20",
            description: "Sweaters, pullovers, sweatshirts of cotton (6110.20)",
          },
          {
            code: "6204.43",
            description:
              "Women's or girls' dresses of synthetic fibers (6204.43)",
          },
        ];

        setHSCodes(fallbackHSCodes);
        setError(
          "Failed to load HS codes from CSV files. Using fallback list."
        );
        setLoading(false);
      }
    };

    fetchHSCodes();
  }, []);

  function parseCSV<T>(csvText: string): T[] {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");

    return lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const values = line.split(",");
        const entry = {} as T;

        headers.forEach((header, index) => {
          let value = values[index] || "";

          if (value.startsWith('"') && !value.endsWith('"')) {
            let j = index + 1;
            while (j < values.length) {
              value += "," + values[j];
              if (values[j].endsWith('"')) break;
              j++;
            }
            value = value.replace(/^"|"$/g, "");
          }

          (entry as any)[header] = value;
        });

        return entry;
      });
  }

  return { hsCodes, loading, error };
}
