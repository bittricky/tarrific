export interface TariffCalculation {
  productName: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  currentTariffRate: number;
  proposedTariffRate: number;
  shippingCost: number;
  logisticsCost: number;
  additionalDuties: number;
}

export interface CalculationResult {
  importValue: number;
  currentTariffAmount: number;
  proposedTariffAmount: number;
  currentLandedCost: number;
  proposedLandedCost: number;
  tariffImpact: number;
  percentageIncrease: number;
}

export interface Country {
  name: string;
  code: string;
  currency: string;
  flag: string;
}

export interface HSCode {
  code: string;
  description: string;
}
