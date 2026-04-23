export interface RuleSourceCitation {
  label: string;
  reference: string;
}

export interface RuleCatalogEntry {
  id: string;
  version: string;
  kind: 'formula' | 'rule' | 'validation';
  title: string;
  summary: string;
  rationale: string;
  sources: ReadonlyArray<RuleSourceCitation>;
  regressionStory: ReadonlyArray<string>;
  thresholds?: Readonly<Record<string, string>>;
}

export const RULE_SOURCES = {
  ESTIMATED_INSTALLMENT: {
    id: 'formula.estimated-installment.french-amortization',
    version: '1.0.0',
    kind: 'formula',
    title: 'Cuota estimada por amortización francesa',
    summary:
      'Aplica A = P·r / (1 - (1 + r)^-n); si r = 0, reparte el principal en cuotas iguales.',
    rationale:
      'La constitución exige una cuota reproducible y trazable para comparar escenarios.',
    sources: [
      {
        label: 'Plan MVP — Formula Inventory',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
      {
        label: 'Spec MVP — FR-004',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
    ],
    regressionStory: ['packages/domain/tests/unit/mortgage-formulas.test.ts'],
  },
  TOTAL_REAL_COST: {
    id: 'formula.total-real-cost.mvp-foundation',
    version: '1.0.0',
    kind: 'formula',
    title: 'Coste total real por escenario',
    summary:
      'Suma intereses del horizonte, costes recurrentes, costes iniciales y costes de cambio incluidos.',
    rationale:
      'El ranking debe responder al coste total real y no a la cuota aislada.',
    sources: [
      {
        label: 'Plan MVP — Total Cost Reality Gate',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#constitution-check',
      },
      {
        label: 'Spec MVP — FR-004/FR-007',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
    ],
    regressionStory: ['packages/domain/tests/unit/mortgage-formulas.test.ts'],
  },
  BREAK_EVEN: {
    id: 'formula.break-even.switch-cost-recovery',
    version: '1.0.0',
    kind: 'formula',
    title: 'Punto de equilibrio del cambio',
    summary:
      'Estima el primer mes en que el ahorro mensual acumulado cubre los costes de cambio declarados.',
    rationale:
      'La recomendación debe explicar cuándo se recupera el coste del cambio o dejar claro que no ocurre.',
    sources: [
      {
        label: 'Plan MVP — Formula Inventory',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
      {
        label: 'Spec MVP — FR-008/FR-009',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
    ],
    regressionStory: ['apps/api/tests/integration/analysis-calculation-flow.test.ts'],
  },
  COMPARE_SCENARIO_SET: {
    id: 'rule.compare-scenario-set',
    version: '1.0.0',
    kind: 'rule',
    title: 'Conjunto canónico de escenarios',
    summary:
      'Siempre compara current y alternative_without_bonus, y solo añade alternative_with_bonus si la entrada la define explícitamente.',
    rationale:
      'Evita escenarios implícitos o mágicos en la comparación del MVP.',
    sources: [
      {
        label: 'Spec MVP — FR-002/FR-005',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
      {
        label: 'Plan MVP — Rule Set',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
    ],
    regressionStory: ['apps/api/tests/integration/analysis-calculation-flow.test.ts'],
  },
  RANK_SCENARIOS_BY_TOTAL_COST: {
    id: 'rule.rank-scenarios-by-total-cost',
    version: '1.0.0',
    kind: 'rule',
    title: 'Ranking por coste total real',
    summary:
      'Ordena escenarios por coste total real ascendente y relega escenarios bloqueados al final.',
    rationale:
      'La comparación del MVP debe priorizar el menor coste total real con trazabilidad de calidad.',
    sources: [
      {
        label: 'Spec MVP — FR-007',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
      {
        label: 'Constitución — Decisión basada en coste total real',
        reference: '.specify/memory/constitution.md#iv-decision-basada-en-coste-total-real',
      },
    ],
    regressionStory: ['packages/domain/tests/regression/comparison-ranking.test.ts'],
  },
  RECOMMEND_SWITCH: {
    id: 'rule.recommend-switch',
    version: '1.0.0',
    kind: 'rule',
    title: 'Recomendación de cambio hipotecario',
    summary:
      'Prioriza el escenario con menor coste total real y exige recuperar los costes de cambio para recomendar el salto.',
    rationale:
      'La recomendación del MVP debe ser accionable, no una simple tabla de cuotas.',
    sources: [
      {
        label: 'Spec MVP — FR-008/FR-012',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
      {
        label: 'Plan MVP — Rule Set',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
    ],
    regressionStory: ['apps/api/tests/integration/analysis-calculation-flow.test.ts'],
  },
  CURRENT_INSTALLMENT_CONSISTENCY: {
    id: 'validation.current-installment-consistency',
    version: '1.0.0',
    kind: 'validation',
    title: 'Coherencia entre cuota declarada y cuota estimada',
    summary:
      'Compara la cuota declarada con la cuota estimada y avisa si la diferencia supera la tolerancia técnica.',
    rationale:
      'La spec exige señalar contradicciones materiales antes de emitir recomendaciones.',
    sources: [
      {
        label: 'Spec MVP — Edge case de datos contradictorios',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#edge-cases',
      },
      {
        label: 'Spec MVP — FR-014',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
    ],
    regressionStory: ['packages/domain/tests/unit/analysis-input.test.ts'],
    thresholds: {
      technicalToleranceEur: '0.50',
    },
  },
  AFFORDABILITY_TARGET: {
    id: 'rule.affordability-target-scenario',
    version: '1.0.0',
    kind: 'rule',
    title: 'Escenario objetivo de asequibilidad',
    summary:
      'La asequibilidad siempre se calcula sobre el escenario objetivo recomendado por la comparación vigente.',
    rationale:
      'Evita simulaciones inconsistentes o desacopladas de la recomendación activa.',
    sources: [
      {
        label: 'Spec MVP — FR-010',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
      {
        label: 'Plan MVP — Rule Set',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
    ],
    regressionStory: ['apps/api/tests/integration/analysis-calculation-flow.test.ts'],
  },
  AFFORDABILITY_THRESHOLDS: {
    id: 'rule.affordability-thresholds',
    version: '1.0.0',
    kind: 'rule',
    title: 'Umbrales de asequibilidad MVP',
    summary: 'Clasifica deuda <=35% como asumible, >35% y <=40% como ajustada y >40% como no asumible.',
    rationale:
      'Se deja versionado desde la base para evitar umbrales implícitos en capas futuras.',
    sources: [
      {
        label: 'Spec MVP — FR-011',
        reference: 'specs/001-mortgage-comparator-mvp/spec.md#functional-requirements',
      },
      {
        label: 'Plan MVP — Rule Set',
        reference: 'specs/001-mortgage-comparator-mvp/plan.md#domain-rules--formula-sources',
      },
    ],
    regressionStory: ['packages/domain/tests/unit/analysis-input.test.ts'],
    thresholds: {
      affordable: '0.35',
      tight: '0.40',
    },
  },
} as const satisfies Record<string, RuleCatalogEntry>;

export function getRuleSource<TName extends keyof typeof RULE_SOURCES>(
  name: TName,
): (typeof RULE_SOURCES)[TName] {
  return RULE_SOURCES[name];
}
