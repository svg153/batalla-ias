import { getRuleSource } from './rule-sources';
import type { ComparisonResult } from '../types/comparison';
import type { DataQualityStatus, ScenarioType } from '../types/common';
import type { MortgageScenario } from '../types/scenario';
import { formatMoney, formatPercentage, toDecimal } from '../formulas/decimal';

const scenarioTieBreakOrder: Record<ScenarioType, number> = {
  current: 0,
  alternative_without_bonus: 1,
  alternative_with_bonus: 2,
};

export function rankScenariosByTotalCost(
  scenarios: ReadonlyArray<MortgageScenario>,
): ComparisonResult {
  if (scenarios.length < 2) {
    throw new Error('At least two scenarios are required for ranking');
  }

  const currentScenario = scenarios.find((scenario) => scenario.scenarioType === 'current');

  if (!currentScenario) {
    throw new Error('A current scenario is required for comparison');
  }

  const sortedScenarios = [...scenarios].sort((left, right) => {
    const leftBlocked = left.dataQualityStatus === 'blocked';
    const rightBlocked = right.dataQualityStatus === 'blocked';

    if (leftBlocked !== rightBlocked) {
      return leftBlocked ? 1 : -1;
    }

    const totalCostDelta = toDecimal(left.totalRealCost).cmp(toDecimal(right.totalRealCost));

    if (totalCostDelta !== 0) {
      return totalCostDelta;
    }

    return scenarioTieBreakOrder[left.scenarioType] - scenarioTieBreakOrder[right.scenarioType];
  });

  const bestScenario =
    sortedScenarios.find((scenario) => scenario.dataQualityStatus !== 'blocked') ??
    sortedScenarios[0]!;

  if (!bestScenario) {
    throw new Error('A ranked scenario is required for comparison');
  }

  const baselineCost = toDecimal(currentScenario.totalRealCost);

  const absoluteDifferenceVsCurrent: ComparisonResult['absoluteDifferenceVsCurrent'] = {};
  const percentageDifferenceVsCurrent: ComparisonResult['percentageDifferenceVsCurrent'] = {};

  for (const scenario of sortedScenarios) {
    const difference = toDecimal(scenario.totalRealCost).minus(baselineCost);
    absoluteDifferenceVsCurrent[scenario.scenarioType] = formatMoney(difference);
    percentageDifferenceVsCurrent[scenario.scenarioType] = baselineCost.eq(0)
      ? null
      : formatPercentage(difference.div(baselineCost).mul(100));
  }

  const triggeredRules: string[] = [getRuleSource('RANK_SCENARIOS_BY_TOTAL_COST').id];

  if (scenarios.some((scenario) => scenario.dataQualityStatus === 'blocked')) {
    triggeredRules.push('rule.blocked-scenarios-last');
  }

  if (scenarios.some((scenario) => scenario.dataQualityStatus === 'conditional_estimate')) {
    triggeredRules.push('rule.conditional-estimate-visible');
  }

  const qualityStatus = deriveComparisonQualityStatus(scenarios);
  const explanation = buildRankingExplanation(bestScenario, scenarios, qualityStatus);

  return {
    scenarios,
    ranking: sortedScenarios.map((scenario) => scenario.scenarioType),
    bestScenarioType: bestScenario.scenarioType,
    absoluteDifferenceVsCurrent,
    percentageDifferenceVsCurrent,
    explanation,
    triggeredRules,
    qualityStatus,
  };
}

function deriveComparisonQualityStatus(
  scenarios: ReadonlyArray<MortgageScenario>,
): DataQualityStatus {
  if (scenarios.some((scenario) => scenario.dataQualityStatus === 'blocked')) {
    return 'blocked';
  }

  if (scenarios.some((scenario) => scenario.dataQualityStatus === 'conditional_estimate')) {
    return 'conditional_estimate';
  }

  return 'complete';
}

function buildRankingExplanation(
  bestScenario: MortgageScenario,
  scenarios: ReadonlyArray<MortgageScenario>,
  qualityStatus: DataQualityStatus,
): string {
  const fragments = [
    `El escenario con menor coste total real disponible es "${bestScenario.scenarioType}" (${bestScenario.totalRealCost} EUR).`,
    'El ranking usa siempre el coste total real, no la cuota mensual aislada.',
  ];

  if (qualityStatus === 'blocked') {
    fragments.push(
      'Hay al menos un escenario bloqueado; se mantiene visible pero no debe impulsar una recomendación final.',
    );
  } else if (qualityStatus === 'conditional_estimate') {
    fragments.push('Hay supuestos o datos incompletos que mantienen la comparación como estimación condicionada.');
  }

  if (
    scenarios.some(
      (scenario) =>
        scenario.scenarioType === 'alternative_with_bonus' &&
        toDecimal(scenario.totalRealCost).gt(toDecimal(bestScenario.totalRealCost)),
    )
  ) {
    fragments.push('Las bonificaciones no mejoran automáticamente el ranking si añaden más coste total real.');
  }

  return fragments.join(' ');
}
