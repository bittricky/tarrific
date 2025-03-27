import { useState } from "react";
import { Calculator, DollarSign, FileSpreadsheet, Loader } from "lucide-react";
import { TariffCalculation, CalculationResult } from "../global";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useCountries } from "../hooks/useCountries";
import { useHSCodes } from "../hooks/useHSCodes";

const initialCalculation: TariffCalculation = {
  productName: "",
  hsCode: "",
  originCountry: "",
  destinationCountry: "",
  quantity: 0,
  unitPrice: 0,
  currency: "USD",
  currentTariffRate: 0,
  proposedTariffRate: 0,
  shippingCost: 0,
  logisticsCost: 0,
  additionalDuties: 0,
};

const TariffCalculator = () => {
  const [calculation, setCalculation] =
    useState<TariffCalculation>(initialCalculation);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { rates, convert, loading: ratesLoading } = useExchangeRates();
  const { countries, loading: countriesLoading } = useCountries();
  const { hsCodes, loading: hsCodesLoading } = useHSCodes();

  const isLoading = ratesLoading || countriesLoading || hsCodesLoading;

  const validateInputs = () => {
    if (!calculation.productName) return "Product name is required";
    if (!calculation.hsCode) return "HS Code is required";
    if (!calculation.originCountry) return "Origin country is required";
    if (!calculation.destinationCountry)
      return "Destination country is required";
    if (calculation.quantity <= 0) return "Quantity must be greater than 0";
    if (calculation.unitPrice <= 0) return "Unit price must be greater than 0";
    return null;
  };

  const calculateTariffs = () => {
    const error = validateInputs();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setIsCalculating(true);

    const convertedUnitPrice =
      calculation.currency !== "USD"
        ? convert(calculation.unitPrice, calculation.currency, "USD")
        : calculation.unitPrice;

    const convertedShippingCost =
      calculation.currency !== "USD"
        ? convert(calculation.shippingCost, calculation.currency, "USD")
        : calculation.shippingCost;

    const convertedLogisticsCost =
      calculation.currency !== "USD"
        ? convert(calculation.logisticsCost, calculation.currency, "USD")
        : calculation.logisticsCost;

    const convertedAdditionalDuties =
      calculation.currency !== "USD"
        ? convert(calculation.additionalDuties, calculation.currency, "USD")
        : calculation.additionalDuties;

    const importValue = calculation.quantity * convertedUnitPrice;
    const currentTariffAmount =
      importValue * (calculation.currentTariffRate / 100);
    const proposedTariffAmount =
      importValue * (calculation.proposedTariffRate / 100);

    const additionalCosts =
      convertedShippingCost +
      convertedLogisticsCost +
      convertedAdditionalDuties;

    const currentLandedCost =
      importValue + currentTariffAmount + additionalCosts;
    const proposedLandedCost =
      importValue + proposedTariffAmount + additionalCosts;

    const tariffImpact = proposedLandedCost - currentLandedCost;
    const percentageIncrease = (tariffImpact / currentLandedCost) * 100;

    setTimeout(() => {
      setResult({
        importValue,
        currentTariffAmount,
        proposedTariffAmount,
        currentLandedCost,
        proposedLandedCost,
        tariffImpact,
        percentageIncrease,
      });
      setIsCalculating(false);
    }, 500);
  };

  const downloadCSV = () => {
    if (!result) return;

    const rows = [
      ["Metric", "Value"],
      ["Import Value", result.importValue.toFixed(2)],
      ["Current Tariff Amount", result.currentTariffAmount.toFixed(2)],
      ["Proposed Tariff Amount", result.proposedTariffAmount.toFixed(2)],
      ["Current Landed Cost", result.currentLandedCost.toFixed(2)],
      ["Proposed Landed Cost", result.proposedLandedCost.toFixed(2)],
      ["Tariff Impact", result.tariffImpact.toFixed(2)],
      ["Percentage Increase", `${result.percentageIncrease.toFixed(2)}%`],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tariff-calculation.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Calculator className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Tariff Calculator
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Calculate the impact of tariff changes on your imports
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-lg text-gray-600">Loading data...</span>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            {validationError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {validationError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.productName}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      productName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  HS Code
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.hsCode}
                  onChange={(e) =>
                    setCalculation({ ...calculation, hsCode: e.target.value })
                  }
                >
                  <option value="">Select HS Code</option>
                  {hsCodes.map((code) => (
                    <option key={code.code} value={code.code}>
                      {code.code} - {code.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Origin Country
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.originCountry}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      originCountry: e.target.value,
                    })
                  }
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.quantity}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={calculation.unitPrice}
                    onChange={(e) =>
                      setCalculation({
                        ...calculation,
                        unitPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.currency}
                  onChange={(e) =>
                    setCalculation({ ...calculation, currency: e.target.value })
                  }
                >
                  <option value="USD">USD - US Dollar</option>
                  {rates &&
                    Object.keys(rates).map(
                      (currency) =>
                        currency !== "USD" && (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        )
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Destination Country
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.destinationCountry}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      destinationCountry: e.target.value,
                    })
                  }
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Tariff Rate (%)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.currentTariffRate}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      currentTariffRate: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Proposed Tariff Rate (%)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.proposedTariffRate}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      proposedTariffRate: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Cost
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.shippingCost}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      shippingCost: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logistics Cost
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.logisticsCost}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      logisticsCost: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Duties
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={calculation.additionalDuties}
                  onChange={(e) =>
                    setCalculation({
                      ...calculation,
                      additionalDuties: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={calculateTariffs}
                disabled={isCalculating}
                className={`w-full flex justify-center items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isCalculating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isCalculating ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Impact"
                )}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Calculation Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Import Value
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  ${result.importValue.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Current Landed Cost
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  ${result.currentLandedCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Proposed Landed Cost
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  ${result.proposedLandedCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Cost Increase
                </h3>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {result.percentageIncrease.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={downloadCSV}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TariffCalculator.displayName = "TariffCalculator";

export default TariffCalculator;
