import { describe, expect, it } from 'vitest';

import { rankScenariosByTotalCost } from '../../src/rules/rank-scenarios-by-total-cost';
import {
  buildBonusTrapScenarioSet,
  buildConditionalEstimateScenarioSet,
  buildNoBonusScenarioSet,
} from '../fixtures/comparison-fixtures';

describe('comparison scenarios regression', () => {
  it('keeps only current and no-bonus scenarios when there is no explicit bonus variant', () => {
    const result = rankScenariosByTotalCost(buildNoBonusScenarioSet());

    expect(result.ranking).toEqual(['alternative_without_bonus', 'current']);
    expect(result.scenarios).toHaveLength(2);
    expect(result.ranking).not.toContain('alternative_with_bonus');
    expect(result.bestScenarioType).toBe('alternative_without_bonus');
    expect(result.absoluteDifferenceVsCurrent.alternative_without_bonus).toBe('-2000.00');
    expect(result.qualityStatus).toBe('complete');
  });

  it('ranks by total real cost instead of the lowest installment when bonuses add linked costs', () => {
    const result = rankScenariosByTotalCost(buildBonusTrapScenarioSet());

    expect(result.ranking).toEqual([
      'alternative_without_bonus',
      'alternative_with_bonus',
      'current',
    ]);
    expect(result.bestScenarioType).toBe('alternative_without_bonus');
    expect(result.absoluteDifferenceVsCurrent.alternative_with_bonus).toBe('-1150.00');
    expect(result.explanation).toContain('coste total real');
    expect(result.explanation).toContain('bonificaciones');
  });

  it('propagates conditional_estimate when the cheapest scenario depends on non-blocking assumptions', () => {
    const result = rankScenariosByTotalCost(buildConditionalEstimateScenarioSet());

    expect(result.bestScenarioType).toBe('alternative_without_bonus');
    expect(result.qualityStatus).toBe('conditional_estimate');
    expect(result.triggeredRules).toContain('rule.conditional-estimate-visible');
    expect(result.explanation).toContain('estimación condicionada');
    expect(result.percentageDifferenceVsCurrent.alternative_without_bonus).toBe('-12.2000');
  });
});
