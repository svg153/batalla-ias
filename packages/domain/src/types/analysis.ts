import type { AffordabilityEvaluation, HouseholdProfileInput } from './affordability.js';
import type {
  CurrencyCode,
  DataQualityStatus,
  RetentionPreference,
} from './common.js';
import { dataQualityStatuses, retentionPreferences } from './common.js';
import type { ComparisonResult } from './comparison.js';
import type { SwitchRecommendation } from './recommendation.js';
import type {
  AlternativeOfferInput,
  AssociatedCostInput,
  CurrentMortgageInput,
} from './scenario.js';

export { dataQualityStatuses, retentionPreferences };
export type { DataQualityStatus, RetentionPreference };

export const analysisStatuses = [
  'draft',
  'validated',
  'compared',
  'saved',
  'expired',
  'deleted',
] as const;

export type AnalysisStatus = (typeof analysisStatuses)[number];

export interface ValidationIssue {
  field: string;
  reason: string;
  severity: 'warning' | 'blocking';
  ruleId?: string;
}

export interface MortgageAnalysisInput {
  retentionPreference: RetentionPreference;
  horizonMonths: number;
  currency?: CurrencyCode;
  currentMortgage: CurrentMortgageInput;
  alternativeOffer: AlternativeOfferInput;
  switchCosts?: ReadonlyArray<AssociatedCostInput>;
  householdProfile?: HouseholdProfileInput;
}

export type CreateAnalysisInput = MortgageAnalysisInput;

export interface ValidatedMortgageAnalysisInput extends MortgageAnalysisInput {
  currency: CurrencyCode;
  switchCosts: ReadonlyArray<AssociatedCostInput>;
}

export interface AnalysisValidationResult {
  success: boolean;
  issues: ReadonlyArray<ValidationIssue>;
  dataQualityStatus: DataQualityStatus;
  data?: ValidatedMortgageAnalysisInput;
}

export interface MortgageAnalysis {
  id: string;
  status: AnalysisStatus;
  retentionPreference: RetentionPreference;
  horizonMonths: number;
  currency: CurrencyCode;
  currentMortgage: CurrentMortgageInput;
  alternativeOffer: AlternativeOfferInput;
  switchCosts: ReadonlyArray<AssociatedCostInput>;
  householdProfile?: HouseholdProfileInput;
  comparisonResult?: ComparisonResult;
  recommendation?: SwitchRecommendation;
  affordability?: AffordabilityEvaluation;
  dataQualityStatus: DataQualityStatus;
  missingData: ReadonlyArray<string>;
  assumptions: ReadonlyArray<string>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface RetentionMetadata {
  provider: 'memory' | 'postgresql';
  mode: 'session_ephemeral' | 'save_requested_fallback' | 'saved_analysis';
  durable: boolean;
  access: 'analysis_session_cookie';
  message: string;
}

export interface AnalysisRecord extends MortgageAnalysis {
  retentionMetadata: RetentionMetadata;
}

export interface AnalysisResponseEnvelope {
  analysis: AnalysisRecord;
  comparison?: ComparisonResult;
  affordability?: AffordabilityEvaluation;
}

export interface ErrorDetail {
  field: string;
  reason: string;
  severity: 'warning' | 'blocking';
}

export interface ErrorResponse {
  code: string;
  message: string;
  details: ErrorDetail[];
}
