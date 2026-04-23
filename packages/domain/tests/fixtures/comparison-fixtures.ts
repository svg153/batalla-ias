import type { DataQualityStatus, ScenarioType } from '../../src/types/common';
import type { MortgageScenario } from '../../src/types/scenario';

interface ScenarioFixtureOverrides {
  scenarioType: ScenarioType;
  totalRealCost?: string;
  finalAmountPaid?: string;
  monthlyInstallment?: string;
  dataQualityStatus?: DataQualityStatus;
  linkedProductsMonthlyCost?: string;
  bonificationRateDelta?: string;
  assumptions?: ReadonlyArray<string>;
  triggeredRules?: ReadonlyArray<string>;
}

export function buildScenario({
  scenarioType,
  totalRealCost = '25000.0000',
  finalAmountPaid = '95000.0000',
  monthlyInstallment = '790.00',
  dataQualityStatus = 'complete',
  linkedProductsMonthlyCost,
  bonificationRateDelta,
  assumptions = [],
  triggeredRules = [],
}: ScenarioFixtureOverrides): MortgageScenario {
  return {
    scenarioType,
    loanPurpose: scenarioType === 'current' ? 'current_mortgage' : 'switch_offer',
    pendingPrincipal: '185000.00',
    remainingMonths: 240,
    nominalAnnualRate: scenarioType === 'alternative_with_bonus' ? '1.85' : '2.10',
    monthlyInstallment,
    monthlyInstallmentRaw: `${monthlyInstallment}00`,
    interestPaid: '12000.0000',
    principalRepaid: '40000.0000',
    remainingBalanceAfterHorizon: '145000.0000',
    totalRealCost,
    finalAmountPaid,
    currentInstallment: scenarioType === 'current' ? monthlyInstallment : undefined,
    linkedProductsMonthlyCost,
    bonificationRateDelta,
    costBreakdown: [
      {
        amount: '120.00',
        costType: 'other',
        description: 'Intereses y costes visibles del escenario',
        includedInTotalCost: true,
        sourceType: 'calculated',
        timing: 'monthly',
        totalAmount: '120.0000',
        periodsApplied: 1,
      },
      ...(linkedProductsMonthlyCost
        ? [
            {
              amount: linkedProductsMonthlyCost,
              costType: 'linked_product' as const,
              description: 'Coste mensual de productos vinculados',
              includedInTotalCost: true,
              sourceType: 'user_provided' as const,
              timing: 'monthly' as const,
              totalAmount: '2520.0000',
              periodsApplied: 60,
            },
          ]
        : []),
    ],
    inputs: [],
    triggeredRules,
    assumptions,
    dataQualityStatus,
  };
}

export function buildNoBonusScenarioSet(): ReadonlyArray<MortgageScenario> {
  return [
    buildScenario({
      scenarioType: 'current',
      totalRealCost: '25000.0000',
      finalAmountPaid: '99000.0000',
      monthlyInstallment: '948.00',
    }),
    buildScenario({
      scenarioType: 'alternative_without_bonus',
      totalRealCost: '23000.0000',
      finalAmountPaid: '97000.0000',
      monthlyInstallment: '910.00',
    }),
  ];
}

export function buildBonusTrapScenarioSet(): ReadonlyArray<MortgageScenario> {
  return [
    ...buildNoBonusScenarioSet(),
    buildScenario({
      scenarioType: 'alternative_with_bonus',
      totalRealCost: '23850.0000',
      finalAmountPaid: '97850.0000',
      monthlyInstallment: '890.00',
      linkedProductsMonthlyCost: '42.00',
      bonificationRateDelta: '0.40',
      assumptions: ['La cuota baja, pero los vinculados añaden coste real.'],
      triggeredRules: ['rule.bonus-products-visible'],
    }),
  ];
}

export function buildConditionalEstimateScenarioSet(): ReadonlyArray<MortgageScenario> {
  return [
    buildScenario({
      scenarioType: 'current',
      totalRealCost: '25000.0000',
      finalAmountPaid: '99000.0000',
      monthlyInstallment: '948.00',
    }),
    buildScenario({
      scenarioType: 'alternative_without_bonus',
      totalRealCost: '21950.0000',
      finalAmountPaid: '95950.0000',
      monthlyInstallment: '905.00',
      dataQualityStatus: 'conditional_estimate',
      assumptions: [
        'Falta la cuota actual declarada; el ahorro usa amortización estimada.',
      ],
    }),
  ];
}
