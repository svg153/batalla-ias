import type { DataQualityStatus, MoneyString, RecommendedAction } from './common';

export interface SwitchRecommendation {
  recommendedAction: RecommendedAction;
  isSwitchWorthIt: boolean;
  breakEvenReached: boolean;
  breakEvenMonth?: number;
  netSavingsAtHorizon: MoneyString;
  blockingReasons: ReadonlyArray<string>;
  explanation: string;
  triggeredRules: ReadonlyArray<string>;
  qualityStatus: DataQualityStatus;
}
