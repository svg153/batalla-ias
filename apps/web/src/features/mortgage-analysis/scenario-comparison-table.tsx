import type { ComparisonResult, ScenarioResult } from './types';
import {
  dataQualityLabels,
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
  scenarioLabels
} from './types';

interface ScenarioComparisonTableProps {
  comparison: ComparisonResult;
}

export function ScenarioComparisonTable({
  comparison
}: ScenarioComparisonTableProps) {
  const orderedScenarios = comparison.ranking
    .map((scenarioType) =>
      comparison.scenarios.find((scenario) => scenario.scenarioType === scenarioType)
    )
    .filter(Boolean) as ScenarioResult[];

  const hasBonusScenario = comparison.scenarios.some(
    (scenario) => scenario.scenarioType === 'alternative_with_bonus'
  );

  return (
    <section className="comparison-card">
      <div className="comparison-card__header">
        <div>
          <p className="eyebrow">Comparación</p>
          <h2>Ranking por coste total real</h2>
          <p className="section-heading__copy">{comparison.explanation}</p>
        </div>
        <div className="comparison-highlights">
          <div className="metric-card">
            <span>Escenarios comparados</span>
            <strong>{comparison.scenarioCount}</strong>
          </div>
          <div className="metric-card">
            <span>Mejor coste visible</span>
            <strong>
              {comparison.bestScenarioType
                ? scenarioLabels[comparison.bestScenarioType]
                : scenarioLabels[orderedScenarios[0]?.scenarioType ?? 'current']}
            </strong>
          </div>
          <div className="metric-card">
            <span>Estado de calidad</span>
            <strong>{dataQualityLabels[comparison.dataQualityStatus]}</strong>
          </div>
        </div>
      </div>

      {!hasBonusScenario ? (
        <div className="comparison-note">
          No hay escenario con bonificaciones porque la oferta no lo definía. La tabla no inventa
          una tercera fila vacía.
        </div>
      ) : null}

      <div className="comparison-surface">
        <div className="comparison-table-wrapper comparison-table-wrapper--desktop">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Escenario</th>
                <th>Coste total real</th>
                <th>Cuota estimada</th>
                <th>Coste final pagado</th>
                <th>Delta vs actual</th>
                <th>Costes incluidos</th>
              </tr>
            </thead>
            <tbody>
              {orderedScenarios.map((scenario, index) => {
                const absoluteDelta =
                  comparison.absoluteDifferenceVsCurrent[scenario.scenarioType];
                const percentageDelta =
                  comparison.percentageDifferenceVsCurrent[scenario.scenarioType];
                const isWinner = index === 0;

                return (
                  <tr
                    key={scenario.scenarioType}
                    className={
                      isWinner
                        ? 'comparison-table__row comparison-table__row--winner'
                        : 'comparison-table__row'
                    }
                  >
                    <td>
                      <div className="rank-pill">
                        <span>{index + 1}</span>
                        {isWinner ? 'Mejor coste' : 'En ranking'}
                      </div>
                    </td>
                    <td>
                      <div className="scenario-name">
                        <strong>{scenarioLabels[scenario.scenarioType]}</strong>
                        <span className={`status-chip status-chip--${scenario.dataQualityStatus}`}>
                          {dataQualityLabels[scenario.dataQualityStatus]}
                        </span>
                        {scenario.assumptions.length > 0 ? (
                          <ul className="scenario-assumptions">
                            {scenario.assumptions.map((assumption) => (
                              <li key={assumption}>{assumption}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </td>
                    <td className="comparison-table__cell--primary">
                      {formatCurrency(scenario.totalRealCost)}
                    </td>
                    <td>{formatCurrency(scenario.monthlyInstallment)}</td>
                    <td>{formatCurrency(scenario.finalAmountPaid)}</td>
                    <td>
                      {scenario.scenarioType === 'current' ? (
                        <span className="delta delta--neutral">Base de comparación</span>
                      ) : (
                        <div className="delta-stack">
                          <span
                            className={`delta ${
                              Number(absoluteDelta ?? '0') <= 0 ? 'delta--good' : 'delta--bad'
                            }`}
                          >
                            {formatSignedCurrency(absoluteDelta)}
                          </span>
                          <span className="delta-subtle">{formatSignedPercent(percentageDelta)}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <ul className="cost-list">
                        {scenario.costBreakdown.map((cost) => (
                          <li key={`${scenario.scenarioType}-${cost.costType}-${cost.description}`}>
                            <span>{cost.description ?? cost.costType}</span>
                            <strong>{formatCurrency(cost.totalAmount ?? cost.amount)}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="comparison-card-stack" aria-label="Comparación por escenario">
          {orderedScenarios.map((scenario, index) => {
            const absoluteDelta = comparison.absoluteDifferenceVsCurrent[scenario.scenarioType];
            const percentageDelta = comparison.percentageDifferenceVsCurrent[scenario.scenarioType];
            const isWinner = index === 0;

            return (
              <article
                key={scenario.scenarioType}
                className={`comparison-card-item ${isWinner ? 'comparison-card-item--winner' : ''}`}
              >
                <header className="comparison-card-item__header">
                  <div>
                    <p className="eyebrow">Ranking #{index + 1}</p>
                    <h3>{scenarioLabels[scenario.scenarioType]}</h3>
                  </div>
                  <span className={`status-chip status-chip--${scenario.dataQualityStatus}`}>
                    {dataQualityLabels[scenario.dataQualityStatus]}
                  </span>
                </header>

                <div className="comparison-card-item__metrics">
                  <div className="metric-line metric-line--primary">
                    <span>Coste total real</span>
                    <strong>{formatCurrency(scenario.totalRealCost)}</strong>
                  </div>
                  <div className="metric-line">
                    <span>Cuota estimada</span>
                    <strong>{formatCurrency(scenario.monthlyInstallment)}</strong>
                  </div>
                  <div className="metric-line">
                    <span>Coste final pagado</span>
                    <strong>{formatCurrency(scenario.finalAmountPaid)}</strong>
                  </div>
                </div>

                <div className="comparison-card-item__delta">
                  {scenario.scenarioType === 'current' ? (
                    <span className="delta delta--neutral">Base de comparación</span>
                  ) : (
                    <>
                      <span
                        className={`delta ${
                          Number(absoluteDelta ?? '0') <= 0 ? 'delta--good' : 'delta--bad'
                        }`}
                      >
                        {formatSignedCurrency(absoluteDelta)}
                      </span>
                      <span className="delta-subtle">{formatSignedPercent(percentageDelta)}</span>
                    </>
                  )}
                </div>

                {scenario.assumptions.length > 0 ? (
                  <ul className="scenario-assumptions">
                    {scenario.assumptions.map((assumption) => (
                      <li key={assumption}>{assumption}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="comparison-card-item__costs">
                  <p className="eyebrow">Costes incluidos</p>
                  <ul className="cost-list">
                    {scenario.costBreakdown.map((cost) => (
                      <li key={`${scenario.scenarioType}-${cost.costType}-${cost.description}`}>
                        <span>{cost.description ?? cost.costType}</span>
                        <strong>{formatCurrency(cost.totalAmount ?? cost.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <footer className="comparison-card__footer comparison-card__footer--stacked">
        <div>
          <p className="eyebrow">Reglas disparadas</p>
          <div className="tag-row">
            {comparison.triggeredRules.map((rule) => (
              <span key={rule} className="tag">
                {rule}
              </span>
            ))}
          </div>
        </div>

        {comparison.traceReferences.length > 0 ? (
          <div>
            <p className="eyebrow">Trazas visibles</p>
            <div className="trace-list">
              {comparison.traceReferences.map((reference) => (
                <article key={`${reference.code}-${reference.version}`} className="trace-card">
                  <strong>{reference.code}</strong>
                  <span>
                    v{reference.version} · {reference.kind}
                  </span>
                  <p>{reference.summary}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </footer>
    </section>
  );
}
