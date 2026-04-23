import type { DataQualityStatus } from '../features/mortgage-analysis/types';

interface DataQualityBannerProps {
  status: DataQualityStatus;
  missingData?: string[];
  assumptions?: string[];
}

const toneLabels: Record<DataQualityStatus, { title: string; description: string }> = {
  complete: {
    title: 'Lectura consistente',
    description:
      'No vemos huecos relevantes en esta salida. Aun así, la recomendación sigue explicando qué costes entran.'
  },
  conditional_estimate: {
    title: 'Estimación condicionada',
    description:
      'Hay supuestos o datos aún blandos. Se muestran de cara porque una buena UI financiera no se hace la distraída.'
  },
  blocked: {
    title: 'Análisis bloqueado',
    description:
      'Falta una pieza crítica o hay una contradicción material. La interfaz debe pedir corrección antes de recomendar.'
  }
};

export function DataQualityBanner({
  status,
  missingData = [],
  assumptions = []
}: DataQualityBannerProps) {
  const copy = toneLabels[status];
  const hasWarnings = status !== 'complete';

  return (
    <section className={`quality-banner quality-banner--${status}`} aria-live="polite">
      <div className="quality-banner__header">
        <p className="eyebrow">Calidad del dato</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        {hasWarnings ? (
          <div className="quality-banner__callout">
            <strong>Esta calidad condiciona la recomendación y la asequibilidad.</strong>
            <p>Si corriges los datos faltantes, el ranking podría recalcularse.</p>
          </div>
        ) : null}
      </div>

      <div className="quality-banner__content">
        <div>
          <h3>Datos que faltan o necesitan confirmación</h3>
          {missingData.length > 0 ? (
            <ul>
              {missingData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Ninguno detectado en esta capa del frontend.</p>
          )}
        </div>

        <div>
          <h3>Hipótesis visibles</h3>
          {assumptions.length > 0 ? (
            <ul>
              {assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No hay hipótesis añadidas en este estado.</p>
          )}
        </div>
      </div>
    </section>
  );
}
