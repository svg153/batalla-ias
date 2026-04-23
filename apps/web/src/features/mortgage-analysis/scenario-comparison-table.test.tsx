import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ScenarioComparisonTable } from './scenario-comparison-table';
import {
  bonusTrapComparisonFixture,
  noBonusComparisonFixture
} from '../../../tests/e2e/fixtures/mortgage-analysis-fixtures';

describe('ScenarioComparisonTable', () => {
  it('renders two scenarios when no bonus variant exists', () => {
    const html = renderToStaticMarkup(
      <ScenarioComparisonTable comparison={noBonusComparisonFixture.comparison} />
    );

    expect(html).toContain('No hay escenario con bonificaciones porque la oferta no lo definía.');
    expect(html).not.toContain('Oferta con bonificaciones');
  });

  it('keeps total real cost ahead of installment in the table header', () => {
    const html = renderToStaticMarkup(
      <ScenarioComparisonTable comparison={bonusTrapComparisonFixture.comparison} />
    );

    expect(html.indexOf('Coste total real')).toBeLessThan(html.indexOf('Cuota estimada'));
  });
});
