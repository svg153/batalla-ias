import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  buildConditionalEstimatePayload,
  buildCreateAnalysisPayload,
  buildNoBreakEvenAnalysisPayload,
  buildNoBonusAnalysisPayload,
  createAnalysis,
  createTestApp,
  getSessionCookie,
} from '../helpers/analysis-fixtures.js';

describe('compare analysis integration', () => {
  it('requires the analysis_session cookie for compare requests', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildCreateAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;

    const compared = await request(app).post(`/api/v1/analyses/${analysisId}/compare`);

    expect(compared.status).toBe(401);
    expect(compared.body.code).toBe('unauthorized');
  });

  it('compares the full bonus journey and ranks by total real cost instead of installment bait', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildCreateAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect(compared.body.comparison.scenarioCount).toBe(3);
    expect(compared.body.comparison.scenarios).toHaveLength(3);
    expect(compared.body.comparison.ranking[0]).toBe('alternative_without_bonus');
    expect(compared.body.comparison.ranking).toContain('alternative_with_bonus');
    expect(compared.body.recommendation.recommendedAction).toBe('switch_without_bonus');
    expect(compared.body.recommendation.targetScenarioType).toBe('alternative_without_bonus');
    expect(compared.body.recommendation.breakEvenReached).toBe(true);
    expect(compared.body.recommendation.traceReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rule.recommend-switch' }),
      ]),
    );
  });

  it('keeps comparison to two scenarios when the offer has no explicit bonus variant', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildNoBonusAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect(compared.body.comparison.scenarioCount).toBe(2);
    expect(compared.body.comparison.ranking).toEqual([
      'alternative_without_bonus',
      'current',
    ]);
    expect(compared.body.comparison.scenarios).toHaveLength(2);
  });

  it('marks comparison and recommendation as conditional_estimate when current installment is missing', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildConditionalEstimatePayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect(compared.body.comparison.dataQualityStatus).toBe('conditional_estimate');
    expect(compared.body.recommendation.qualityStatus).toBe('conditional_estimate');
    expect(compared.body.comparison.explanation).toContain('estimación condicionada');
  });

  it('keeps the current mortgage when switch costs prevent break-even inside the chosen horizon', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildNoBreakEvenAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect(compared.body.comparison.ranking[0]).toBe('current');
    expect(compared.body.recommendation).toMatchObject({
      recommendedAction: 'keep_current',
      targetScenarioType: 'current',
      isSwitchWorthIt: false,
      breakEvenReached: false,
    });
    expect(compared.body.recommendation.explanation).toContain('no mejora el resultado económico');
  });
});
