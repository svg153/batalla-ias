import { randomUUID } from 'node:crypto';

import {
  createExplainableValue,
  calculateTotalRealCost,
  formatMoney,
  formatPercentage,
  getRuleSource,
  rankScenariosByTotalCost,
  toDecimal,
  validateAnalysisInput,
  type AffordabilityEvaluation,
  type CreateAnalysisInput,
  type DataQualityStatus,
  type HouseholdProfileInput,
  type MortgageScenario,
  type RetentionMetadata,
  type ScenarioType,
  type ValidationIssue,
} from '@batalla-ias/domain';

import type {
  AffordabilityComputationResult,
  ComparisonComputationResult,
  CreatedAnalysisRecord,
  StoredAnalysisRecord,
  StoredSwitchRecommendation,
} from './analysis-record.js';
import { ANALYSIS_ACCESS_MODE, POLICY_VERSION } from './analysis-record.js';
import type { AnalysisRepository } from './analysis-repository.js';
import {
  generateAnalysisSessionToken,
  hashAnalysisSessionToken,
  matchesAnalysisSessionToken as matchesSessionToken,
} from './analysis-session.js';

export interface AnalysisService {
  create(input: CreateAnalysisInput): Promise<CreatedAnalysisRecord>;
  get(analysisId: string, sessionToken: string): Promise<StoredAnalysisRecord | null>;
  delete(analysisId: string, sessionToken: string): Promise<boolean>;
  compare(
    analysisId: string,
    sessionToken: string,
  ): Promise<ComparisonComputationResult | null>;
  evaluateAffordability(
    analysisId: string,
    sessionToken: string,
    householdProfile: HouseholdProfileInput,
  ): Promise<AffordabilityComputationResult | null>;
}

export class AnalysisValidationError extends Error {
  constructor(public readonly issues: ReadonlyArray<ValidationIssue>) {
    super('Analysis validation failed.');
    this.name = 'AnalysisValidationError';
  }
}

export interface CreateAnalysisServiceOptions {
  repository: AnalysisRepository;
  now?: () => Date;
  sessionTtlMinutes?: number;
  sessionPurgeMinutes?: number;
  savedRetentionDays?: number;
  savedPurgeHours?: number;
}

const QUALITY_PRIORITY: Record<DataQualityStatus, number> = {
  complete: 0,
  conditional_estimate: 1,
  blocked: 2,
};

export const createAnalysisService = ({
  repository,
  now = () => new Date(),
  sessionTtlMinutes = 240,
  sessionPurgeMinutes = 15,
  savedRetentionDays = 30,
  savedPurgeHours = 24,
}: CreateAnalysisServiceOptions): AnalysisService => ({
  async create(input) {
    const validation = validateAnalysisInput(input);

    if (!validation.success || !validation.data) {
      throw new AnalysisValidationError(validation.issues);
    }

    const createdAt = now();
    const lastAccessedAt = createdAt.toISOString();
    const expiresAt = buildExpiresAt(
      createdAt,
      validation.data.retentionPreference,
      sessionTtlMinutes,
      savedRetentionDays,
    );
    const purgeAfter = buildPurgeAfter(
      expiresAt,
      validation.data.retentionPreference,
      sessionPurgeMinutes,
      savedPurgeHours,
    );
    const missingData = buildMissingData(validation.data);
    const assumptions = buildAssumptions(validation.data, validation.issues, repository);
    const dataQualityStatus = deriveAnalysisDataQualityStatus(
      validation.dataQualityStatus,
      missingData,
      assumptions,
    );
    const retentionMetadata = buildRetentionMetadata(
      validation.data.retentionPreference,
      repository,
      expiresAt,
    );
    const sessionToken = generateAnalysisSessionToken();

    const record: StoredAnalysisRecord = {
      analysis: {
        id: randomUUID(),
        status:
          validation.data.retentionPreference === 'save_analysis' &&
          repository.capabilities.supportsDurableStorage
            ? 'saved'
            : 'validated',
        retentionPreference: validation.data.retentionPreference,
        horizonMonths: validation.data.horizonMonths,
        currency: validation.data.currency,
        currentMortgage: structuredClone(validation.data.currentMortgage),
        alternativeOffer: structuredClone(validation.data.alternativeOffer),
        switchCosts: structuredClone(validation.data.switchCosts),
        ...(validation.data.householdProfile
          ? { householdProfile: structuredClone(validation.data.householdProfile) }
          : {}),
        dataQualityStatus,
        missingData,
        assumptions,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        expiresAt,
        retentionMetadata,
      },
      accessMode: ANALYSIS_ACCESS_MODE,
      policyVersion: POLICY_VERSION,
      lastAccessedAt,
      purgeAfter,
      sessionTokenHash: hashAnalysisSessionToken(sessionToken),
      validationIssues: structuredClone(validation.issues),
    };

    return {
      record: await repository.save(record),
      sessionToken,
    };
  },

  async get(analysisId, sessionToken) {
    return authorizeAndTouchAnalysis({
      analysisId,
      sessionToken,
      repository,
      now,
      sessionTtlMinutes,
      sessionPurgeMinutes,
      savedPurgeHours,
    });
  },

  async delete(analysisId, sessionToken) {
    const record = await authorizeAndTouchAnalysis({
      analysisId,
      sessionToken,
      repository,
      now,
      sessionTtlMinutes,
      sessionPurgeMinutes,
      savedPurgeHours,
    });

    if (!record) {
      return false;
    }

    return repository.delete(record.analysis.id);
  },

  async compare(analysisId, sessionToken) {
    const authorized = await authorizeAndTouchAnalysis({
      analysisId,
      sessionToken,
      repository,
      now,
      sessionTtlMinutes,
      sessionPurgeMinutes,
      savedPurgeHours,
    });

    if (!authorized) {
      return null;
    }

    const currentScenario = buildCurrentScenario(authorized);
    const withoutBonusScenario = buildAlternativeScenario(
      authorized,
      'alternative_without_bonus',
    );
    const withBonusScenario = authorized.analysis.alternativeOffer.withBonus
      ? buildAlternativeScenario(authorized, 'alternative_with_bonus')
      : null;

    const comparisonRule = getRuleSource('COMPARE_SCENARIO_SET');
    const ranking = rankScenariosByTotalCost(
      [currentScenario, withoutBonusScenario, withBonusScenario].filter(
        (scenario): scenario is MortgageScenario => scenario !== null,
      ),
    );
    const comparison = {
      ...ranking,
      triggeredRules: dedupe([comparisonRule.id, ...ranking.triggeredRules]),
    };
    const recommendation = buildRecommendation(authorized, comparison);
    const updatedAt = now().toISOString();
    const { affordability: _analysisAffordability, ...analysisWithoutAffordability } =
      authorized.analysis;
    const { affordability: _recordAffordability, ...recordWithoutAffordability } = authorized;
    const record = await repository.save({
      ...recordWithoutAffordability,
      analysis: {
        ...analysisWithoutAffordability,
        status: 'compared',
        updatedAt,
        dataQualityStatus: mergeQualityStatuses(
          authorized.analysis.dataQualityStatus,
          comparison.qualityStatus,
          recommendation.qualityStatus,
        ),
        comparisonResult: comparison,
        recommendation,
      },
      comparison,
      recommendation,
    });

    return {
      record,
      comparison,
      recommendation,
    };
  },

  async evaluateAffordability(analysisId, sessionToken, householdProfile) {
    const authorized = await authorizeAndTouchAnalysis({
      analysisId,
      sessionToken,
      repository,
      now,
      sessionTtlMinutes,
      sessionPurgeMinutes,
      savedPurgeHours,
    });

    if (!authorized) {
      return null;
    }

    if (!authorized.comparison || !authorized.recommendation) {
      throw new AnalysisValidationError([
        {
          field: 'comparison',
          reason:
            'Run a valid comparison before requesting affordability so the API can use the active recommendation target scenario.',
          severity: 'blocking',
        },
      ]);
    }

    if (!authorized.recommendation.targetScenarioType) {
      throw new AnalysisValidationError([
        {
          field: 'recommendation.targetScenarioType',
          reason:
            'The active recommendation does not expose a target scenario, so affordability cannot be evaluated yet.',
          severity: 'blocking',
        },
      ]);
    }

    const targetScenario = authorized.comparison.scenarios.find(
      (scenario) => scenario.scenarioType === authorized.recommendation?.targetScenarioType,
    );

    if (!targetScenario) {
      throw new AnalysisValidationError([
        {
          field: 'recommendation.targetScenarioType',
          reason: 'The recommended scenario is missing from the stored comparison result.',
          severity: 'blocking',
        },
      ]);
    }

    const affordability = buildAffordability(targetScenario, householdProfile);
    const updatedAt = now().toISOString();
    const record = await repository.save({
      ...authorized,
      analysis: {
        ...authorized.analysis,
        updatedAt,
        householdProfile: structuredClone(householdProfile),
        dataQualityStatus: mergeQualityStatuses(
          authorized.analysis.dataQualityStatus,
          affordability.qualityStatus,
        ),
        affordability,
      },
      affordability,
    });

    return {
      record,
      affordability,
    };
  },
});

interface AuthorizeAndTouchAnalysisOptions {
  analysisId: string;
  sessionToken: string;
  repository: AnalysisRepository;
  now: () => Date;
  sessionTtlMinutes: number;
  sessionPurgeMinutes: number;
  savedPurgeHours: number;
}

const authorizeAndTouchAnalysis = async ({
  analysisId,
  sessionToken,
  repository,
  now,
  sessionTtlMinutes,
  sessionPurgeMinutes,
  savedPurgeHours,
}: AuthorizeAndTouchAnalysisOptions) => {
  const record = await repository.findById(analysisId);

  if (!record || !matchesSessionToken(sessionToken, record.sessionTokenHash)) {
    return null;
  }

  const accessTime = now();
  const currentExpiresAt = record.analysis.expiresAt ?? record.purgeAfter;
  const expiresAt = new Date(currentExpiresAt);

  if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() <= accessTime.getTime()) {
    await repository.delete(record.analysis.id);
    return null;
  }

  const lastAccessedAt = accessTime.toISOString();
  const nextExpiresAt =
    record.analysis.retentionPreference === 'session_only'
      ? addMinutes(accessTime, sessionTtlMinutes).toISOString()
      : currentExpiresAt;
  const nextPurgeAfter =
    record.analysis.retentionPreference === 'session_only'
      ? addMinutes(new Date(nextExpiresAt), sessionPurgeMinutes).toISOString()
      : addHours(new Date(nextExpiresAt), savedPurgeHours).toISOString();

  if (
    record.lastAccessedAt === lastAccessedAt &&
    record.analysis.expiresAt === nextExpiresAt &&
    record.purgeAfter === nextPurgeAfter
  ) {
    return record;
  }

  return repository.save({
    ...record,
    lastAccessedAt,
    purgeAfter: nextPurgeAfter,
    analysis: {
      ...record.analysis,
      expiresAt: nextExpiresAt,
    },
  });
};

const buildCurrentScenario = (record: StoredAnalysisRecord): MortgageScenario => {
  const totalRealCost = calculateTotalRealCost({
    pendingPrincipal: record.analysis.currentMortgage.pendingPrincipal,
    remainingMonths: record.analysis.currentMortgage.remainingMonths,
    nominalAnnualRate: record.analysis.currentMortgage.nominalAnnualRate,
    horizonMonths: record.analysis.horizonMonths,
    ...(record.analysis.currentMortgage.currentInstallment
      ? { monthlyInstallment: record.analysis.currentMortgage.currentInstallment }
      : {}),
    ...(record.analysis.currentMortgage.recurringCosts
      ? { recurringCosts: record.analysis.currentMortgage.recurringCosts }
      : {}),
  });
  const installmentFormula = getRuleSource('ESTIMATED_INSTALLMENT');
  const totalCostFormula = getRuleSource('TOTAL_REAL_COST');

  const assumptions = dedupe([
    ...(record.analysis.currentMortgage.assumptions ?? []),
    ...record.validationIssues
      .filter((issue) => issue.field === 'currentMortgage.currentInstallment')
      .map((issue) => issue.reason),
    ...(record.analysis.missingData.includes('currentMortgage.currentInstallment')
      ? [
          'No currentInstallment was provided; monthly cash flow falls back to the amortization estimate until that figure is supplied.',
        ]
      : []),
  ]);

  return buildScenarioRecord({
    record,
    scenarioType: 'current',
    monthlyInstallmentProvided: Boolean(record.analysis.currentMortgage.currentInstallment),
    totalRealCost,
    assumptions,
    triggeredRules: [
      totalCostFormula.id,
      ...(record.analysis.currentMortgage.currentInstallment ? [] : [installmentFormula.id]),
    ],
    inputs: [
      createExplainableValue({
        name: 'pendingPrincipal',
        value: record.analysis.currentMortgage.pendingPrincipal,
        sourceType: 'user_provided',
        explanation: 'Capital pendiente declarado para la hipoteca actual.',
      }),
      createExplainableValue({
        name: 'remainingMonths',
        value: String(record.analysis.currentMortgage.remainingMonths),
        sourceType: 'user_provided',
        explanation: 'Plazo restante declarado para la hipoteca actual.',
      }),
      createExplainableValue({
        name: 'nominalAnnualRate',
        value: record.analysis.currentMortgage.nominalAnnualRate,
        sourceType: 'user_provided',
        explanation: 'Tipo nominal anual declarado para la hipoteca actual.',
      }),
      ...(record.analysis.currentMortgage.currentInstallment
        ? [
            createExplainableValue({
              name: 'currentInstallment',
              value: record.analysis.currentMortgage.currentInstallment,
              sourceType: 'user_provided',
              explanation: 'Cuota actual declarada por la persona usuaria y reutilizada para el flujo mensual.',
            }),
          ]
        : []),
    ],
  });
};

const buildAlternativeScenario = (
  record: StoredAnalysisRecord,
  scenarioType: Extract<ScenarioType, 'alternative_without_bonus' | 'alternative_with_bonus'>,
): MortgageScenario => {
  const variant =
    scenarioType === 'alternative_without_bonus'
      ? record.analysis.alternativeOffer.withoutBonus
      : record.analysis.alternativeOffer.withBonus;

  if (!variant) {
    throw new Error(`Scenario ${scenarioType} requires an explicit offer variant`);
  }

  const totalRealCost = calculateTotalRealCost({
    pendingPrincipal: variant.pendingPrincipal,
    remainingMonths: variant.remainingMonths,
    nominalAnnualRate: variant.nominalAnnualRate,
    horizonMonths: record.analysis.horizonMonths,
    ...(variant.recurringCosts ? { recurringCosts: variant.recurringCosts } : {}),
    ...(variant.linkedProductsMonthlyCost
      ? { linkedProductsMonthlyCost: variant.linkedProductsMonthlyCost }
      : {}),
    ...(record.analysis.switchCosts.length
      ? { switchCosts: record.analysis.switchCosts }
      : {}),
  });
  const installmentFormula = getRuleSource('ESTIMATED_INSTALLMENT');
  const totalCostFormula = getRuleSource('TOTAL_REAL_COST');

  return buildScenarioRecord({
    record,
    scenarioType,
    monthlyInstallmentProvided: false,
    totalRealCost,
    assumptions: dedupe([...(variant.assumptions ?? [])]),
    triggeredRules: [totalCostFormula.id, installmentFormula.id],
    inputs: [
      createExplainableValue({
        name: 'pendingPrincipal',
        value: variant.pendingPrincipal,
        sourceType: 'user_provided',
        explanation: 'Capital pendiente declarado para la oferta alternativa.',
      }),
      createExplainableValue({
        name: 'remainingMonths',
        value: String(variant.remainingMonths),
        sourceType: 'user_provided',
        explanation: 'Plazo restante declarado para la oferta alternativa.',
      }),
      createExplainableValue({
        name: 'nominalAnnualRate',
        value: variant.nominalAnnualRate,
        sourceType: 'user_provided',
        explanation: 'Tipo nominal anual declarado para la oferta alternativa.',
      }),
      ...(variant.linkedProductsMonthlyCost
        ? [
            createExplainableValue({
              name: 'linkedProductsMonthlyCost',
              value: variant.linkedProductsMonthlyCost,
              sourceType: 'user_provided',
              explanation: 'Coste mensual explícito de productos vinculados.',
            }),
          ]
        : []),
      ...(variant.bonificationRateDelta
        ? [
            createExplainableValue({
              name: 'bonificationRateDelta',
              value: variant.bonificationRateDelta,
              sourceType: 'user_provided',
              explanation: 'Reducción de tipo declarada para la variante con bonificaciones.',
            }),
          ]
        : []),
    ],
  });
};

interface BuildScenarioRecordOptions {
  record: StoredAnalysisRecord;
  scenarioType: ScenarioType;
  monthlyInstallmentProvided: boolean;
  totalRealCost: ReturnType<typeof calculateTotalRealCost>;
  assumptions: ReadonlyArray<string>;
  triggeredRules: ReadonlyArray<string>;
  inputs: ReturnType<typeof createExplainableValue>[];
}

const buildScenarioRecord = ({
  record,
  scenarioType,
  monthlyInstallmentProvided,
  totalRealCost,
  assumptions,
  triggeredRules,
  inputs,
}: BuildScenarioRecordOptions): MortgageScenario => {
  const terms =
    scenarioType === 'current'
      ? record.analysis.currentMortgage
      : scenarioType === 'alternative_without_bonus'
        ? record.analysis.alternativeOffer.withoutBonus
        : record.analysis.alternativeOffer.withBonus!;
  const offerTerms =
    scenarioType === 'current'
      ? null
      : scenarioType === 'alternative_without_bonus'
        ? record.analysis.alternativeOffer.withoutBonus
        : record.analysis.alternativeOffer.withBonus!;

  return {
    scenarioType,
    loanPurpose: scenarioType === 'current' ? 'current_mortgage' : 'switch_offer',
    pendingPrincipal: terms.pendingPrincipal,
    remainingMonths: terms.remainingMonths,
    nominalAnnualRate: terms.nominalAnnualRate,
    ...(scenarioType === 'current' && record.analysis.currentMortgage.currentInstallment
      ? { currentInstallment: record.analysis.currentMortgage.currentInstallment }
      : {}),
    ...(offerTerms?.linkedProductsMonthlyCost
      ? { linkedProductsMonthlyCost: offerTerms.linkedProductsMonthlyCost }
      : {}),
    ...(offerTerms?.bonificationRateDelta
      ? { bonificationRateDelta: offerTerms.bonificationRateDelta }
      : {}),
  monthlyInstallment: totalRealCost.monthlyInstallment,
  monthlyInstallmentRaw: totalRealCost.rawMonthlyInstallment,
  interestPaid: totalRealCost.interestPaid,
  principalRepaid: totalRealCost.principalRepaid,
  remainingBalanceAfterHorizon: totalRealCost.remainingBalanceAfterHorizon,
  totalRealCost: totalRealCost.totalRealCost,
  finalAmountPaid: totalRealCost.finalAmountPaid,
  costBreakdown: totalRealCost.costBreakdown,
  inputs,
  triggeredRules: dedupe(triggeredRules),
  assumptions: [...assumptions],
    dataQualityStatus:
      assumptions.length > 0 ||
      (!monthlyInstallmentProvided && scenarioType === 'current')
        ? 'conditional_estimate'
        : 'complete',
  };
};

const buildRecommendation = (
  record: StoredAnalysisRecord,
  comparison: ComparisonComputationResult['comparison'],
): StoredSwitchRecommendation => {
  const currentScenario = comparison.scenarios.find(
    (scenario) => scenario.scenarioType === 'current',
  );
  const targetScenario = comparison.scenarios.find(
    (scenario) => scenario.scenarioType === comparison.bestScenarioType,
  );
  const recommendationRule = getRuleSource('RECOMMEND_SWITCH');
  const breakEvenFormula = getRuleSource('BREAK_EVEN');

  if (!currentScenario || !targetScenario || comparison.qualityStatus === 'blocked') {
    return {
      recommendedAction: 'insufficient_data',
      targetScenarioType: null,
      isSwitchWorthIt: false,
      breakEvenReached: false,
      netSavingsAtHorizon: '0.00',
      blockingReasons: [
        'The comparison is blocked, so the API cannot emit a mortgage switch recommendation yet.',
      ],
      explanation:
        'La comparación sigue bloqueada por datos críticos o inconsistencias; no se emite recomendación final.',
      triggeredRules: [recommendationRule.id],
      qualityStatus: 'blocked',
    };
  }

  const targetScenarioType = comparison.bestScenarioType;
  const netSavings = toDecimal(currentScenario.totalRealCost).minus(targetScenario.totalRealCost);
  const switchCostsTotal = sumSwitchCosts(record.analysis.switchCosts);
  const monthlySavings = calculateMonthlyOutflow(currentScenario).minus(
    calculateMonthlyOutflow(targetScenario),
  );
  const breakEvenMonth = calculateBreakEvenMonth(
    targetScenarioType,
    switchCostsTotal,
    monthlySavings,
    record.analysis.horizonMonths,
  );
  const breakEvenReached = breakEvenMonth !== null;
  const qualityStatus = comparison.qualityStatus;

  if (targetScenarioType === 'current') {
    return {
      recommendedAction: 'keep_current',
      targetScenarioType,
      isSwitchWorthIt: false,
      breakEvenReached: false,
      netSavingsAtHorizon: '0.00',
      blockingReasons: [
        'La hipoteca actual sigue siendo la opción con menor coste total real dentro del horizonte analizado.',
      ],
      explanation:
        'La comparación mantiene la hipoteca actual en cabeza por coste total real; cambiar no mejora el resultado económico del horizonte elegido.',
      triggeredRules: [recommendationRule.id],
      qualityStatus,
    };
  }

  return {
    recommendedAction:
      targetScenarioType === 'alternative_with_bonus'
        ? 'switch_with_bonus'
        : 'switch_without_bonus',
    targetScenarioType,
    isSwitchWorthIt: netSavings.gt(0),
    breakEvenReached,
    ...(breakEvenMonth ? { breakEvenMonth } : {}),
    netSavingsAtHorizon: formatMoney(netSavings),
    blockingReasons: breakEvenReached
      ? []
      : [
          'El ahorro mensual previsto no recupera todos los costes de cambio dentro del horizonte analizado.',
        ],
    explanation: breakEvenReached
      ? `Compensa cambiar a ${targetScenarioType} porque reduce el coste total real en ${formatMoney(
          netSavings,
        )} EUR y recupera los costes de cambio hacia el mes ${breakEvenMonth}.`
      : `El escenario ${targetScenarioType} reduce el coste total real frente a la referencia actual, pero no recupera los costes de cambio dentro del horizonte analizado.`,
    triggeredRules: dedupe([
      recommendationRule.id,
      ...(targetScenarioType === 'current' ? [] : [breakEvenFormula.id]),
    ]),
    qualityStatus,
  };
};

const buildAffordability = (
  scenario: MortgageScenario,
  householdProfile: HouseholdProfileInput,
): AffordabilityEvaluation => {
  const affordabilityTargetRule = getRuleSource('AFFORDABILITY_TARGET');
  const affordabilityThresholdRule = getRuleSource('AFFORDABILITY_THRESHOLDS');
  const netMonthlyIncome = toDecimal(householdProfile.netMonthlyIncome);
  const monthlyObligations = toDecimal(householdProfile.monthlyObligations);
  const monthlyPayment = toDecimal(scenario.monthlyInstallment);
  const debtRatioValue = monthlyPayment.plus(monthlyObligations).div(netMonthlyIncome);
  const classification = classifyAffordability(debtRatioValue);
  const assumptions = dedupe([
    ...scenario.assumptions,
    ...(householdProfile.incomeStability && householdProfile.incomeStability !== 'stable'
      ? [
          'El hogar no declara ingresos estables; la clasificación de asequibilidad debe leerse como estimación condicionada.',
          ...(householdProfile.notes
            ? [`Contexto adicional del hogar: ${householdProfile.notes}`]
            : []),
        ]
      : []),
  ]);
  const qualityStatus = mergeQualityStatuses(
    scenario.dataQualityStatus,
    assumptions.length > scenario.assumptions.length ? 'conditional_estimate' : 'complete',
  );

  return {
    scenarioType: scenario.scenarioType,
    monthlyPaymentConsidered: scenario.monthlyInstallment,
    netMonthlyIncome: householdProfile.netMonthlyIncome,
    monthlyObligations: householdProfile.monthlyObligations,
    debtRatio: formatPercentage(debtRatioValue.mul(100)),
    classification,
    explanation: `La asequibilidad se calcula sobre ${scenario.scenarioType}. Con una cuota de ${scenario.monthlyInstallment} EUR y obligaciones de ${formatMoney(
      monthlyObligations,
    )} EUR, el endeudamiento resultante es ${formatPercentage(debtRatioValue.mul(100))}% y la clasificación queda en ${classification}.`,
    assumptions,
    triggeredRules: [affordabilityTargetRule.id, affordabilityThresholdRule.id],
    qualityStatus,
  };
};

const buildMissingData = (input: CreateAnalysisInput) => {
  const missingData: string[] = [];

  if (!input.currentMortgage.currentInstallment) {
    missingData.push('currentMortgage.currentInstallment');
  }

  return missingData;
};

const buildAssumptions = (
  input: CreateAnalysisInput,
  validationIssues: ReadonlyArray<ValidationIssue>,
  repository: AnalysisRepository,
) =>
  dedupe([
    ...validationIssues
      .filter((issue) => issue.severity === 'warning')
      .map((issue) => issue.reason),
    ...(!input.currentMortgage.currentInstallment
      ? [
          'No currentInstallment was provided; installment deltas rely on amortization estimates until that figure is supplied.',
        ]
      : []),
    ...(input.householdProfile?.incomeStability &&
    input.householdProfile.incomeStability !== 'stable'
      ? [
          'Household affordability should be treated cautiously because income stability is not marked as stable.',
        ]
      : []),
    ...(input.retentionPreference === 'save_analysis' &&
    !repository.capabilities.supportsDurableStorage
      ? [
          'save_analysis was requested, but PostgreSQL persistence is not wired yet; this analysis currently survives only while the API process stays alive.',
        ]
      : []),
  ]);

const deriveAnalysisDataQualityStatus = (
  validationStatus: DataQualityStatus,
  missingData: ReadonlyArray<string>,
  assumptions: ReadonlyArray<string>,
): DataQualityStatus => {
  if (validationStatus === 'blocked') {
    return 'blocked';
  }

  return missingData.length > 0 || assumptions.length > 0 || validationStatus === 'conditional_estimate'
    ? 'conditional_estimate'
    : 'complete';
};

const buildRetentionMetadata = (
  retentionPreference: CreateAnalysisInput['retentionPreference'],
  repository: AnalysisRepository,
  expiresAt: string,
): RetentionMetadata => {
  if (retentionPreference === 'session_only') {
    return {
      provider: repository.capabilities.provider,
      mode: 'session_ephemeral',
      durable: false,
      access: 'analysis_session_cookie',
      message: `Session analyses stay tied to the analysis_session cookie and expire after 4 hours of inactivity (current expiry: ${expiresAt}).`,
    };
  }

  return {
    provider: repository.capabilities.provider,
    mode: repository.capabilities.supportsDurableStorage
      ? 'saved_analysis'
      : 'save_requested_fallback',
    durable: repository.capabilities.supportsDurableStorage,
    access: 'analysis_session_cookie',
    message: repository.capabilities.supportsDurableStorage
      ? 'Saved analyses are persisted in the configured storage backend for up to 30 days.'
      : 'PostgreSQL persistence is not configured; save_analysis keeps the analysis in process memory and may disappear if the API restarts before the 30-day retention window ends.',
  };
};

const buildExpiresAt = (
  createdAt: Date,
  retentionPreference: CreateAnalysisInput['retentionPreference'],
  sessionTtlMinutes: number,
  savedRetentionDays: number,
) =>
  retentionPreference === 'session_only'
    ? addMinutes(createdAt, sessionTtlMinutes).toISOString()
    : addDays(createdAt, savedRetentionDays).toISOString();

const buildPurgeAfter = (
  expiresAt: string,
  retentionPreference: CreateAnalysisInput['retentionPreference'],
  sessionPurgeMinutes: number,
  savedPurgeHours: number,
) =>
  retentionPreference === 'session_only'
    ? addMinutes(new Date(expiresAt), sessionPurgeMinutes).toISOString()
    : addHours(new Date(expiresAt), savedPurgeHours).toISOString();

const classifyAffordability = (debtRatio: ReturnType<typeof toDecimal>) => {
  const thresholds = getRuleSource('AFFORDABILITY_THRESHOLDS').thresholds;
  const affordableThreshold = toDecimal(thresholds?.affordable ?? '0.35');
  const tightThreshold = toDecimal(thresholds?.tight ?? '0.40');

  if (debtRatio.lte(affordableThreshold)) {
    return 'asumible';
  }

  if (debtRatio.lte(tightThreshold)) {
    return 'ajustada';
  }

  return 'no_asumible';
};

const calculateBreakEvenMonth = (
  targetScenarioType: ScenarioType,
  switchCostsTotal: ReturnType<typeof toDecimal>,
  monthlySavings: ReturnType<typeof toDecimal>,
  horizonMonths: number,
) => {
  if (targetScenarioType === 'current') {
    return null;
  }

  if (switchCostsTotal.lte(0)) {
    return 1;
  }

  if (monthlySavings.lte(0)) {
    return null;
  }

  const month = Math.ceil(switchCostsTotal.div(monthlySavings).toNumber());

  return month <= horizonMonths ? month : null;
};

const calculateMonthlyOutflow = (scenario: MortgageScenario) =>
  scenario.costBreakdown.reduce(
    (total, line) => {
      if (!line.includedInTotalCost) {
        return total;
      }

      if (line.timing === 'monthly') {
        return total.plus(line.amount);
      }

      if (line.timing === 'annual') {
        return total.plus(toDecimal(line.amount).div(12));
      }

      return total;
    },
    toDecimal(scenario.monthlyInstallment),
  );

const sumSwitchCosts = (switchCosts: StoredAnalysisRecord['analysis']['switchCosts']) =>
  switchCosts.reduce(
    (total, cost) =>
      cost.includedInTotalCost === false ? total : total.plus(cost.amount),
    toDecimal(0),
  );

const mergeQualityStatuses = (...statuses: ReadonlyArray<DataQualityStatus>) =>
  statuses.reduce<DataQualityStatus>(
    (current, candidate) =>
      QUALITY_PRIORITY[candidate] > QUALITY_PRIORITY[current] ? candidate : current,
    'complete',
  );

const dedupe = <T>(values: ReadonlyArray<T>) => [...new Set(values)];

const addMinutes = (value: Date, minutes: number) =>
  new Date(value.getTime() + minutes * 60_000);

const addHours = (value: Date, hours: number) =>
  new Date(value.getTime() + hours * 3_600_000);

const addDays = (value: Date, days: number) => new Date(value.getTime() + days * 86_400_000);
