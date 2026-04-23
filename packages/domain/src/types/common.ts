export const currencies = ['EUR'] as const;
export type CurrencyCode = (typeof currencies)[number];

export const retentionPreferences = ['session_only', 'save_analysis'] as const;
export type RetentionPreference = (typeof retentionPreferences)[number];

export const dataQualityStatuses = ['complete', 'conditional_estimate', 'blocked'] as const;
export type DataQualityStatus = (typeof dataQualityStatuses)[number];

export const sourceTypes = ['user_provided', 'inferred', 'calculated'] as const;
export type SourceType = (typeof sourceTypes)[number];

export const scenarioTypes = [
  'current',
  'alternative_without_bonus',
  'alternative_with_bonus',
] as const;
export type ScenarioType = (typeof scenarioTypes)[number];

export const loanPurposes = ['current_mortgage', 'switch_offer'] as const;
export type LoanPurpose = (typeof loanPurposes)[number];

export const costTypes = [
  'agency',
  'notary',
  'appraisal',
  'management',
  'cancellation_fee',
  'opening_fee',
  'insurance',
  'linked_product',
  'other',
] as const;
export type CostType = (typeof costTypes)[number];

export const costTimings = ['upfront', 'monthly', 'annual', 'one_off_switch'] as const;
export type CostTiming = (typeof costTimings)[number];

export const incomeStabilities = ['stable', 'variable', 'unknown'] as const;
export type IncomeStability = (typeof incomeStabilities)[number];

export const affordabilityClassifications = [
  'asumible',
  'ajustada',
  'no_asumible',
  'insufficient_data',
] as const;
export type AffordabilityClassification = (typeof affordabilityClassifications)[number];

export const recommendedActions = [
  'keep_current',
  'switch_without_bonus',
  'switch_with_bonus',
  'insufficient_data',
] as const;
export type RecommendedAction = (typeof recommendedActions)[number];

export const validationSeverities = ['warning', 'blocking'] as const;
export type ValidationSeverity = (typeof validationSeverities)[number];

export type MoneyString = string;
export type PercentageString = string;

export interface RuleReference {
  id: string;
  version: string;
}
