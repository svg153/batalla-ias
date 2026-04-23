import type { ExplainableValue } from '../explainability/explainable-value';
import type {
  CostTiming,
  CostType,
  DataQualityStatus,
  LoanPurpose,
  MoneyString,
  PercentageString,
  ScenarioType,
  SourceType,
} from './common';

export interface AssociatedCostInput {
  costType: CostType;
  timing: CostTiming;
  amount: MoneyString;
  includedInTotalCost?: boolean;
  description?: string;
  sourceType?: SourceType;
}

export interface AssociatedCost {
  costType: CostType;
  timing: CostTiming;
  amount: MoneyString;
  includedInTotalCost: boolean;
  description?: string;
  sourceType: SourceType;
}

export interface MortgageTermsInput {
  pendingPrincipal: MoneyString;
  remainingMonths: number;
  nominalAnnualRate: PercentageString;
  recurringCosts?: ReadonlyArray<AssociatedCostInput>;
  assumptions?: ReadonlyArray<string>;
}

export interface CurrentMortgageInput extends MortgageTermsInput {
  currentInstallment?: MoneyString;
}

export interface OfferVariantInput extends MortgageTermsInput {
  linkedProductsMonthlyCost?: MoneyString;
  bonificationRateDelta?: PercentageString;
}

export interface AlternativeOfferInput {
  withoutBonus: OfferVariantInput;
  withBonus?: OfferVariantInput;
}

export interface ScenarioCostBreakdownLine extends AssociatedCost {
  totalAmount: MoneyString;
  periodsApplied?: number;
}

export interface ScenarioComputedValues {
  monthlyInstallment: MoneyString;
  monthlyInstallmentRaw: MoneyString;
  interestPaid: MoneyString;
  principalRepaid: MoneyString;
  remainingBalanceAfterHorizon: MoneyString;
  totalRealCost: MoneyString;
  finalAmountPaid: MoneyString;
}

export interface MortgageScenario extends ScenarioComputedValues {
  scenarioType: ScenarioType;
  loanPurpose: LoanPurpose;
  pendingPrincipal: MoneyString;
  remainingMonths: number;
  nominalAnnualRate: PercentageString;
  currentInstallment?: MoneyString;
  linkedProductsMonthlyCost?: MoneyString;
  bonificationRateDelta?: PercentageString;
  costBreakdown: ReadonlyArray<ScenarioCostBreakdownLine>;
  inputs: ReadonlyArray<ExplainableValue>;
  triggeredRules: ReadonlyArray<string>;
  assumptions: ReadonlyArray<string>;
  dataQualityStatus: DataQualityStatus;
}
