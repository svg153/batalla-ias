import request from 'supertest';
import { describe, expect, it } from 'vitest';

import {
  buildCreateAnalysisPayload,
  buildSavedAnalysisPayload,
  createAnalysis,
  createTestApp,
  expectedSessionExpiryIso,
  getSessionCookie,
} from '../helpers/analysis-fixtures.js';

describe('analyses lifecycle contract', () => {
  it('keeps POST and GET reachable with cookie-bound ownership enforced', async () => {
    const app = createTestApp();

    const created = await createAnalysis(app, buildCreateAnalysisPayload());

    expect(created.status).toBe(201);
    expect(created.headers.location).toMatch(/^\/api\/v1\/analyses\/[0-9a-f-]+$/);
    expect(created.body.analysis).toMatchObject({
      retentionPreference: 'session_only',
      dataQualityStatus: 'complete',
      expiresAt: expectedSessionExpiryIso,
      accessMode: 'analysis_session_cookie',
    });

    const analysisId = (created.body.analysis as { id: string }).id;
    const fetched = await request(app)
      .get(`/api/v1/analyses/${analysisId}`)
      .set('Cookie', getSessionCookie(created));

    expect(fetched.status).toBe(200);
    expect(fetched.body.analysis.id).toBe(analysisId);
  });

  it('issues an analysis_session cookie and the retention fields mandated by the public contract', async () => {
    const app = createTestApp();

    const created = await createAnalysis(app, buildCreateAnalysisPayload());

    expect(created.status).toBe(201);
    expect(created.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('analysis_session=')]),
    );
    expectLifecycleContract(created.body.analysis as Record<string, unknown>);
    expect((created.body.analysis as Record<string, unknown>).accessMode).toBe(
      'analysis_session_cookie',
    );
    expect((created.body.analysis as Record<string, unknown>).expiresAt).toBe(
      '2026-04-24T01:00:00.000Z',
    );
    expect((created.body.analysis as Record<string, unknown>).purgeAfter).toBe(
      '2026-04-24T01:15:00.000Z',
    );
  });

  it('rejects naked analysisId access without the opaque session cookie', async () => {
    const app = createTestApp();

    const created = await createAnalysis(app, buildCreateAnalysisPayload());
    const analysisId = (created.body.analysis as { id: string }).id;
    const sessionCookie = getSessionCookie(created);

    const unauthorized = await request(app).get(`/api/v1/analyses/${analysisId}`);
    expect(unauthorized.status).toBe(401);

    const authorized = await request(app)
      .get(`/api/v1/analyses/${analysisId}`)
      .set('Cookie', sessionCookie);
    expect(authorized.status).toBe(200);
  });

  it('caps save_analysis at 30 days and session_only at four hours of inactivity', async () => {
    const app = createTestApp();

    const saved = await createAnalysis(app, buildSavedAnalysisPayload());

    expect(saved.status).toBe(201);
    expect((saved.body.analysis as Record<string, unknown>).retentionPreference).toBe(
      'save_analysis',
    );
    expect((saved.body.analysis as Record<string, unknown>).expiresAt).toBe(
      '2026-05-23T21:00:00.000Z',
    );
    expect((saved.body.analysis as Record<string, unknown>).purgeAfter).toBe(
      '2026-05-24T21:00:00.000Z',
    );
  });
});

function expectLifecycleContract(analysis: Record<string, unknown>) {
  expect(analysis).toMatchObject({
    id: expect.any(String),
    status: expect.stringMatching(/draft|validated|compared|saved|expired|deleted/),
    retentionPreference: expect.stringMatching(/session_only|save_analysis/),
    accessMode: 'analysis_session_cookie',
    policyVersion: expect.any(String),
    horizonMonths: expect.any(Number),
    dataQualityStatus: expect.stringMatching(/complete|conditional_estimate|blocked/),
    createdAt: expect.any(String),
    lastAccessedAt: expect.any(String),
    expiresAt: expect.any(String),
    purgeAfter: expect.any(String),
  });
}
