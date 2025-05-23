import { useState } from "react";
import { Calculator, DollarSign, FileSpreadsheet, Loader } from "lucide-react";
import { TariffCalculation, CalculationResult } from "../global";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useCountries } from "../hooks/useCountries";
import { useHSCodes } from "../hooks/useHSCodes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";

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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="text-center mb-12 bg-transparent border-0 shadow-none">
          <CardContent className="pt-6">
            <Calculator className="mx-auto h-12 w-12 text-primary-600" />
            <CardTitle className="mt-4 text-4xl font-bold text-slate-900">
              Tariff Calculator
            </CardTitle>
            <p className="mt-2 text-lg text-slate-600">
              Calculate the impact of tariff changes on your imports
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            <span className="ml-2 text-lg text-slate-700">Loading data...</span>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-md p-6 mb-8">
            {validationError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative">
                {validationError}
              </div>
            )}
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                calculateTariffs();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <FormField name="productName" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Product Name
                  </FormLabel>
                  <FormControl asChild>
                    <Input
                      type="text"
                      value={calculation.productName}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          productName: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </FormControl>
                  {!calculation.productName && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      Product name is required
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="hsCode" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    HS Code
                  </FormLabel>
                  <div>
                    <select
                      value={calculation.hsCode}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCalculation({
                          ...calculation,
                          hsCode: value,
                        });
                      }}
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select HS Code</option>
                      {hsCodes.map((code) => (
                        <option key={code.code} value={code.code}>
                          {code.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!calculation.hsCode && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      HS Code is required
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="originCountry" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Origin Country
                  </FormLabel>
                  <div>
                    <select
                      value={calculation.originCountry}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCalculation({
                          ...calculation,
                          originCountry: value,
                        });
                      }}
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!calculation.originCountry && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      Origin country is required
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="quantity" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Quantity
                  </FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="1"
                      value={
                        calculation.quantity === 0 ? "" : calculation.quantity
                      }
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </FormControl>
                  {calculation.quantity <= 0 && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      Quantity must be greater than 0
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="unitPrice" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Unit Price
                  </FormLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </span>
                    <FormControl asChild>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="pl-10 w-full h-10 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={
                          calculation.unitPrice === 0
                            ? ""
                            : calculation.unitPrice
                        }
                        onChange={(e) =>
                          setCalculation({
                            ...calculation,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </FormControl>
                  </div>
                  {calculation.unitPrice <= 0 && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      Unit price must be greater than 0
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="currency" className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Currency
                  </FormLabel>
                  <div>
                    <select
                      value={calculation.currency}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCalculation({
                          ...calculation,
                          currency: value,
                        });
                      }}
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      {rates &&
                        Object.keys(rates).map((currency) =>
                          currency !== "USD" ? (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ) : null
                        )}
                    </select>
                  </div>
                </FormField>

                <FormField name="destinationCountry" className="space-y-2">
                  <FormLabel>Destination Country</FormLabel>
                  <div>
                    <select
                      value={calculation.destinationCountry}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCalculation({
                          ...calculation,
                          destinationCountry: value,
                        });
                      }}
                      className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!calculation.destinationCountry && validationError && (
                    <FormMessage className="text-sm font-medium text-red-500 mt-1">
                      Destination country is required
                    </FormMessage>
                  )}
                </FormField>

                <FormField name="currentTariffRate" className="space-y-2">
                  <FormLabel>Current Tariff Rate (%)</FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={calculation.currentTariffRate}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          currentTariffRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    />
                  </FormControl>
                </FormField>

                <FormField name="proposedTariffRate" className="space-y-2">
                  <FormLabel>Proposed Tariff Rate (%)</FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={calculation.proposedTariffRate}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          proposedTariffRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    />
                  </FormControl>
                </FormField>

                <FormField name="shippingCost" className="space-y-2">
                  <FormLabel>Shipping Cost</FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={calculation.shippingCost}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          shippingCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    />
                  </FormControl>
                </FormField>

                <FormField name="logisticsCost" className="space-y-2">
                  <FormLabel>Logistics Cost</FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={calculation.logisticsCost}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          logisticsCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    />
                  </FormControl>
                </FormField>

                <FormField name="additionalDuties" className="space-y-2">
                  <FormLabel>Additional Duties</FormLabel>
                  <FormControl asChild>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={calculation.additionalDuties}
                      onChange={(e) =>
                        setCalculation({
                          ...calculation,
                          additionalDuties: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    />
                  </FormControl>
                </FormField>
              </div>
              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={isCalculating}
                  variant="default"
                  className="w-full h-10 bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  {isCalculating ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate Impact"
                  )}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {result && (
          <Card className="shadow-sm border border-slate-200 mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Import Value
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      ${result.importValue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Current Landed Cost
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      ${result.currentLandedCost.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Proposed Landed Cost
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      ${result.proposedLandedCost.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-slate-500">
                      Cost Increase
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-primary-600">
                      {result.percentageIncrease.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={downloadCSV}
                variant="outline"
                className="h-9 px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span>Download CSV</span>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

TariffCalculator.displayName = "TariffCalculator";

export default TariffCalculator;
