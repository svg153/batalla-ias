import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RecommendationBlock } from './recommendation-block';
import { bonusTrapComparisonFixture } from '../../../tests/e2e/fixtures/mortgage-analysis-fixtures';

describe('RecommendationBlock', () => {
  it('renders recommendation evidence and the target scenario', () => {
    const html = renderToStaticMarkup(
      <RecommendationBlock
        comparison={bonusTrapComparisonFixture.comparison}
        recommendation={bonusTrapComparisonFixture.recommendation}
        stage={{ source: 'api', label: 'Comparación', detail: 'Completada' }}
      />
    );

    expect(html).toContain('Compensa cambiar');
    expect(html).toContain('Escenario objetivo');
    expect(html).toContain('Oferta sin bonificaciones');
    expect(html).toContain('Coste total real');
    expect(html).toContain('Ahorro neto al horizonte');
  });
});
