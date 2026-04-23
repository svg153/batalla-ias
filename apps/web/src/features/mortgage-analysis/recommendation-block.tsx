import type { ComparisonResult, StageStatus, SwitchRecommendation } from './types';
import {
  dataQualityLabels,
  formatCurrency,
  formatMonthWindow,
  formatSignedCurrency,
  recommendationLabels,
  scenarioLabels
} from './types';
import { MetricCard, TraceReferenceList, UnavailablePanel } from '../../components/analysis-ui';

export function RecommendationBlock({
  comparison,
  recommendation,
  stage
}: {
  comparison?: ComparisonResult;
  recommendation?: SwitchRecommendation;
  stage: StageStatus;
}) {
  if (!comparison || !recommendation) {
    return <UnavailablePanel title="Recomendación pendiente" description={stage.detail} />;
  }

  const targetScenario = recommendation.targetScenarioType ?? comparison.bestScenarioType ?? 'current';
  const targetScenarioLabel = scenarioLabels[targetScenario];
  const targetScenarioData = comparison.scenarios.find(
    (scenario) => scenario.scenarioType === targetScenario
  );
  const scenarioDelta =
    targetScenario === 'current'
      ? undefined
      : comparison.absoluteDifferenceVsCurrent[targetScenario];
  const switchCosts = targetScenarioData?.costBreakdown.filter(
    (cost) => cost.timing === 'one_off_switch'
  );
  const switchCostTotal = switchCosts?.reduce(
    (total, cost) => total + Number.parseFloat(cost.totalAmount ?? cost.amount),
    0
  );

  return (
    <section className="evidence-block evidence-block--recommendation">
      <header className="evidence-block__header">
        <div>
          <p className="eyebrow">Recomendación</p>
          <h2>{recommendationLabels[recommendation.recommendedAction]}</h2>
        </div>
        <div className="evidence-block__badges">
          <span
            className={`recommendation-pill ${
              recommendation.isSwitchWorthIt ? 'recommendation-pill--good' : 'recommendation-pill--neutral'
            }`}
          >
            {recommendation.isSwitchWorthIt ? 'Compensa cambiar' : 'No compensa aún'}
          </span>
          <span className={`status-chip status-chip--${recommendation.qualityStatus}`}>
            {dataQualityLabels[recommendation.qualityStatus]}
          </span>
        </div>
      </header>

      <div className="metric-grid metric-grid--dense">
        <MetricCard label="Escenario objetivo" value={targetScenarioLabel} />
        <MetricCard
          label="Coste total real"
          value={
            targetScenarioData?.totalRealCost
              ? formatCurrency(targetScenarioData.totalRealCost)
              : 'No informado'
          }
          emphasis="primary"
        />
        <MetricCard
          label="Ahorro neto al horizonte"
          value={formatCurrency(recommendation.netSavingsAtHorizon)}
        />
        <MetricCard
          label="Punto de equilibrio"
          value={recommendation.breakEvenReached ? formatMonthWindow(recommendation.breakEvenMonth) : 'No se alcanza'}
        />
        <MetricCard
          label="Delta vs actual"
          value={scenarioDelta ? formatSignedCurrency(scenarioDelta) : 'La actual es la referencia ganadora'}
        />
        <MetricCard
          label="Cuota estimada"
          value={
            targetScenarioData?.monthlyInstallment
              ? formatCurrency(targetScenarioData.monthlyInstallment)
              : 'No informada'
          }
        />
      </div>

      {typeof switchCostTotal === 'number' && Number.isFinite(switchCostTotal) ? (
        <div className="panel-callout">
          <strong>Gastos de cambio incluidos en el escenario objetivo</strong>
          <p>{formatCurrency(switchCostTotal.toFixed(2))}</p>
          {switchCosts?.length ? (
            <ul>
              {switchCosts.map((cost) => (
                <li key={`${targetScenario}-${cost.costType}-${cost.description}`}>
                  {cost.description ?? cost.costType}: {formatCurrency(cost.totalAmount ?? cost.amount)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="panel-copy">{recommendation.explanation}</p>

      {recommendation.blockingReasons?.length ? (
        <div className="panel-callout panel-callout--warning">
          <strong>Lo que frena la recomendación</strong>
          <ul>
            {recommendation.blockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {recommendation.triggeredRules?.length ? (
        <div>
          <p className="eyebrow">Reglas disparadas</p>
          <div className="tag-row">
            {recommendation.triggeredRules.map((rule) => (
              <span key={rule} className="tag">
                {rule}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <TraceReferenceList references={recommendation.traceReferences} compact />
    </section>
  );
}
