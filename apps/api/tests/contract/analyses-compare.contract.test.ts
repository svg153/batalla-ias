import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  buildConditionalEstimatePayload,
  buildCreateAnalysisPayload,
  buildNoBonusAnalysisPayload,
  createAnalysis,
  createTestApp,
  getSessionCookie,
} from '../helpers/analysis-fixtures.js';

describe('compare analysis contract', () => {
  it('requires the analysis_session cookie even when the caller knows the analysisId', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildCreateAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const unauthorized = await request(app).post(`/api/v1/analyses/${analysisId}/compare`);
    expect(unauthorized.status).toBe(401);

    const authorized = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);
    expect(authorized.status).toBe(200);
  });

  it('returns explainable comparison fields, trace references and recommendation payloads', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildCreateAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expectComparisonContract(compared.body.comparison as Record<string, unknown>);
    expect((compared.body.comparison as Record<string, unknown>).scenarioCount).toBe(3);
    expect((compared.body.comparison as Record<string, unknown>).ranking).toEqual(
      expect.arrayContaining([
        'current',
        'alternative_without_bonus',
        'alternative_with_bonus',
      ]),
    );
    expectTraceReferences((compared.body.comparison as Record<string, unknown>).traceReferences);
    expect(compared.body.recommendation).toMatchObject({
      recommendedAction: 'switch_without_bonus',
      targetScenarioType: 'alternative_without_bonus',
      qualityStatus: 'complete',
    });
  });

  it('returns exactly two scenarios for explicit no-bonus offers', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildNoBonusAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect((compared.body.comparison as Record<string, unknown>).scenarioCount).toBe(2);
    expect((compared.body.comparison as Record<string, unknown>).ranking).toEqual([
      'alternative_without_bonus',
      'current',
    ]);
    expect(compared.body.comparison.scenarios).toHaveLength(2);
  });

  it('propagates conditional_estimate when comparison depends on non-blocking missing data', async () => {
    const app = createTestApp();
    const created = await createAnalysis(app, buildConditionalEstimatePayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const compared = await request(app)
      .post(`/api/v1/analyses/${analysisId}/compare`)
      .set('Cookie', sessionCookie);

    expect(compared.status).toBe(200);
    expect(compared.body.comparison).toMatchObject({
      dataQualityStatus: 'conditional_estimate',
      scenarioCount: 3,
    });
    expect(compared.body.recommendation).toMatchObject({
      qualityStatus: 'conditional_estimate',
    });
  });
});

function expectComparisonContract(comparison: Record<string, unknown>) {
  expect(comparison).toMatchObject({
    policyVersion: expect.any(String),
    ranking: expect.any(Array),
    scenarioCount: expect.any(Number),
    dataQualityStatus: expect.stringMatching(/complete|conditional_estimate|blocked/),
    explanation: expect.any(String),
    triggeredRules: expect.any(Array),
    traceReferences: expect.any(Array),
    absoluteDifferenceVsCurrent: expect.any(Object),
    percentageDifferenceVsCurrent: expect.any(Object),
  });
}

function expectTraceReferences(traceReferences: unknown) {
  expect(traceReferences).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: expect.stringMatching(/formula|rule/),
        version: expect.any(String),
        sourceDocument: expect.any(String),
        sourceSection: expect.any(String),
        summary: expect.any(String),
      }),
    ]),
  );
}
