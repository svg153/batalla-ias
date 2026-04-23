import type {
  AffordabilityEvaluation,
  AnalysisResponseEnvelope,
  ScenarioType,
  ValidationIssue,
  SwitchRecommendation,
} from '@batalla-ias/domain';

export const POLICY_VERSION = 'mortgage-mvp/es-ES@2026.04.23-v1';
export const ANALYSIS_ACCESS_MODE = 'analysis_session_cookie';

export interface StoredSwitchRecommendation extends SwitchRecommendation {
  targetScenarioType: ScenarioType | null;
}

export interface StoredAnalysisRecord extends AnalysisResponseEnvelope {
  accessMode: typeof ANALYSIS_ACCESS_MODE;
  policyVersion: string;
  lastAccessedAt: string;
  purgeAfter: string;
  sessionTokenHash: string;
  validationIssues: ReadonlyArray<ValidationIssue>;
  recommendation?: StoredSwitchRecommendation;
}

export interface CreatedAnalysisRecord {
  record: StoredAnalysisRecord;
  sessionToken: string;
}

export interface ComparisonComputationResult {
  record: StoredAnalysisRecord;
  comparison: NonNullable<StoredAnalysisRecord['comparison']>;
  recommendation: StoredSwitchRecommendation;
}

export interface AffordabilityComputationResult {
  record: StoredAnalysisRecord;
  affordability: NonNullable<StoredAnalysisRecord['affordability']>;
}
