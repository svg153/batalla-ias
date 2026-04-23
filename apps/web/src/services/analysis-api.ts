import type {
  AffordabilityClassification,
  AffordabilityResult,
  AnalysisExperience,
  AnalysisNotice,
  AnalysisSummary,
  ComparisonResult,
  CostInput,
  CostLine,
  CreateAnalysisRequest,
  DataQualityStatus,
  RecommendedAction,
  ResultSource,
  ScenarioResult,
  ScenarioType,
  StageStatus,
  SwitchRecommendation,
  TraceReference
} from '../features/mortgage-analysis/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const POLICY_VERSION = 'mortgage-mvp/es-ES@2026.04.23-v1';

const LOCAL_TRACE_REFERENCES: TraceReference[] = [
  {
    code: 'FORMULA_INSTALLMENT_FRENCH',
    kind: 'formula',
    version: '1.0.0',
    sourceDocument: 'specs/001-mortgage-comparator-mvp/plan.md',
    sourceSection: 'Domain Rules & Formula Sources',
    summary: 'Cuota estimada por amortización francesa para comparar escenarios.'
  },
  {
    code: 'FORMULA_TOTAL_REAL_COST',
    kind: 'formula',
    version: '1.0.0',
    sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
    sourceSection: 'FR-004 a FR-009',
    summary: 'Coste total real = intereses + costes recurrentes + costes del cambio incluidos.'
  },
  {
    code: 'RULE_RANK_BY_TOTAL_REAL_COST',
    kind: 'rule',
    version: '1.0.0',
    sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
    sourceSection: 'FR-007',
    summary: 'El ranking se decide por coste total real, no por la cuota aislada.'
  },
  {
    code: 'RULE_AFFORDABILITY_THRESHOLDS',
    kind: 'rule',
    version: '1.0.0',
    sourceDocument: 'specs/001-mortgage-comparator-mvp/spec.md',
    sourceSection: 'FR-011',
    summary: 'Asequibilidad: asumible <=35%, ajustada >35% y <=40%, no asumible >40%.'
  }
];

interface RequestSuccess<T> {
  data: T;
  headers: Headers;
}

interface RawErrorResponse {
  code?: string;
  message?: string;
  details?: Array<{
    field?: string;
    reason?: string;
    severity?: 'warning' | 'blocking';
  }>;
}

class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details: RawErrorResponse['details'] = [],
    public readonly requestUrl?: string,
    public readonly contentType?: string
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function analyzeMortgage(
  request: CreateAnalysisRequest
): Promise<AnalysisExperience> {
  try {
    return await analyzeWithApi(request);
  } catch (error) {
    if (isApiUnavailable(error)) {
      return buildLocalOnlyExperience(request, describeError(error));
    }

    throw error instanceof Error ? error : new Error('No se pudo completar el análisis.');
  }
}

async function analyzeWithApi(request: CreateAnalysisRequest): Promise<AnalysisExperience> {
  const created = await requestJson<{ analysis: unknown }>(`${API_BASE_URL}/analyses`, {
    method: 'POST',
    body: JSON.stringify(request)
  });

  let analysis = normalizeAnalysis(created.data.analysis, created.headers);
  const notices: AnalysisNotice[] = [];

  const liveGet = await tryRequestJson<{ analysis: unknown }>(
    `${API_BASE_URL}/analyses/${analysis.id}`,
    {
      method: 'GET'
    }
  );

  if (liveGet.ok) {
    analysis = normalizeAnalysis(liveGet.value.data.analysis, liveGet.value.headers);
  } else {
    notices.push({
      tone: 'warning',
      title: 'El análisis se creó, pero no pudimos releerlo',
      detail:
        'La creación en API ha funcionado, pero la lectura posterior no respondió. Conservamos los metadatos del POST para no perder el estado real del análisis.'
    });
  }

  if (analysis.retentionMetadata?.message) {
    notices.push({
      tone: analysis.retentionMetadata.durable === false ? 'warning' : 'info',
      title: 'Retención declarada por la API',
      detail: analysis.retentionMetadata.message
    });
  }

  const comparisonAttempt = await tryRequestJson<{ comparison: unknown; recommendation: unknown }>(
    `${API_BASE_URL}/analyses/${analysis.id}/compare`,
    {
      method: 'POST'
    }
  );

  let comparison: ComparisonResult | undefined;
  let recommendation: SwitchRecommendation | undefined;
  let comparisonStage: StageStatus;

  if (comparisonAttempt.ok) {
    comparison = normalizeComparison(comparisonAttempt.value.data.comparison);
    recommendation = normalizeRecommendation(
      comparisonAttempt.value.data.recommendation,
      comparison.bestScenarioType
    );
    comparisonStage = createStageStatus(
      'api',
      'Comparación calculada en API',
      `La API devolvió ${comparison.scenarioCount} escenario${comparison.scenarioCount === 1 ? '' : 's'} con ranking y recomendación.`
    );
  } else if (supportsVisibleFallback(comparisonAttempt.error)) {
    const preview = buildLocalComparisonBundle(request, describeError(comparisonAttempt.error));
    comparison = preview.comparison;
    recommendation = preview.recommendation;
    comparisonStage = createStageStatus(
      'local_preview',
      'Comparación resuelta en local',
      'El análisis existe en la API, pero el cálculo comparativo mostrado ahora mismo sale de una vista previa local visible.'
    );
    notices.push({
      tone: 'warning',
      title: 'Comparación aún no soportada por backend',
      detail:
        'Se ha creado y leído el análisis en la API, pero compare todavía no devuelve cálculo útil. La tabla, el ranking y la recomendación están marcados como vista previa local.'
    });
  } else {
    comparisonStage = createStageStatus(
      'unavailable',
      'Comparación no disponible',
      'La API creó el análisis, pero la comparación no se pudo completar y no se ha generado un resultado falso.'
    );
    notices.push({
      tone: 'error',
      title: 'La comparación no se pudo calcular',
      detail: describeError(comparisonAttempt.error)
    });
  }

  let affordability: AffordabilityResult | undefined;
  let affordabilityStage: StageStatus;

  if (!request.householdProfile) {
    affordabilityStage = createStageStatus(
      'not_requested',
      'Asequibilidad pendiente',
      'No se ha evaluado porque faltan ingresos y obligaciones del hogar en esta ejecución.'
    );
  } else if (!comparison || !recommendation) {
    affordabilityStage = createStageStatus(
      'unavailable',
      'Asequibilidad bloqueada',
      'Sin comparación válida no se emite evaluación de asequibilidad.'
    );
  } else if (comparisonStage.source === 'api') {
    const affordabilityAttempt = await tryRequestJson<{ affordability: unknown }>(
      `${API_BASE_URL}/analyses/${analysis.id}/affordability`,
      {
        method: 'POST',
        body: JSON.stringify({
          householdProfile: request.householdProfile
        })
      }
    );

    if (affordabilityAttempt.ok) {
      affordability = normalizeAffordability(
        affordabilityAttempt.value.data.affordability,
        recommendation.targetScenarioType
      );
      affordabilityStage = createStageStatus(
        'api',
        'Asequibilidad calculada en API',
        'La clasificación se ha recibido directamente del backend para el escenario objetivo de la recomendación.'
      );
    } else if (supportsVisibleFallback(affordabilityAttempt.error)) {
      affordability = buildAffordabilityPreview(
        recommendation.targetScenarioType,
        comparison.scenarios,
        request.householdProfile
      );
      affordabilityStage = createStageStatus(
        'local_preview',
        'Asequibilidad resuelta en local',
        'La comparación es real, pero la lectura de endeudamiento usa un cálculo visible del frontend porque la ruta aún no está soportada.'
      );
      notices.push({
        tone: 'warning',
        title: 'Asequibilidad aún no soportada por backend',
        detail:
          'La recomendación viene de la API, pero la clasificación de endeudamiento mostrada ahora mismo es un cálculo local marcado como estimación.'
      });
    } else {
      affordabilityStage = createStageStatus(
        'unavailable',
        'Asequibilidad no disponible',
        'La API no devolvió una evaluación y el frontend no la sustituye con un éxito falso.'
      );
      notices.push({
        tone: 'error',
        title: 'La asequibilidad no se pudo calcular',
        detail: describeError(affordabilityAttempt.error)
      });
    }
  } else {
    affordability = buildAffordabilityPreview(
      recommendation.targetScenarioType,
      comparison.scenarios,
      request.householdProfile
    );
    affordabilityStage = createStageStatus(
      'local_preview',
      'Asequibilidad resuelta en local',
      'Como la comparación se ha quedado en vista previa local, la asequibilidad también se deriva localmente para que no parezca una validación del backend.'
    );
  }

  return {
    analysis,
    comparison,
    recommendation,
    affordability,
    stages: {
      analysis: createStageStatus(
        'api',
        'Análisis creado en API',
        'La sesión del análisis se ha creado en el backend y la UI usa sus metadatos reales de retención y acceso.'
      ),
      comparison: comparisonStage,
      affordability: affordabilityStage
    },
    notices
  };
}

function buildLocalOnlyExperience(
  request: CreateAnalysisRequest,
  fallbackReason: string
): AnalysisExperience {
  const bundle = buildLocalComparisonBundle(request, fallbackReason);
  const affordability = request.householdProfile
    ? buildAffordabilityPreview(
        bundle.recommendation.targetScenarioType,
        bundle.comparison.scenarios,
        request.householdProfile
      )
    : undefined;

  return {
    analysis: buildLocalAnalysisSummary(request, fallbackReason),
    comparison: bundle.comparison,
    recommendation: bundle.recommendation,
    affordability,
    stages: {
      analysis: createStageStatus(
        'local_preview',
        'Vista previa local',
        'La API no ha estado disponible. Esta ejecución no crea un análisis real ni retención real en backend.'
      ),
      comparison: createStageStatus(
        'local_preview',
        'Comparación en local',
        'La tabla y la recomendación salen de una simulación visible del frontend mientras el backend no responde.'
      ),
      affordability: request.householdProfile
        ? createStageStatus(
            'local_preview',
            'Asequibilidad en local',
            'La clasificación del hogar también se estima localmente porque no hubo sesión real de API.'
          )
        : createStageStatus(
            'not_requested',
            'Asequibilidad pendiente',
            'No se ha calculado porque no se han enviado ingresos y obligaciones del hogar.'
          )
    },
    notices: [
      {
        tone: 'warning',
        title: 'API no disponible',
        detail: fallbackReason
      },
      {
        tone: 'warning',
        title: 'Esta salida no crea persistencia real',
        detail:
          'La vista local sirve para revisar la lógica de producto, pero no crea propiedad, cookie de acceso ni retención gestionada por backend.'
      },
      ...createNoBonusNotice(request)
    ]
  };
}

function buildLocalAnalysisSummary(
  request: CreateAnalysisRequest,
  fallbackReason: string
): AnalysisSummary {
  const missingData = collectMissingData(request);
  const assumptions = [
    'La API no respondió; se muestra una vista previa local explícita para no dejar el flujo muerto.',
    fallbackReason,
    ...collectRequestAssumptions(request)
  ];

  return {
    id: 'local-preview',
    status: 'compared',
    retentionPreference: request.retentionPreference,
    horizonMonths: request.horizonMonths,
    dataQualityStatus: deriveQualityStatus(missingData, assumptions),
    missingData,
    assumptions,
    createdAt: new Date().toISOString(),
    policyVersion: POLICY_VERSION,
    accessMode: 'local_preview',
    retentionMetadata: {
      provider: 'frontend-preview',
      mode: 'local_preview',
      durable: false,
      access: 'none',
      message: 'La vista previa local no conserva datos más allá de esta pestaña.'
    }
  };
}

function buildLocalComparisonBundle(
  request: CreateAnalysisRequest,
  fallbackReason: string
): {
  comparison: ComparisonResult;
  recommendation: SwitchRecommendation;
} {
  const current = buildScenario({
    scenarioType: 'current',
    mortgage: request.currentMortgage,
    horizonMonths: request.horizonMonths,
    switchCosts: [],
    linkedProductsMonthlyCost: 0,
    extraAssumptions: []
  });

  const withoutBonus = buildScenario({
    scenarioType: 'alternative_without_bonus',
    mortgage: request.alternativeOffer.withoutBonus,
    horizonMonths: request.horizonMonths,
    switchCosts: request.switchCosts,
    linkedProductsMonthlyCost: 0,
    extraAssumptions: []
  });

  const withBonus = request.alternativeOffer.withBonus
    ? buildScenario({
        scenarioType: 'alternative_with_bonus',
        mortgage: request.alternativeOffer.withBonus,
        horizonMonths: request.horizonMonths,
        switchCosts: request.switchCosts,
        linkedProductsMonthlyCost: parseMoney(
          request.alternativeOffer.withBonus.linkedProductsMonthlyCost
        ),
        extraAssumptions: []
      })
    : undefined;

  const scenarios = [current, withoutBonus, withBonus].filter(Boolean) as ScenarioResult[];
  const ranking = [...scenarios]
    .sort((left, right) => parseMoney(left.totalRealCost) - parseMoney(right.totalRealCost))
    .map((scenario) => scenario.scenarioType);
  const bestScenarioType = ranking[0] ?? 'current';
  const bestScenario =
    scenarios.find((scenario) => scenario.scenarioType === bestScenarioType) ?? current;
  const targetScenarioType = resolveTargetScenario(bestScenarioType);
  const netSavings = parseMoney(current.totalRealCost) - parseMoney(bestScenario.totalRealCost);
  const switchCostTotal = request.switchCosts.reduce(
    (total, cost) => total + expandCost(cost, request.horizonMonths),
    0
  );
  const targetMonthlyCost = runningMonthlyCost(bestScenario);
  const currentMonthlyCost = runningMonthlyCost(current);
  const monthlySaving = currentMonthlyCost - targetMonthlyCost;
  const rawBreakEvenMonth =
    bestScenarioType === 'current' || monthlySaving <= 0
      ? undefined
      : Math.ceil(switchCostTotal / monthlySaving);
  const breakEvenReached =
    rawBreakEvenMonth !== undefined && rawBreakEvenMonth <= request.horizonMonths;
  const recommendationAction =
    netSavings > 0 && breakEvenReached ? resolveRecommendedAction(bestScenarioType) : 'keep_current';

  const explanationParts = [
    `La vista previa local ordena ${scenarios.length} escenario${scenarios.length === 1 ? '' : 's'} por coste total real en ${request.horizonMonths} meses.`,
    request.alternativeOffer.withBonus
      ? 'La oferta bonificada solo entra porque has declarado una variante explícita.'
      : 'No se muestra escenario con bonificaciones porque la oferta no lo define.'
  ];

  const comparison: ComparisonResult = {
    scenarios,
    ranking,
    scenarioCount: scenarios.length,
    bestScenarioType,
    dataQualityStatus: 'conditional_estimate',
    explanation: explanationParts.join(' '),
    triggeredRules: [
      'RULE_COMPARE_SCENARIO_SET',
      'RULE_RANK_BY_TOTAL_REAL_COST',
      'RULE_DATA_QUALITY'
    ],
    traceReferences: LOCAL_TRACE_REFERENCES.slice(0, 3),
    absoluteDifferenceVsCurrent: buildDifferenceMap(current, scenarios, 'absolute'),
    percentageDifferenceVsCurrent: buildDifferenceMap(current, scenarios, 'percentage')
  };

  const recommendation: SwitchRecommendation = {
    recommendedAction: recommendationAction,
    targetScenarioType,
    qualityStatus: 'conditional_estimate',
    isSwitchWorthIt: recommendationAction !== 'keep_current',
    breakEvenReached,
    breakEvenMonth: breakEvenReached ? rawBreakEvenMonth : undefined,
    netSavingsAtHorizon: formatFixed(Math.max(netSavings, 0)),
    blockingReasons:
      recommendationAction === 'keep_current'
        ? [
            netSavings <= 0
              ? 'La alternativa no mejora el coste total real dentro del horizonte elegido.'
              : 'El ahorro mensual visible no recupera todos los gastos del cambio dentro del horizonte.'
          ]
        : undefined,
    triggeredRules: ['RULE_RECOMMEND_SWITCH', 'FORMULA_BREAK_EVEN'],
    traceReferences: [LOCAL_TRACE_REFERENCES[1], LOCAL_TRACE_REFERENCES[2]],
    explanation:
      recommendationAction === 'keep_current'
        ? 'Con esta vista previa no compensa cambiar: o bien el coste total real no mejora, o bien el ahorro no recupera los gastos del cambio en el horizonte analizado.'
        : breakEvenReached
          ? `La alternativa recomendada recupera los gastos del cambio alrededor del mes ${rawBreakEvenMonth} y llega al final del horizonte con ahorro neto positivo.`
          : 'La alternativa baja costes, pero la recuperación de gastos sigue siendo demasiado lenta para este horizonte.'
  };

  if (!request.alternativeOffer.withBonus) {
    comparison.scenarios.forEach((scenario) => {
      if (scenario.scenarioType !== 'current') {
        scenario.assumptions = [
          ...scenario.assumptions,
          'No existe variante bonificada declarada; la comparación se resuelve con dos escenarios reales.'
        ];
      }
    });
  }

  if (fallbackReason) {
    comparison.explanation = `${comparison.explanation} ${fallbackReason}`;
  }

  return { comparison, recommendation };
}

function buildScenario({
  scenarioType,
  mortgage,
  horizonMonths,
  switchCosts,
  linkedProductsMonthlyCost,
  extraAssumptions
}: {
  scenarioType: ScenarioType;
  mortgage: {
    pendingPrincipal: string;
    remainingMonths: number;
    nominalAnnualRate: string;
    currentInstallment?: string;
    recurringCosts?: CostInput[];
    linkedProductsMonthlyCost?: string;
  };
  horizonMonths: number;
  switchCosts: CostInput[];
  linkedProductsMonthlyCost: number;
  extraAssumptions: string[];
}): ScenarioResult {
  const principal = parseMoney(mortgage.pendingPrincipal);
  const remainingMonths = mortgage.remainingMonths;
  const annualRate = parseMoney(mortgage.nominalAnnualRate);
  const effectiveHorizon = Math.max(1, Math.min(horizonMonths, remainingMonths));
  const simulation = simulateMortgage(principal, annualRate, remainingMonths, effectiveHorizon);
  const declaredInstallment = parseMoney(mortgage.currentInstallment);
  const monthlyInstallment =
    declaredInstallment > 0 && scenarioType === 'current'
      ? declaredInstallment
      : simulation.monthlyInstallment;

  const recurringCosts = mortgage.recurringCosts ?? [];
  const recurringCostLines = recurringCosts.map((cost) => normalizeCostLine(cost, effectiveHorizon));
  const recurringCostTotal = recurringCostLines.reduce(
    (total, cost) => total + parseMoney(cost.totalAmount ?? cost.amount),
    0
  );
  const linkedProductLine =
    linkedProductsMonthlyCost > 0
      ? [
          {
            costType: 'linked_product' as const,
            timing: 'monthly' as const,
            amount: formatFixed(linkedProductsMonthlyCost),
            totalAmount: formatFixed(linkedProductsMonthlyCost * effectiveHorizon),
            periodsApplied: effectiveHorizon,
            description: 'Productos vinculados de la bonificación',
            sourceType: 'user_provided' as const,
            includedInTotalCost: true
          }
        ]
      : [];
  const switchCostLines = switchCosts.map((cost) => normalizeCostLine(cost, effectiveHorizon));
  const switchCostTotal = switchCostLines.reduce(
    (total, cost) => total + parseMoney(cost.totalAmount ?? cost.amount),
    0
  );
  const linkedProductsTotal = linkedProductsMonthlyCost * effectiveHorizon;
  const totalRealCost =
    simulation.totalInterest + recurringCostTotal + linkedProductsTotal + switchCostTotal;
  const finalAmountPaid = monthlyInstallment * effectiveHorizon + recurringCostTotal + linkedProductsTotal + switchCostTotal;

  const costBreakdown: CostLine[] = [
    {
      costType: 'other',
      timing: 'monthly',
      amount: formatFixed(simulation.totalInterest / effectiveHorizon),
      totalAmount: formatFixed(simulation.totalInterest),
      periodsApplied: effectiveHorizon,
      description: `Intereses estimados en ${effectiveHorizon} meses`,
      sourceType: 'calculated',
      includedInTotalCost: true
    },
    ...recurringCostLines,
    ...linkedProductLine,
    ...switchCostLines
  ];

  return {
    scenarioType,
    monthlyInstallment: formatFixed(monthlyInstallment),
    totalRealCost: formatFixed(totalRealCost),
    finalAmountPaid: formatFixed(finalAmountPaid),
    costBreakdown,
    triggeredRules: ['FORMULA_INSTALLMENT_FRENCH', 'FORMULA_TOTAL_REAL_COST'],
    assumptions: [
      ...extraAssumptions,
      ...(effectiveHorizon < horizonMonths
        ? ['El horizonte visual se limita al plazo restante de este escenario.']
        : []),
      ...(scenarioType === 'current' && !mortgage.currentInstallment
        ? ['No se informó la cuota actual; esta lectura la estima con amortización francesa.']
        : [])
    ],
    dataQualityStatus: 'conditional_estimate'
  };
}

function buildAffordabilityPreview(
  targetScenarioType: ScenarioType | undefined,
  scenarios: ScenarioResult[],
  householdProfile: NonNullable<CreateAnalysisRequest['householdProfile']>
): AffordabilityResult {
  const selectedScenario =
    scenarios.find((scenario) => scenario.scenarioType === targetScenarioType) ?? scenarios[0];
  const income = parseMoney(householdProfile.netMonthlyIncome);
  const obligations = parseMoney(householdProfile.monthlyObligations);
  const payment = parseMoney(selectedScenario?.monthlyInstallment);

  if (!selectedScenario || income <= 0) {
    return {
      evaluatedScenarioType: targetScenarioType,
      dataQualityStatus: 'blocked',
      blockingReasons: ['Faltan ingresos netos válidos para calcular el ratio de endeudamiento.'],
      explanation:
        'No emitimos una clasificación porque falta un ingreso neto fiable. La salida queda bloqueada en vez de inventar una cuarta categoría.',
      assumptions: collectAffordabilityAssumptions(householdProfile),
      triggeredRules: ['RULE_AFFORDABILITY_TARGET', 'RULE_AFFORDABILITY_THRESHOLDS'],
      traceReferences: [LOCAL_TRACE_REFERENCES[3]]
    };
  }

  const ratio = (payment + obligations) / income;
  let classification: AffordabilityClassification = 'no_asumible';

  if (ratio <= 0.35) {
    classification = 'asumible';
  } else if (ratio <= 0.4) {
    classification = 'ajustada';
  }

  return {
    evaluatedScenarioType: selectedScenario.scenarioType,
    debtRatio: formatFixed(ratio),
    classification,
    dataQualityStatus:
      householdProfile.incomeStability === 'stable' ? 'complete' : 'conditional_estimate',
    monthlyPaymentConsidered: selectedScenario.monthlyInstallment,
    netMonthlyIncome: householdProfile.netMonthlyIncome,
    monthlyObligations: householdProfile.monthlyObligations,
    explanation:
      classification === 'asumible'
        ? 'La cuota recomendada y las otras obligaciones quedan dentro de un endeudamiento que el MVP considera asumible.'
        : classification === 'ajustada'
          ? 'La operación cabe, pero con poco margen: cae en la franja ajustada entre el 35% y el 40%.'
          : 'La suma de cuota recomendada y obligaciones supera el 40% de endeudamiento mensual. La UI lo presenta como no asumible, no como entusiasmo comercial.',
    assumptions: collectAffordabilityAssumptions(householdProfile),
    triggeredRules: ['RULE_AFFORDABILITY_TARGET', 'RULE_AFFORDABILITY_THRESHOLDS'],
    traceReferences: [LOCAL_TRACE_REFERENCES[3]]
  };
}

function normalizeAnalysis(raw: unknown, headers: Headers): AnalysisSummary {
  const record = asRecord(raw);
  const status = record.status;

  return {
    id: toStringValue(record.id) ?? 'unknown-analysis',
    status:
      status === 'draft' ||
      status === 'validated' ||
      status === 'compared' ||
      status === 'saved' ||
      status === 'expired' ||
      status === 'deleted'
        ? status
        : 'draft',
    retentionPreference:
      record.retentionPreference === 'save_analysis' ? 'save_analysis' : 'session_only',
    horizonMonths: toNumberValue(record.horizonMonths) ?? 0,
    dataQualityStatus: normalizeQualityStatus(
      record.dataQualityStatus ?? record.qualityStatus
    ),
    missingData: toStringArray(record.missingData),
    assumptions: toStringArray(record.assumptions),
    createdAt: toStringValue(record.createdAt) ?? new Date().toISOString(),
    updatedAt: toStringValue(record.updatedAt),
    expiresAt: toStringValue(record.expiresAt),
    purgeAfter: toStringValue(record.purgeAfter),
    lastAccessedAt: toStringValue(record.lastAccessedAt),
    accessMode:
      toStringValue(record.accessMode) ?? headers.get('X-Analysis-Access-Model') ?? undefined,
    policyVersion: toStringValue(record.policyVersion),
    retentionMetadata: normalizeRetentionMetadata(record.retentionMetadata, headers)
  };
}

function normalizeComparison(raw: unknown): ComparisonResult {
  const record = asRecord(raw);
  const scenarios = toScenarioArray(record.scenarios);
  const ranking = toScenarioTypeArray(record.ranking, scenarios.map((scenario) => scenario.scenarioType));

  return {
    scenarios,
    ranking,
    scenarioCount: toNumberValue(record.scenarioCount) ?? scenarios.length,
    bestScenarioType:
      normalizeScenarioType(record.bestScenarioType) ?? ranking[0] ?? scenarios[0]?.scenarioType,
    dataQualityStatus: normalizeQualityStatus(
      record.dataQualityStatus ?? record.qualityStatus
    ),
    explanation: toStringValue(record.explanation) ?? 'La API devolvió una comparación sin explicación textual.',
    triggeredRules: toStringArray(record.triggeredRules),
    traceReferences: toTraceReferences(record.traceReferences),
    absoluteDifferenceVsCurrent: toScenarioMap(record.absoluteDifferenceVsCurrent),
    percentageDifferenceVsCurrent: toScenarioMap(record.percentageDifferenceVsCurrent)
  };
}

function normalizeRecommendation(
  raw: unknown,
  fallbackScenarioType: ScenarioType | undefined
): SwitchRecommendation {
  const record = asRecord(raw);
  const targetScenarioType =
    normalizeScenarioType(record.targetScenarioType) ??
    recommendedActionToScenario(record.recommendedAction) ??
    fallbackScenarioType;

  return {
    recommendedAction: normalizeRecommendedAction(record.recommendedAction),
    targetScenarioType,
    qualityStatus: normalizeQualityStatus(record.qualityStatus ?? record.dataQualityStatus),
    isSwitchWorthIt: Boolean(record.isSwitchWorthIt),
    breakEvenReached: Boolean(record.breakEvenReached),
    breakEvenMonth: toNumberValue(record.breakEvenMonth),
    netSavingsAtHorizon: toStringValue(record.netSavingsAtHorizon) ?? '0.00',
    blockingReasons: toStringArray(record.blockingReasons),
    triggeredRules: toStringArray(record.triggeredRules),
    traceReferences: toTraceReferences(record.traceReferences),
    explanation:
      toStringValue(record.explanation) ?? 'La API devolvió una recomendación sin explicación textual.'
  };
}

function normalizeAffordability(
  raw: unknown,
  fallbackScenarioType: ScenarioType | undefined
): AffordabilityResult {
  const record = asRecord(raw);
  const classification = normalizeAffordabilityClassification(record.classification);

  return {
    evaluatedScenarioType:
      normalizeScenarioType(record.evaluatedScenarioType) ??
      normalizeScenarioType(record.scenarioType) ??
      fallbackScenarioType,
    debtRatio: toStringValue(record.debtRatio),
    classification,
    dataQualityStatus: normalizeQualityStatus(
      record.dataQualityStatus ?? record.qualityStatus
    ),
    monthlyPaymentConsidered: toStringValue(record.monthlyPaymentConsidered),
    netMonthlyIncome: toStringValue(record.netMonthlyIncome),
    monthlyObligations: toStringValue(record.monthlyObligations),
    blockingReasons: toStringArray(record.blockingReasons),
    explanation:
      toStringValue(record.explanation) ??
      'La API devolvió una evaluación de asequibilidad sin explicación textual.',
    assumptions: toStringArray(record.assumptions),
    triggeredRules: toStringArray(record.triggeredRules),
    traceReferences: toTraceReferences(record.traceReferences)
  };
}

async function requestJson<T>(url: string, init: RequestInit): Promise<RequestSuccess<T>> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...init
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw buildApiError(response, payload, url);
  }

  return {
    data: payload as T,
    headers: response.headers
  };
}

async function tryRequestJson<T>(url: string, init: RequestInit) {
  try {
    const value = await requestJson<T>(url, init);
    return { ok: true as const, value };
  } catch (error) {
    return { ok: false as const, error };
  }
}

async function parsePayload(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function buildApiError(response: Response, payload: unknown, requestUrl: string) {
  const errorPayload = asRecord(payload);
  const message =
    toStringValue(errorPayload.message) ??
    (typeof payload === 'string' ? payload : `Request failed with status ${response.status}`);

  return new ApiRequestError(
    response.status,
    message,
    toStringValue(errorPayload.code),
    Array.isArray(errorPayload.details)
      ? errorPayload.details.map((detail) => asRecord(detail)).map((detail) => ({
          field: toStringValue(detail.field),
          reason: toStringValue(detail.reason),
          severity: detail.severity === 'warning' ? 'warning' : 'blocking'
        }))
      : [],
    requestUrl,
    response.headers.get('content-type') ?? undefined
  );
}

function normalizeRetentionMetadata(raw: unknown, headers: Headers) {
  const record = asRecord(raw);
  const message = toStringValue(record.message);
  const provider = toStringValue(record.provider);
  const mode = toStringValue(record.mode) ?? headers.get('X-Analysis-Retention-Mode') ?? undefined;
  const access = toStringValue(record.access) ?? headers.get('X-Analysis-Access-Model') ?? undefined;
  const durable = typeof record.durable === 'boolean' ? record.durable : undefined;

  if (!provider && !mode && !access && durable === undefined && !message) {
    return undefined;
  }

  return {
    provider,
    mode,
    access,
    durable,
    message
  };
}

function normalizeScenario(raw: unknown): ScenarioResult {
  const record = asRecord(raw);

  return {
    scenarioType: normalizeScenarioType(record.scenarioType) ?? 'current',
    monthlyInstallment: toStringValue(record.monthlyInstallment) ?? '0.00',
    totalRealCost: toStringValue(record.totalRealCost) ?? '0.00',
    finalAmountPaid: toStringValue(record.finalAmountPaid) ?? '0.00',
    costBreakdown: toCostLines(record.costBreakdown),
    inputs: toExplainableInputs(record.inputs),
    triggeredRules: toStringArray(record.triggeredRules),
    assumptions: toStringArray(record.assumptions),
    dataQualityStatus: normalizeQualityStatus(record.dataQualityStatus ?? record.qualityStatus)
  };
}

function toScenarioArray(raw: unknown) {
  return Array.isArray(raw) ? raw.map(normalizeScenario) : [];
}

function toScenarioTypeArray(raw: unknown, fallback: ScenarioType[]) {
  if (!Array.isArray(raw)) {
    return fallback;
  }

  const values = raw
    .map((value) => normalizeScenarioType(value))
    .filter(Boolean) as ScenarioType[];

  return values.length > 0 ? values : fallback;
}

function toScenarioMap(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const next: Partial<Record<ScenarioType, string>> = {};

  for (const key of Object.keys(record)) {
    const scenarioType = normalizeScenarioType(key);
    const value = toStringValue(record[key]);

    if (scenarioType && value) {
      next[scenarioType] = value;
    }
  }

  return next;
}

function toCostLines(raw: unknown): CostLine[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((entry) => {
    const record = asRecord(entry);
    return {
      costType: normalizeCostType(record.costType),
      timing: normalizeTiming(record.timing),
      amount: toStringValue(record.amount) ?? '0.00',
      totalAmount: toStringValue(record.totalAmount),
      periodsApplied: toNumberValue(record.periodsApplied),
      description: toStringValue(record.description),
      sourceType: normalizeSourceType(record.sourceType),
      includedInTotalCost:
        typeof record.includedInTotalCost === 'boolean' ? record.includedInTotalCost : true
    };
  });
}

function toExplainableInputs(raw: unknown) {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  return raw
    .map((entry) => asRecord(entry))
    .map((record) => ({
      name: toStringValue(record.name) ?? 'Dato',
      value: toStringValue(record.value) ?? '—',
      sourceType: normalizeSourceType(record.sourceType),
      explanation: toStringValue(record.explanation)
    }));
}

function toTraceReferences(raw: unknown): TraceReference[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((entry) => {
    const record = asRecord(entry);
    return {
      code: toStringValue(record.code) ?? 'UNKNOWN',
      kind: record.kind === 'rule' ? 'rule' : 'formula',
      version: toStringValue(record.version) ?? 'n/a',
      sourceDocument: toStringValue(record.sourceDocument) ?? 'documentación no indicada',
      sourceSection: toStringValue(record.sourceSection) ?? 'sección no indicada',
      summary: toStringValue(record.summary) ?? 'Sin resumen disponible.'
    };
  });
}

function collectMissingData(request: CreateAnalysisRequest) {
  const missing: string[] = [];

  if (!request.currentMortgage.currentInstallment) {
    missing.push('Cuota actual declarada');
  }

  if (request.alternativeOffer.withBonus && !request.alternativeOffer.withBonus.bonificationRateDelta) {
    missing.push('Impacto exacto de la bonificación en el tipo');
  }

  if (request.householdProfile?.incomeStability === 'unknown') {
    missing.push('Estabilidad de ingresos confirmada');
  }

  return missing;
}

function collectRequestAssumptions(request: CreateAnalysisRequest) {
  const assumptions: string[] = [];

  if (request.retentionPreference === 'session_only') {
    assumptions.push(
      'La preferencia elegida es session_only: la expectativa declarada es caducar con la sesión o con la inactividad definida por el backend.'
    );
  }

  if (!request.alternativeOffer.withBonus) {
    assumptions.push('No existe una oferta con bonificaciones declarada; la comparación se limita a dos escenarios.');
  }

  if (request.householdProfile?.incomeStability === 'variable') {
    assumptions.push('La asequibilidad queda condicionada porque los ingresos del hogar son variables.');
  }

  return assumptions;
}

function collectAffordabilityAssumptions(
  householdProfile: NonNullable<CreateAnalysisRequest['householdProfile']>
) {
  const assumptions: string[] = [];

  if (householdProfile.incomeStability === 'variable') {
    assumptions.push(
      'Los ingresos variables deberían contrastarse con un escenario conservador antes de decidir.'
    );
  }

  if (householdProfile.incomeStability === 'unknown') {
    assumptions.push('La estabilidad de ingresos no está confirmada y la lectura queda condicionada.');
  }

  return assumptions;
}

function createNoBonusNotice(request: CreateAnalysisRequest): AnalysisNotice[] {
  return request.alternativeOffer.withBonus
    ? []
    : [
        {
          tone: 'info',
          title: 'Oferta sin bonificaciones',
          detail:
            'La comparación se queda en dos escenarios porque no has declarado una variante bonificada. La UI lo muestra sin inventar una tercera fila.'
        }
      ];
}

function deriveQualityStatus(missingData: string[], assumptions: string[]): DataQualityStatus {
  if (missingData.length > 0) {
    return 'conditional_estimate';
  }

  if (assumptions.length > 0) {
    return 'conditional_estimate';
  }

  return 'complete';
}

function buildDifferenceMap(
  current: ScenarioResult,
  scenarios: ScenarioResult[],
  mode: 'absolute' | 'percentage'
) {
  const result: Partial<Record<ScenarioType, string>> = {};
  const currentCost = parseMoney(current.totalRealCost);

  scenarios.forEach((scenario) => {
    if (scenario.scenarioType === 'current') {
      return;
    }

    const scenarioCost = parseMoney(scenario.totalRealCost);
    result[scenario.scenarioType] =
      mode === 'absolute'
        ? formatFixed(scenarioCost - currentCost)
        : currentCost === 0
          ? '0.00'
          : ((scenarioCost - currentCost) / currentCost).toFixed(4);
  });

  return result;
}

function runningMonthlyCost(scenario: ScenarioResult) {
  const basePayment = parseMoney(scenario.monthlyInstallment);
  const recurringExtras = scenario.costBreakdown.reduce((total, cost) => {
    if (cost.timing !== 'monthly' || cost.description?.startsWith('Intereses estimados')) {
      return total;
    }

    return total + parseMoney(cost.amount);
  }, 0);

  return basePayment + recurringExtras;
}

function normalizeCostLine(cost: CostInput, horizonMonths: number): CostLine {
  const totalAmount = expandCost(cost, horizonMonths);

  return {
    ...cost,
    amount: formatFixed(parseMoney(cost.amount)),
    totalAmount: formatFixed(totalAmount),
    periodsApplied: cost.timing === 'monthly' ? horizonMonths : cost.timing === 'annual' ? Math.ceil(horizonMonths / 12) : 1,
    includedInTotalCost: true
  };
}

function simulateMortgage(
  principal: number,
  annualRate: number,
  totalMonths: number,
  horizonMonths: number
) {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInstallment =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -totalMonths);

  let balance = principal;
  let totalInterest = 0;

  for (let month = 0; month < horizonMonths; month += 1) {
    const interest = balance * monthlyRate;
    let principalRepayment = monthlyInstallment - interest;

    if (principalRepayment > balance) {
      principalRepayment = balance;
    }

    balance -= principalRepayment;
    totalInterest += interest;
  }

  return {
    monthlyInstallment,
    totalInterest
  };
}

function expandCost(cost: CostInput, horizonMonths: number) {
  const amount = parseMoney(cost.amount);

  switch (cost.timing) {
    case 'monthly':
      return amount * horizonMonths;
    case 'annual':
      return amount * Math.max(1, Math.ceil(horizonMonths / 12));
    default:
      return amount;
  }
}

function resolveTargetScenario(bestScenarioType: ScenarioType): ScenarioType {
  return bestScenarioType;
}

function resolveRecommendedAction(bestScenarioType: ScenarioType): RecommendedAction {
  if (bestScenarioType === 'alternative_with_bonus') {
    return 'switch_with_bonus';
  }

  if (bestScenarioType === 'alternative_without_bonus') {
    return 'switch_without_bonus';
  }

  return 'keep_current';
}

function recommendedActionToScenario(value: unknown): ScenarioType | undefined {
  if (value === 'switch_without_bonus') {
    return 'alternative_without_bonus';
  }

  if (value === 'switch_with_bonus') {
    return 'alternative_with_bonus';
  }

  if (value === 'keep_current') {
    return 'current';
  }

  return undefined;
}

function createStageStatus(source: ResultSource, label: string, detail: string): StageStatus {
  return { source, label, detail };
}

function supportsVisibleFallback(error: unknown) {
  return isApiUnavailable(error) || isFeatureNotImplemented(error);
}

function isFeatureNotImplemented(error: unknown) {
  return error instanceof ApiRequestError && (error.status === 501 || error.code === 'feature_not_implemented');
}

function isApiUnavailable(error: unknown) {
  return error instanceof TypeError || isMissingSameOriginApi(error);
}

function isMissingSameOriginApi(error: unknown) {
  return (
    error instanceof ApiRequestError &&
    (error.status === 404 || error.status === 405) &&
    error.requestUrl?.startsWith(API_BASE_URL) &&
    API_BASE_URL.startsWith('/') &&
    !error.contentType?.includes('application/json')
  );
}

function describeError(error: unknown) {
  if (error instanceof ApiRequestError) {
    const detailMessage = error.details
      ?.map((detail) => [detail.field, detail.reason].filter(Boolean).join(': '))
      .filter(Boolean)
      .join(' · ');

    return detailMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No hubo respuesta útil de la API.';
}

function normalizeQualityStatus(value: unknown): DataQualityStatus {
  return value === 'blocked' || value === 'conditional_estimate' || value === 'complete'
    ? value
    : 'conditional_estimate';
}

function normalizeScenarioType(value: unknown): ScenarioType | undefined {
  return value === 'current' ||
    value === 'alternative_without_bonus' ||
    value === 'alternative_with_bonus'
    ? value
    : undefined;
}

function normalizeRecommendedAction(value: unknown): RecommendedAction {
  return value === 'keep_current' ||
    value === 'switch_without_bonus' ||
    value === 'switch_with_bonus' ||
    value === 'insufficient_data'
    ? value
    : 'insufficient_data';
}

function normalizeAffordabilityClassification(
  value: unknown
): AffordabilityClassification | undefined {
  return value === 'asumible' || value === 'ajustada' || value === 'no_asumible'
    ? value
    : undefined;
}

function normalizeCostType(value: unknown): CostLine['costType'] {
  return value === 'agency' ||
    value === 'notary' ||
    value === 'appraisal' ||
    value === 'management' ||
    value === 'cancellation_fee' ||
    value === 'opening_fee' ||
    value === 'insurance' ||
    value === 'linked_product' ||
    value === 'other'
    ? value
    : 'other';
}

function normalizeTiming(value: unknown): CostLine['timing'] {
  return value === 'upfront' || value === 'monthly' || value === 'annual' || value === 'one_off_switch'
    ? value
    : 'upfront';
}

function normalizeSourceType(value: unknown): CostLine['sourceType'] {
  return value === 'user_provided' || value === 'inferred' || value === 'calculated'
    ? value
    : 'user_provided';
}

function toStringValue(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function toNumberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => toStringValue(entry)).filter(Boolean) as string[]
    : [];
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function parseMoney(value: string | number | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const numericValue = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatFixed(value: number) {
  return value.toFixed(2);
}
