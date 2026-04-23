import { describe, expect, it } from 'vitest';

import { rankScenariosByTotalCost } from '../../src/rules/rank-scenarios-by-total-cost';
import type { MortgageScenario } from '../../src/types';

describe('comparison ranking regression', () => {
  it('ranks by total real cost while relegating blocked scenarios', () => {
    const scenarios: MortgageScenario[] = [
      buildScenario('current', '10000.0000', 'complete'),
      buildScenario('alternative_without_bonus', '9500.0000', 'conditional_estimate'),
      buildScenario('alternative_with_bonus', '9200.0000', 'blocked'),
    ];

    const result = rankScenariosByTotalCost(scenarios);

    expect(result.ranking).toEqual([
      'alternative_without_bonus',
      'current',
      'alternative_with_bonus',
    ]);
    expect(result.bestScenarioType).toBe('alternative_without_bonus');
    expect(result.qualityStatus).toBe('blocked');
    expect(result.absoluteDifferenceVsCurrent.alternative_without_bonus).toBe('-500.00');
    expect(result.percentageDifferenceVsCurrent.alternative_without_bonus).toBe('-5.0000');
    expect(result.triggeredRules).toEqual(
      expect.arrayContaining([
        'rule.rank-scenarios-by-total-cost',
        'rule.blocked-scenarios-last',
        'rule.conditional-estimate-visible',
      ]),
    );
  });
});

function buildScenario(
  scenarioType: MortgageScenario['scenarioType'],
  totalRealCost: string,
  dataQualityStatus: MortgageScenario['dataQualityStatus'],
): MortgageScenario {
  return {
    scenarioType,
    loanPurpose: scenarioType === 'current' ? 'current_mortgage' : 'switch_offer',
    pendingPrincipal: '100000',
    remainingMonths: 240,
    nominalAnnualRate: '2.5',
    monthlyInstallment: '500.00',
    monthlyInstallmentRaw: '500.0000',
    interestPaid: '0.0000',
    principalRepaid: '0.0000',
    remainingBalanceAfterHorizon: '100000.0000',
    totalRealCost,
    finalAmountPaid: totalRealCost,
    costBreakdown: [],
    inputs: [],
    triggeredRules: [],
    assumptions: [],
    dataQualityStatus,
  };
}
