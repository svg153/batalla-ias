import type {
  AffordabilityResult,
  AnalysisSummary,
  ComparisonResult,
  ScenarioResult,
  SwitchRecommendation,
} from '../../../src/features/mortgage-analysis/types';

function buildScenario(
  scenarioType: ScenarioResult['scenarioType'],
  totalRealCost: string,
  monthlyInstallment: string,
  extraBreakdown: ScenarioResult['costBreakdown'] = [],
): ScenarioResult {
  return {
    scenarioType,
    monthlyInstallment,
    totalRealCost,
    finalAmountPaid: totalRealCost,
    costBreakdown: [
      {
        amount: '120.00',
        costType: 'other',
        description: 'Intereses estimados visibles',
        includedInTotalCost: true,
        sourceType: 'calculated',
        timing: 'monthly',
      },
      ...extraBreakdown,
    ],
    triggeredRules: ['ranking_by_total_real_cost'],
    assumptions: [],
    dataQualityStatus: 'complete',
  };
}

export const createdAnalysisFixture: { analysis: AnalysisSummary } = {
  analysis: {
    id: 'analysis-e2e-001',
    status: 'validated',
    retentionPreference: 'session_only',
    horizonMonths: 120,
    dataQualityStatus: 'complete',
    missingData: [],
    assumptions: [],
    createdAt: '2026-04-23T21:00:00.000Z',
    lastAccessedAt: '2026-04-23T21:00:00.000Z',
    expiresAt: '2026-04-24T01:00:00.000Z',
    purgeAfter: '2026-04-24T01:15:00.000Z',
    accessMode: 'analysis_session_cookie',
    policyVersion: 'mortgage-mvp/es-ES@2026.04.23-v1',
    retentionMetadata: {
      provider: 'memory',
      mode: 'session_ephemeral',
      durable: false,
      access: 'analysis_session_cookie',
      message:
        'Session analyses stay tied to the analysis_session cookie and expire after 4 hours of inactivity.',
    },
  },
};

export const conditionalAnalysisFixture: { analysis: AnalysisSummary } = {
  analysis: {
    ...createdAnalysisFixture.analysis,
    dataQualityStatus: 'conditional_estimate',
    missingData: ['Cuota actual declarada'],
    assumptions: [
      'La interfaz recuerda que, por defecto, los datos sensibles no deberían quedarse más allá de la sesión.',
      'La asequibilidad queda condicionada porque los ingresos del hogar son variables.',
    ],
  },
};

export const bonusTrapComparisonFixture: {
  comparison: ComparisonResult;
  recommendation: SwitchRecommendation;
} = {
  comparison: {
    scenarios: [
      buildScenario('current', '25000.00', '948.00'),
      buildScenario('alternative_without_bonus', '23000.00', '910.00'),
      buildScenario('alternative_with_bonus', '23850.00', '890.00', [
        {
          amount: '42.00',
          costType: 'linked_product',
          description: 'Productos vinculados de la bonificación',
          includedInTotalCost: true,
          sourceType: 'user_provided',
          timing: 'monthly',
        },
      ]),
    ],
    ranking: ['alternative_without_bonus', 'alternative_with_bonus', 'current'],
    scenarioCount: 3,
    bestScenarioType: 'alternative_without_bonus',
    dataQualityStatus: 'complete',
    explanation:
      'La oferta sin bonificaciones gana por coste total real aunque la bonificada apriete más la cuota.',
    triggeredRules: ['ranking_by_total_real_cost', 'bonus_costs_visible'],
    traceReferences: [
      {
        code: 'rule.rank-scenarios-by-total-cost',
        kind: 'rule',
        version: '1.0.0',
        sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
        sourceSection: 'functional-requirements',
        summary: 'Ordena los escenarios por coste total real.'
      }
    ],
    absoluteDifferenceVsCurrent: {
      current: '0.00',
      alternative_without_bonus: '-2000.00',
      alternative_with_bonus: '-1150.00',
    },
    percentageDifferenceVsCurrent: {
      current: '0.0000',
      alternative_without_bonus: '-8.0000',
      alternative_with_bonus: '-4.6000',
    },
  },
  recommendation: {
    recommendedAction: 'switch_without_bonus',
    targetScenarioType: 'alternative_without_bonus',
    qualityStatus: 'complete',
    isSwitchWorthIt: true,
    breakEvenReached: true,
    breakEvenMonth: 32,
    netSavingsAtHorizon: '2000.00',
    triggeredRules: ['prefer_lower_total_real_cost'],
    traceReferences: [
      {
        code: 'rule.recommend-switch',
        kind: 'rule',
        version: '1.0.0',
        sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
        sourceSection: 'functional-requirements',
        summary: 'Explica si compensa cambiar o mantener la hipoteca actual.'
      }
    ],
    explanation:
      'Compensa cambiar sin bonificaciones: el ahorro neto supera los costes del cambio y evita vinculaciones caras.',
  },
};

export const noBonusComparisonFixture: {
  comparison: ComparisonResult;
  recommendation: SwitchRecommendation;
} = {
  comparison: {
    scenarios: [
      buildScenario('current', '25000.00', '948.00'),
      buildScenario('alternative_without_bonus', '23000.00', '910.00'),
    ],
    ranking: ['alternative_without_bonus', 'current'],
    scenarioCount: 2,
    bestScenarioType: 'alternative_without_bonus',
    dataQualityStatus: 'complete',
    explanation:
      'Solo hay dos escenarios porque la oferta no define una variante con bonificaciones explícitas.',
    triggeredRules: ['ranking_by_total_real_cost', 'no_bonus_scenario_only'],
    traceReferences: [
      {
        code: 'rule.compare-scenario-set',
        kind: 'rule',
        version: '1.0.0',
        sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
        sourceSection: 'functional-requirements',
        summary: 'Evita inventar la variante bonificada cuando no existe.'
      }
    ],
    absoluteDifferenceVsCurrent: {
      current: '0.00',
      alternative_without_bonus: '-2000.00',
    },
    percentageDifferenceVsCurrent: {
      current: '0.0000',
      alternative_without_bonus: '-8.0000',
    },
  },
  recommendation: {
    recommendedAction: 'switch_without_bonus',
    targetScenarioType: 'alternative_without_bonus',
    qualityStatus: 'complete',
    isSwitchWorthIt: true,
    breakEvenReached: true,
    breakEvenMonth: 28,
    netSavingsAtHorizon: '2000.00',
    triggeredRules: ['prefer_lower_total_real_cost'],
    traceReferences: [
      {
        code: 'rule.recommend-switch',
        kind: 'rule',
        version: '1.0.0',
        sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
        sourceSection: 'functional-requirements',
        summary: 'Explica si compensa cambiar o mantener la hipoteca actual.'
      }
    ],
    explanation:
      'La oferta base ya basta para mejorar el coste total real, sin inventar una bonificación vacía.',
  },
};

export const affordabilityFixture: { affordability: AffordabilityResult } = {
  affordability: {
    evaluatedScenarioType: 'alternative_without_bonus',
    debtRatio: '0.3108',
    classification: 'asumible',
    dataQualityStatus: 'complete',
    monthlyPaymentConsidered: '910.00',
    netMonthlyIncome: '4150.00',
    monthlyObligations: '380.00',
    explanation: 'La cuota cabe dentro del 35% incluso sumando obligaciones existentes.',
    assumptions: [],
    triggeredRules: ['affordability_thresholds_35_40'],
    traceReferences: [
      {
        code: 'rule.affordability-thresholds',
        kind: 'rule',
        version: '1.0.0',
        sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
        sourceSection: 'functional-requirements',
        summary: 'Clasifica la asequibilidad con los umbrales 35% y 40%.'
      }
    ],
  },
};
