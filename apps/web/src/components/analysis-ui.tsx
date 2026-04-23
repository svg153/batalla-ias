import type { StageStatus, TraceReference } from '../features/mortgage-analysis/types';

export function MetricCard({
  label,
  value,
  emphasis = 'standard'
}: {
  label: string;
  value: string;
  emphasis?: 'standard' | 'primary';
}) {
  const emphasisClass = emphasis === 'primary' ? 'metric-card--primary' : '';

  return (
    <div className={`metric-card ${emphasisClass}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function StageBadge({ stage }: { stage: StageStatus }) {
  return (
    <div className={`stage-badge stage-badge--${stage.source}`}>
      <strong>{stage.label}</strong>
      <span>{stage.detail}</span>
    </div>
  );
}

export function TraceReferenceList({
  references,
  compact = false
}: {
  references: TraceReference[];
  compact?: boolean;
}) {
  if (references.length === 0) {
    return null;
  }

  return (
    <div className={`trace-list ${compact ? 'trace-list--compact' : ''}`.trim()}>
      {references.map((reference) => (
        <article key={`${reference.code}-${reference.version}`} className="trace-card">
          <strong>{reference.code}</strong>
          <span>
            v{reference.version} · {reference.kind}
          </span>
          <p>{reference.summary}</p>
        </article>
      ))}
    </div>
  );
}

export function UnavailablePanel({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="panel-card">
      <p className="eyebrow">Estado honesto</p>
      <h3>{title}</h3>
      <div className="empty-panel">
        <p>{description}</p>
      </div>
    </article>
  );
}
