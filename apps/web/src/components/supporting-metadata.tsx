import type { AnalysisExperience, AnalysisSummary } from '../features/mortgage-analysis/types';
import { retentionPreferenceLabels } from '../features/mortgage-analysis/types';
import { StageBadge } from './analysis-ui';

export function SupportingMetadata({
  analysis,
  experience
}: {
  analysis?: AnalysisSummary;
  experience?: AnalysisExperience;
}) {
  if (!analysis || !experience) {
    return (
      <div className="sidebar-card">
        <p className="eyebrow">Propiedad y sesión</p>
        <h3>La posesión importa</h3>
        <p className="panel-copy">
          En este MVP el análisis se asocia al navegador y a la sesión que lo crea. La UI no promete
          permanencia ni acceso por conocer un ID suelto.
        </p>
      </div>
    );
  }

  return (
    <div className="supporting-metadata">
      <section className="sidebar-card sidebar-card--dense">
        <p className="eyebrow">Propiedad y retención</p>
        <h3>Metadatos de sesión</h3>

        <dl className="meta-list">
          <div>
            <dt>ID del análisis</dt>
            <dd className="meta-list__mono">{analysis.id}</dd>
          </div>
          <div>
            <dt>Acceso declarado</dt>
            <dd>{analysis.accessMode ?? analysis.retentionMetadata?.access ?? 'No informado'}</dd>
          </div>
          <div>
            <dt>Retención elegida</dt>
            <dd>{retentionPreferenceLabels[analysis.retentionPreference]}</dd>
          </div>
          <div>
            <dt>Caduca</dt>
            <dd>{formatDateTime(analysis.expiresAt)}</dd>
          </div>
          <div>
            <dt>Purga después</dt>
            <dd>{formatDateTime(analysis.purgeAfter)}</dd>
          </div>
          <div>
            <dt>Política aplicada</dt>
            <dd className="meta-list__mono">{analysis.policyVersion ?? 'No informado'}</dd>
          </div>
        </dl>

        <div className="panel-callout">
          <strong>Estado real del backend</strong>
          <p>{analysis.retentionMetadata?.message ?? experience.stages.analysis.detail}</p>
        </div>
      </section>

      <section className="sidebar-card">
        <p className="eyebrow">Estado operativo</p>
        <h3>Tramos del flujo</h3>
        <div className="stage-strip stage-strip--compact">
          <StageBadge stage={experience.stages.analysis} />
          <StageBadge stage={experience.stages.comparison} />
          <StageBadge stage={experience.stages.affordability} />
        </div>
      </section>
    </div>
  );
}

function formatDateTime(value: string | undefined) {
  if (!value) {
    return 'No informado';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}
