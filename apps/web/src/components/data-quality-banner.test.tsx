import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DataQualityBanner } from './data-quality-banner';

describe('DataQualityBanner', () => {
  it('surfaces conditional estimate evidence in the markup', () => {
    const html = renderToStaticMarkup(
      <DataQualityBanner
        status="conditional_estimate"
        missingData={['Cuota actual declarada']}
        assumptions={['Cuota estimada por diferencia']}
      />
    );

    expect(html).toContain('Estimación condicionada');
    expect(html).toContain('Cuota actual declarada');
    expect(html).toContain('Cuota estimada por diferencia');
    expect(html).toContain('Esta calidad condiciona la recomendación');
  });

  it('does not show the warning callout when data is complete', () => {
    const html = renderToStaticMarkup(
      <DataQualityBanner status="complete" missingData={[]} assumptions={[]} />
    );

    expect(html).toContain('Lectura consistente');
    expect(html).not.toContain('Esta calidad condiciona la recomendación');
  });
});
