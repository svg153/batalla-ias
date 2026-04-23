import type { AffordabilityResult, StageStatus } from './types';
import { affordabilityLabels, dataQualityLabels, formatCurrency, formatPercent, scenarioLabels } from './types';
import { MetricCard, TraceReferenceList, UnavailablePanel } from '../../components/analysis-ui';

export function AffordabilityBlock({
  affordability,
  stage
}: {
  affordability?: AffordabilityResult;
  stage: StageStatus;
}) {
  if (!affordability) {
    return <UnavailablePanel title="Asequibilidad pendiente" description={stage.detail} />;
  }

  const heading = affordability.classification
    ? affordabilityLabels[affordability.classification]
    : dataQualityLabels[affordability.dataQualityStatus];

  return (
    <section className="evidence-block evidence-block--affordability">
      <header className="evidence-block__header">
        <div>
          <p className="eyebrow">Asequibilidad</p>
          <h2>{heading}</h2>
        </div>
        <span className={`status-chip status-chip--${affordability.dataQualityStatus}`}>
          {dataQualityLabels[affordability.dataQualityStatus]}
        </span>
      </header>

      <div className="metric-grid metric-grid--dense">
        <MetricCard
          label="Escenario evaluado"
          value={
            affordability.evaluatedScenarioType
              ? scenarioLabels[affordability.evaluatedScenarioType]
              : 'Sin escenario válido'
          }
        />
        <MetricCard
          label="Ratio de endeudamiento"
          value={affordability.debtRatio ? formatPercent(affordability.debtRatio) : 'No calculable'}
          emphasis="primary"
        />
        <MetricCard
          label="Cuota considerada"
          value={
            affordability.monthlyPaymentConsidered
              ? formatCurrency(affordability.monthlyPaymentConsidered)
              : 'No disponible'
          }
        />
        <MetricCard
          label="Ingresos / obligaciones"
          value={
            affordability.netMonthlyIncome
              ? `${formatCurrency(affordability.netMonthlyIncome)} · ${formatCurrency(
                  affordability.monthlyObligations
                )}`
              : 'Datos insuficientes'
          }
        />
      </div>

      <div className="panel-callout">
        <strong>Umbrales del MVP</strong>
        <p>Asumible hasta el 35%, ajustada entre 35% y 40%, no asumible por encima del 40%.</p>
      </div>

      <p className="panel-copy">{affordability.explanation}</p>

      {affordability.blockingReasons?.length ? (
        <div className="panel-callout panel-callout--warning">
          <strong>Bloqueos explícitos</strong>
          <ul>
            {affordability.blockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {affordability.assumptions.length > 0 ? (
        <div className="panel-callout">
          <strong>Hipótesis del hogar</strong>
          <ul>
            {affordability.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {affordability.triggeredRules?.length ? (
        <div>
          <p className="eyebrow">Reglas disparadas</p>
          <div className="tag-row">
            {affordability.triggeredRules.map((rule) => (
              <span key={rule} className="tag">
                {rule}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <TraceReferenceList references={affordability.traceReferences} compact />
    </section>
  );
}
