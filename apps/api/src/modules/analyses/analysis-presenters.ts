import {
  RULE_SOURCES,
  type AffordabilityEvaluation,
  type ComparisonResult,
  type MortgageScenario,
  type RuleCatalogEntry,
} from '@batalla-ias/domain';

import type {
  StoredAnalysisRecord,
  StoredSwitchRecommendation,
} from './analysis-record.js';

interface TraceReference {
  code: string;
  kind: 'formula' | 'rule';
  version: string;
  sourceDocument: string;
  sourceSection: string;
  summary: string;
}

export const presentAnalysisResponse = (record: StoredAnalysisRecord) => ({
  analysis: presentAnalysis(record),
  ...(record.comparison && record.recommendation
    ? {
        comparison: presentComparison(record.comparison),
        recommendation: presentRecommendation(record.recommendation),
      }
    : {}),
  ...(record.affordability
    ? { affordability: presentAffordability(record.affordability) }
    : {}),
});

export const presentComparisonResponse = (record: StoredAnalysisRecord) => {
  if (!record.comparison || !record.recommendation) {
    throw new Error('Comparison response requires comparison and recommendation data');
  }

  return {
    comparison: presentComparison(record.comparison),
    recommendation: presentRecommendation(record.recommendation),
  };
};

export const presentAffordabilityResponse = (record: StoredAnalysisRecord) => {
  if (!record.affordability) {
    throw new Error('Affordability response requires affordability data');
  }

  return {
    affordability: presentAffordability(record.affordability),
  };
};

const presentAnalysis = (record: StoredAnalysisRecord) => ({
  ...record.analysis,
  accessMode: record.accessMode,
  policyVersion: record.policyVersion,
  lastAccessedAt: record.lastAccessedAt,
  purgeAfter: record.purgeAfter,
});

const presentComparison = (comparison: ComparisonResult) => ({
  policyVersion: comparisonPolicyVersion,
  scenarios: comparison.scenarios.map(presentScenario),
  ranking: comparison.ranking,
  scenarioCount: comparison.scenarios.length,
  dataQualityStatus: comparison.qualityStatus,
  explanation: comparison.explanation,
  triggeredRules: comparison.triggeredRules,
  traceReferences: buildTraceReferences([
    ...comparison.triggeredRules,
    ...comparison.scenarios.flatMap((scenario) => scenario.triggeredRules),
  ]),
  absoluteDifferenceVsCurrent: comparison.absoluteDifferenceVsCurrent,
  percentageDifferenceVsCurrent: comparison.percentageDifferenceVsCurrent,
});

const presentScenario = (scenario: MortgageScenario) => ({
  scenarioType: scenario.scenarioType,
  monthlyInstallment: scenario.monthlyInstallment,
  totalRealCost: scenario.totalRealCost,
  finalAmountPaid: scenario.finalAmountPaid,
  costBreakdown: scenario.costBreakdown,
  inputs: scenario.inputs.map((input) => ({
    name: input.name,
    value: input.value,
    sourceType: input.sourceType,
    ...(input.explanation ? { explanation: input.explanation } : {}),
  })),
  triggeredRules: scenario.triggeredRules,
  assumptions: scenario.assumptions,
  dataQualityStatus: scenario.dataQualityStatus,
});

const presentRecommendation = (recommendation: StoredSwitchRecommendation) => ({
  policyVersion: comparisonPolicyVersion,
  recommendedAction: recommendation.recommendedAction,
  targetScenarioType: recommendation.targetScenarioType,
  qualityStatus: recommendation.qualityStatus,
  isSwitchWorthIt: recommendation.isSwitchWorthIt,
  breakEvenReached: recommendation.breakEvenReached,
  breakEvenMonth: recommendation.breakEvenMonth ?? null,
  netSavingsAtHorizon: recommendation.netSavingsAtHorizon,
  blockingReasons: [...recommendation.blockingReasons],
  triggeredRules: recommendation.triggeredRules,
  traceReferences: buildTraceReferences(recommendation.triggeredRules),
  explanation: recommendation.explanation,
});

const presentAffordability = (affordability: AffordabilityEvaluation) => ({
  policyVersion: comparisonPolicyVersion,
  evaluatedScenarioType: affordability.scenarioType,
  debtRatio: affordability.debtRatio,
  classification: affordability.classification,
  dataQualityStatus: affordability.qualityStatus,
  monthlyPaymentConsidered: affordability.monthlyPaymentConsidered,
  netMonthlyIncome: affordability.netMonthlyIncome,
  monthlyObligations: affordability.monthlyObligations,
  blockingReasons: [],
  explanation: affordability.explanation,
  assumptions: affordability.assumptions,
  triggeredRules: affordability.triggeredRules,
  traceReferences: buildTraceReferences(affordability.triggeredRules),
});

const comparisonPolicyVersion = 'mortgage-mvp/es-ES@2026.04.23-v1';

const buildTraceReferences = (ruleIds: ReadonlyArray<string>): TraceReference[] => {
  const seen = new Set<string>();
  const traceReferences: TraceReference[] = [];

  for (const ruleId of ruleIds) {
    const catalogEntry = findCatalogEntry(ruleId);

    if (!catalogEntry || seen.has(catalogEntry.id)) {
      continue;
    }

    seen.add(catalogEntry.id);
    traceReferences.push(toTraceReference(catalogEntry));
  }

  return traceReferences;
};

const findCatalogEntry = (ruleId: string) =>
  Object.values(RULE_SOURCES).find((entry) => entry.id === ruleId);

const toTraceReference = (entry: RuleCatalogEntry): TraceReference => {
  const primarySource = entry.sources[0];
  const [sourceDocument, sourceSection = ''] = (primarySource?.reference ?? '').split('#');

  return {
    code: entry.id,
    kind: entry.kind === 'formula' ? 'formula' : 'rule',
    version: entry.version,
    sourceDocument: sourceDocument ?? '',
    sourceSection,
    summary: entry.summary,
  };
};
