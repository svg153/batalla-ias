import { useMutation } from '@tanstack/react-query';
import { DataQualityBanner } from '../components/data-quality-banner';
import { MetricCard, StageBadge, UnavailablePanel } from '../components/analysis-ui';
import { SupportingMetadata } from '../components/supporting-metadata';
import { AnalysisForm } from '../features/mortgage-analysis/analysis-form';
import { AffordabilityBlock } from '../features/mortgage-analysis/affordability-block';
import { RecommendationBlock } from '../features/mortgage-analysis/recommendation-block';
import { ScenarioComparisonTable } from '../features/mortgage-analysis/scenario-comparison-table';
import { type AnalysisExperience } from '../features/mortgage-analysis/types';
import { analyzeMortgage } from '../services/analysis-api';

export function MortgageAnalysisPage() {
  const mutation = useMutation({
    mutationFn: analyzeMortgage
  });

  const result = mutation.data;
  const hasComputedResult = Boolean(result?.comparison && result.recommendation);
  const hasComparison = Boolean(result?.comparison);

  return (
    <main className="page-shell">
      <header className="briefing-header">
        <section className="briefing-header__content card-surface">
          <p className="eyebrow">Batalla IAS · mesa editorial hipotecaria</p>
          <h1>Comparación hipotecaria con evidencia visible</h1>
          <p className="briefing-header__lede">
            Esta interfaz funciona como un briefing financiero: prioriza el coste total real,
            muestra los costes de cambio y no disfraza los fallbacks ni la retención.
          </p>

          <div className="briefing-header__summary">
            <MetricCard label="Ranking" value="Coste total real" emphasis="primary" />
            <MetricCard label="Asequibilidad" value="35% / 40% visibles" />
            <MetricCard label="Retención por defecto" value="Solo sesión" />
          </div>
        </section>

        <aside className="briefing-header__notes card-surface">
          <p className="eyebrow">Guardrails visibles</p>
          <ul className="briefing-header__list">
            <li>Los gastos del cambio entran antes de decir si compensa.</li>
            <li>Si no existe bonificación, el resultado se queda en dos escenarios.</li>
            <li>La propiedad del análisis y su retención se cuentan con el lenguaje del backend.</li>
            <li>Si una ruta aún no existe, se ve como fallback local, no como éxito falso.</li>
          </ul>
        </aside>
      </header>

      <section className="page-layout">
        <div className="page-layout__main">
          <AnalysisForm
            isSubmitting={mutation.isPending}
            onSubmit={async (request) => {
              await mutation.mutateAsync(request);
            }}
            submissionError={mutation.error instanceof Error ? mutation.error.message : null}
          />

          {result ? (
            <section className="results-stack">
              <header className="results-stack__header results-stack__header--editorial">
                <div>
                  <p className="eyebrow">Briefing de resultados</p>
                  <h2>
                    {hasComputedResult
                      ? 'Comparación, recomendación y asequibilidad con fuente visible'
                      : 'El análisis existe, pero no fingimos un cálculo que no llegó'}
                  </h2>
                  <p className="results-stack__lede">
                    El orden no cambia: primero la comparación, luego la recomendación y por último
                    la asequibilidad sobre el escenario recomendado.
                  </p>
                </div>
                <div className="stage-strip">
                  <StageBadge stage={result.stages.analysis} />
                  <StageBadge stage={result.stages.comparison} />
                  <StageBadge stage={result.stages.affordability} />
                </div>
              </header>

              <NoticeStack notices={result.notices} />

              <DataQualityBanner
                assumptions={result.analysis.assumptions}
                missingData={result.analysis.missingData}
                status={result.analysis.dataQualityStatus}
              />

              {hasComparison && result.comparison ? (
                <ScenarioComparisonTable comparison={result.comparison} />
              ) : (
                <UnavailablePanel title={result.stages.comparison.label} description={result.stages.comparison.detail} />
              )}

              <div className="results-flow">
                <RecommendationBlock
                  comparison={result.comparison}
                  recommendation={result.recommendation}
                  stage={result.stages.comparison}
                />
                <AffordabilityBlock affordability={result.affordability} stage={result.stages.affordability} />
              </div>
            </section>
          ) : mutation.isPending ? (
            <section className="results-stack results-stack--placeholder">
              <header className="results-stack__header">
                <div>
                  <p className="eyebrow">Calculando</p>
                  <h2>Estamos creando el análisis y probando cada tramo del flujo</h2>
                </div>
              </header>
              <div className="panel-grid">
                <LoadingPanel title="Creando análisis" copy="Primero intentamos abrir la sesión real en la API." />
                <LoadingPanel title="Comparando escenarios" copy="Después resolvemos compare en backend o marcamos fallback local si no existe." />
                <LoadingPanel title="Midiendo asequibilidad" copy="La lectura del hogar solo sale si hay comparación válida o fallback visible." />
              </div>
            </section>
          ) : (
            <section className="results-stack results-stack--placeholder">
              <header className="results-stack__header">
                <div>
                  <p className="eyebrow">MVP operativo</p>
                  <h2>La salida ya tiene sitio para explicar el producto entero</h2>
                </div>
              </header>

              <div className="panel-grid">
                <PlaceholderPanel
                  eyebrow="Comparación"
                  title="Tabla con ranking, deltas y costes incluidos"
                  copy="Al enviar el formulario verás los escenarios reales disponibles, sin inventar una bonificación que no exista."
                />
                <PlaceholderPanel
                  eyebrow="Recomendación"
                  title="Ahorro neto, break-even y motivo de la decisión"
                  copy="La recomendación final se explica con ahorro, gastos del cambio y escenario objetivo, no con una cifra suelta."
                />
                <PlaceholderPanel
                  eyebrow="Asequibilidad"
                  title="Ratio del hogar, umbrales y bloqueos honestos"
                  copy="Si faltan ingresos o la ruta aún no existe, la interfaz lo dice. Si cabe, muestra por qué cabe."
                />
              </div>
            </section>
          )}
        </div>

        <aside className="page-layout__sidebar">
          <div className="sidebar-card">
            <p className="eyebrow">Guía del flujo</p>
            <h3>Qué cubre este corte del frontend</h3>
            <ol className="sidebar-list">
              <li>Formulario estructurado con guardrails para bonus, horizonte y hogar.</li>
              <li>Creación y lectura real del análisis cuando la API está disponible.</li>
              <li>Comparación y recomendación visibles aunque el backend aún no cierre todos los caminos.</li>
              <li>Asequibilidad explicada con los mismos umbrales que el producto promete.</li>
            </ol>
          </div>

          <SupportingMetadata analysis={result?.analysis} experience={result} />
        </aside>
      </section>
    </main>
  );
}

function NoticeStack({ notices }: { notices: AnalysisExperience['notices'] }) {
  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="notice-stack">
      {notices.map((notice, index) => (
        <article
          key={`${notice.title}-${index}`}
          className={`notice-card notice-card--${notice.tone}`}
        >
          <strong>{notice.title}</strong>
          <p>{notice.detail}</p>
        </article>
      ))}
    </section>
  );
}


function PlaceholderPanel({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <article className="panel-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p className="panel-copy">{copy}</p>
    </article>
  );
}

function LoadingPanel({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="panel-card panel-card--loading">
      <p className="eyebrow">En curso</p>
      <h3>{title}</h3>
      <p className="panel-copy">{copy}</p>
    </article>
  );
}
