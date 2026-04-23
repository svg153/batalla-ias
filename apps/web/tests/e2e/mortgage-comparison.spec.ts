import { expect, test, type Page } from '@playwright/test';

import {
  affordabilityFixture,
  bonusTrapComparisonFixture,
  conditionalAnalysisFixture,
  createdAnalysisFixture,
  noBonusComparisonFixture,
} from './fixtures/mortgage-analysis-fixtures';

test.describe('mortgage comparison journey', () => {
  test(
    'ranks explicit bonus offers by total real cost instead of the lowest installment',
    async ({ page }) => {
      await installAnalysisMocks(page, {
        created: createdAnalysisFixture,
        comparison: bonusTrapComparisonFixture,
        affordability: affordabilityFixture,
      });

      await page.goto('/');
      await page.getByRole('button', { name: 'Ver coste real y recomendación' }).click();

      await expect(
        page.getByRole('heading', { name: 'Ranking por coste total real' }),
      ).toBeVisible();
      await expect(page.locator('tbody tr').first()).toContainText(
        'Oferta sin bonificaciones',
      );
      await expect(page.locator('tbody tr').nth(1)).toContainText(
        'Oferta con bonificaciones',
      );
      await expect(
        page.getByRole('table').getByText('Productos vinculados de la bonificación'),
      ).toBeVisible();
      await expect(page.getByText('Compensa cambiar', { exact: true })).toBeVisible();
    },
  );

  test('shows exactly two rows when the offer has no explicit bonus variant', async ({ page }) => {
    await installAnalysisMocks(page, {
      created: createdAnalysisFixture,
      comparison: noBonusComparisonFixture,
      affordability: affordabilityFixture,
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Ver coste real y recomendación' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tbody').getByText('Oferta con bonificaciones')).toHaveCount(0);
    await expect(
      page.getByText('No hay escenario con bonificaciones porque la oferta no lo definía.')
    ).toBeVisible();
  });

  test('surfaces conditional estimates and session retention semantics in the visible UX', async ({ page }) => {
    await installAnalysisMocks(page, {
      created: conditionalAnalysisFixture,
      comparison: bonusTrapComparisonFixture,
      affordability: affordabilityFixture,
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Ver coste real y recomendación' }).click();

    await expect(
      page.getByRole('heading', { level: 2, name: 'Estimación condicionada' }),
    ).toBeVisible();
    await expect(page.getByText('Cuota actual declarada')).toBeVisible();
    await expect(
      page.getByText(
        'La interfaz recuerda que, por defecto, los datos sensibles no deberían quedarse más allá de la sesión.',
      ),
    ).toBeVisible();
  });

  test('marks local preview stages and notices when comparison falls back', async ({ page }) => {
    await installAnalysisMocks(
      page,
      {
        created: createdAnalysisFixture,
        comparison: bonusTrapComparisonFixture,
        affordability: affordabilityFixture,
      },
      {
        comparisonStatus: 501,
        comparisonBody: {
          code: 'feature_not_implemented',
          message: 'Comparación no disponible en backend todavía.',
        },
      },
    );

    await page.goto('/');
    await page.getByRole('button', { name: 'Ver coste real y recomendación' }).click();

    const stageStrip = page.locator('.results-stack__header .stage-strip');
    await expect(stageStrip.locator('.stage-badge--api')).toHaveCount(1);
    await expect(stageStrip.locator('.stage-badge--local_preview')).toHaveCount(2);
    await expect(page.getByText('Comparación resuelta en local').first()).toBeVisible();
    await expect(page.getByText('Asequibilidad resuelta en local').first()).toBeVisible();
    await expect(
      page.getByText('Comparación aún no soportada por backend'),
    ).toBeVisible();
    const fallbackNotice = page.locator('.notice-card', {
      hasText: 'Comparación aún no soportada por backend',
    });
    await expect(fallbackNotice).toContainText(/vista previa local/i);
  });

  test('keeps accessible result headings and mobile comparison visible', async ({ page }) => {
    await installAnalysisMocks(page, {
      created: createdAnalysisFixture,
      comparison: bonusTrapComparisonFixture,
      affordability: affordabilityFixture,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Ver coste real y recomendación' }).click();

    await expect(
      page.getByRole('heading', { level: 2, name: 'Ranking por coste total real' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Cambia sin bonificaciones' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Asumible' })).toBeVisible();
    await expect(page.getByLabel('Comparación por escenario')).toBeVisible();
  });
});

async function installAnalysisMocks(
  page: Page,
  fixtures: {
    created: { analysis: { id: string } };
    comparison: Record<string, unknown>;
    affordability?: Record<string, unknown>;
  },
  overrides?: {
    comparisonStatus?: number;
    comparisonBody?: Record<string, unknown>;
    affordabilityStatus?: number;
    affordabilityBody?: Record<string, unknown>;
  },
) {
  await page.route('**/api/v1/analyses', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(fixtures.created),
    });
  });

  await page.route(`**/api/v1/analyses/${fixtures.created.analysis.id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtures.created),
      headers: {
        'X-Analysis-Access-Model': 'analysis_session_cookie',
        'X-Analysis-Retention-Mode': 'session_ephemeral',
      },
    });
  });

  const comparisonStatus = overrides?.comparisonStatus ?? 200;
  const comparisonBody = overrides?.comparisonBody ?? fixtures.comparison;

  await page.route(
    `**/api/v1/analyses/${fixtures.created.analysis.id}/compare`,
    async (route) => {
      await route.fulfill({
        status: comparisonStatus,
        contentType: 'application/json',
        body: JSON.stringify(comparisonBody ?? {}),
      });
    },
  );

  const affordabilityStatus = overrides?.affordabilityStatus ?? (fixtures.affordability ? 200 : 204);
  const affordabilityBody = overrides?.affordabilityBody ?? fixtures.affordability ?? {};

  await page.route(
    `**/api/v1/analyses/${fixtures.created.analysis.id}/affordability`,
    async (route) => {
      await route.fulfill({
        status: affordabilityStatus,
        contentType: 'application/json',
        body: JSON.stringify(affordabilityBody),
      });
    },
  );
}
