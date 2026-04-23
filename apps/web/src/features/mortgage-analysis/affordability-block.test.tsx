import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AffordabilityBlock } from './affordability-block';
import { affordabilityFixture } from '../../../tests/e2e/fixtures/mortgage-analysis-fixtures';

describe('AffordabilityBlock', () => {
  it('renders affordability thresholds and evaluated scenario', () => {
    const html = renderToStaticMarkup(
      <AffordabilityBlock
        affordability={affordabilityFixture.affordability}
        stage={{ source: 'api', label: 'Asequibilidad', detail: 'Completada' }}
      />
    );

    expect(html).toContain('Umbrales del MVP');
    expect(html).toContain('Escenario evaluado');
    expect(html).toContain('Oferta sin bonificaciones');
    expect(html).toContain('Ratio de endeudamiento');
  });
});
