import type {
  AffordabilityClassification,
  DataQualityStatus,
  IncomeStability,
  MoneyString,
  PercentageString,
  ScenarioType,
} from './common';

export interface HouseholdProfileInput {
  netMonthlyIncome: MoneyString;
  monthlyObligations: MoneyString;
  incomeStability?: IncomeStability;
  notes?: string;
}

export interface HouseholdProfile extends HouseholdProfileInput {
  dataQualityStatus: DataQualityStatus;
  assumptions: ReadonlyArray<string>;
}

export interface AffordabilityEvaluation {
  scenarioType: ScenarioType;
  monthlyPaymentConsidered: MoneyString;
  netMonthlyIncome: MoneyString;
  monthlyObligations: MoneyString;
  debtRatio: PercentageString;
  classification: AffordabilityClassification;
  explanation: string;
  assumptions: ReadonlyArray<string>;
  triggeredRules: ReadonlyArray<string>;
  qualityStatus: DataQualityStatus;
}
