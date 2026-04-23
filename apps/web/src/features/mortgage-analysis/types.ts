export type RetentionPreference = 'session_only' | 'save_analysis';
export type DataQualityStatus = 'complete' | 'conditional_estimate' | 'blocked';
export type ScenarioType =
  | 'current'
  | 'alternative_without_bonus'
  | 'alternative_with_bonus';
export type SourceType = 'user_provided' | 'inferred' | 'calculated';
export type CostTiming = 'upfront' | 'monthly' | 'annual' | 'one_off_switch';
export type CostType =
  | 'agency'
  | 'notary'
  | 'appraisal'
  | 'management'
  | 'cancellation_fee'
  | 'opening_fee'
  | 'insurance'
  | 'linked_product'
  | 'other';
export type IncomeStability = 'stable' | 'variable' | 'unknown';
export type RecommendedAction =
  | 'keep_current'
  | 'switch_without_bonus'
  | 'switch_with_bonus'
  | 'insufficient_data';
export type AffordabilityClassification =
  | 'asumible'
  | 'ajustada'
  | 'no_asumible';
export type ResultSource = 'api' | 'local_preview' | 'unavailable' | 'not_requested';
export type NoticeTone = 'info' | 'warning' | 'error';

export interface CostInput {
  costType: CostType;
  timing: CostTiming;
  amount: string;
  description?: string;
  sourceType: SourceType;
}

export interface MortgageInput {
  pendingPrincipal: string;
  remainingMonths: number;
  nominalAnnualRate: string;
  currentInstallment?: string;
  recurringCosts?: CostInput[];
}

export interface OfferVariantInput {
  pendingPrincipal: string;
  remainingMonths: number;
  nominalAnnualRate: string;
  linkedProductsMonthlyCost?: string;
  bonificationRateDelta?: string;
  recurringCosts?: CostInput[];
}

export interface HouseholdProfileInput {
  netMonthlyIncome: string;
  monthlyObligations: string;
  incomeStability?: IncomeStability;
  notes?: string;
}

export interface CreateAnalysisRequest {
  retentionPreference: RetentionPreference;
  horizonMonths: number;
  currentMortgage: MortgageInput;
  alternativeOffer: {
    withoutBonus: OfferVariantInput;
    withBonus?: OfferVariantInput;
  };
  switchCosts: CostInput[];
  householdProfile?: HouseholdProfileInput;
}

export interface RetentionMetadata {
  provider?: string;
  mode?: string;
  durable?: boolean;
  access?: string;
  message?: string;
}

export interface TraceReference {
  code: string;
  kind: 'formula' | 'rule';
  version: string;
  sourceDocument: string;
  sourceSection: string;
  summary: string;
}

export interface AnalysisSummary {
  id: string;
  status: 'draft' | 'validated' | 'compared' | 'saved' | 'expired' | 'deleted';
  retentionPreference: RetentionPreference;
  horizonMonths: number;
  dataQualityStatus: DataQualityStatus;
  missingData: string[];
  assumptions: string[];
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  purgeAfter?: string;
  lastAccessedAt?: string;
  accessMode?: string;
  policyVersion?: string;
  retentionMetadata?: RetentionMetadata;
}

export interface CostLine extends CostInput {
  includedInTotalCost: boolean;
  totalAmount?: string;
  periodsApplied?: number;
}

export interface ScenarioResult {
  scenarioType: ScenarioType;
  monthlyInstallment: string;
  totalRealCost: string;
  finalAmountPaid: string;
  costBreakdown: CostLine[];
  inputs?: Array<{
    name: string;
    value: string;
    sourceType: SourceType;
    explanation?: string;
  }>;
  triggeredRules: string[];
  assumptions: string[];
  dataQualityStatus: DataQualityStatus;
}

export interface ComparisonResult {
  scenarios: ScenarioResult[];
  ranking: ScenarioType[];
  scenarioCount: number;
  bestScenarioType?: ScenarioType;
  dataQualityStatus: DataQualityStatus;
  explanation: string;
  triggeredRules: string[];
  traceReferences: TraceReference[];
  absoluteDifferenceVsCurrent: Partial<Record<ScenarioType, string>>;
  percentageDifferenceVsCurrent: Partial<Record<ScenarioType, string>>;
}

export interface SwitchRecommendation {
  recommendedAction: RecommendedAction;
  targetScenarioType?: ScenarioType;
  qualityStatus: DataQualityStatus;
  isSwitchWorthIt: boolean;
  breakEvenReached: boolean;
  breakEvenMonth?: number;
  netSavingsAtHorizon: string;
  blockingReasons?: string[];
  triggeredRules: string[];
  traceReferences: TraceReference[];
  explanation: string;
}

export interface AffordabilityResult {
  evaluatedScenarioType?: ScenarioType;
  debtRatio?: string;
  classification?: AffordabilityClassification;
  dataQualityStatus: DataQualityStatus;
  monthlyPaymentConsidered?: string;
  netMonthlyIncome?: string;
  monthlyObligations?: string;
  blockingReasons?: string[];
  explanation: string;
  assumptions: string[];
  triggeredRules: string[];
  traceReferences: TraceReference[];
}

export interface StageStatus {
  source: ResultSource;
  label: string;
  detail: string;
}

export interface AnalysisNotice {
  tone: NoticeTone;
  title: string;
  detail: string;
}

export interface AnalysisExperience {
  analysis: AnalysisSummary;
  comparison?: ComparisonResult;
  recommendation?: SwitchRecommendation;
  affordability?: AffordabilityResult;
  stages: {
    analysis: StageStatus;
    comparison: StageStatus;
    affordability: StageStatus;
  };
  notices: AnalysisNotice[];
}

export interface DraftMortgageSection {
  pendingPrincipal: string;
  remainingMonths: string;
  nominalAnnualRate: string;
  currentInstallment: string;
  recurringCostsMonthly: string;
}

export interface DraftOfferSection {
  pendingPrincipal: string;
  remainingMonths: string;
  nominalAnnualRate: string;
  recurringCostsMonthly: string;
  linkedProductsMonthlyCost: string;
  bonificationRateDelta: string;
}

export interface DraftSwitchCosts {
  agency: string;
  notary: string;
  appraisal: string;
  management: string;
  cancellationFee: string;
  openingFee: string;
  other: string;
  otherDescription: string;
}

export interface DraftHouseholdProfile {
  netMonthlyIncome: string;
  monthlyObligations: string;
  incomeStability: IncomeStability;
  notes: string;
}

export interface AnalysisDraft {
  retentionPreference: RetentionPreference;
  horizonMonths: string;
  currentMortgage: DraftMortgageSection;
  alternativeOffer: {
    hasBonusVariant: boolean;
    withoutBonus: DraftOfferSection;
    withBonus: DraftOfferSection;
  };
  switchCosts: DraftSwitchCosts;
  householdProfile: DraftHouseholdProfile;
}

export const scenarioLabels: Record<ScenarioType, string> = {
  current: 'Hipoteca actual',
  alternative_without_bonus: 'Oferta sin bonificaciones',
  alternative_with_bonus: 'Oferta con bonificaciones'
};

export const recommendationLabels: Record<RecommendedAction, string> = {
  keep_current: 'Quédate con la actual',
  switch_without_bonus: 'Cambia sin bonificaciones',
  switch_with_bonus: 'Cambia con bonificaciones',
  insufficient_data: 'Faltan datos para recomendar'
};

export const affordabilityLabels: Record<AffordabilityClassification, string> = {
  asumible: 'Asumible',
  ajustada: 'Ajustada',
  no_asumible: 'No asumible'
};

export const retentionPreferenceLabels: Record<RetentionPreference, string> = {
  session_only: 'Solo durante esta sesión',
  save_analysis: 'Guardar para volver después'
};

export const dataQualityLabels: Record<DataQualityStatus, string> = {
  complete: 'Completo',
  conditional_estimate: 'Estimación condicionada',
  blocked: 'Bloqueado'
};

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

export function formatCurrency(value: string | number | undefined) {
  const numericValue =
    typeof value === 'number' ? value : value ? Number.parseFloat(value) : 0;

  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatSignedCurrency(value: string | number | undefined) {
  const numericValue =
    typeof value === 'number' ? value : value ? Number.parseFloat(value) : 0;
  const formatted = formatCurrency(numericValue);

  if (!Number.isFinite(numericValue) || numericValue === 0) {
    return formatted;
  }

  return numericValue > 0 ? `+${formatted}` : formatted;
}

export function formatPercent(value: string | number | undefined) {
  const numericValue =
    typeof value === 'number' ? value : value ? Number.parseFloat(value) : 0;

  return percentFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatSignedPercent(value: string | number | undefined) {
  const numericValue =
    typeof value === 'number' ? value : value ? Number.parseFloat(value) : 0;
  const formatted = formatPercent(numericValue);

  if (!Number.isFinite(numericValue) || numericValue === 0) {
    return formatted;
  }

  return numericValue > 0 ? `+${formatted}` : formatted;
}

export function formatMonthWindow(months: number | undefined) {
  if (!months) {
    return 'Sin estimación';
  }

  if (months < 12) {
    return `${months} meses`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }

  return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} meses`;
}
