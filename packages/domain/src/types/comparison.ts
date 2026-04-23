import type {
  DataQualityStatus,
  MoneyString,
  PercentageString,
  ScenarioType,
} from './common';
import type { MortgageScenario } from './scenario';

export type ScenarioMoneyDeltaMap = Partial<Record<ScenarioType, MoneyString>>;
export type ScenarioPercentageDeltaMap = Partial<Record<ScenarioType, PercentageString | null>>;

export interface ComparisonResult {
  scenarios: ReadonlyArray<MortgageScenario>;
  ranking: ReadonlyArray<ScenarioType>;
  bestScenarioType: ScenarioType;
  absoluteDifferenceVsCurrent: ScenarioMoneyDeltaMap;
  percentageDifferenceVsCurrent: ScenarioPercentageDeltaMap;
  explanation: string;
  triggeredRules: ReadonlyArray<string>;
  qualityStatus: DataQualityStatus;
}
