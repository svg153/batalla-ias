import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { InMemoryAnalysisRepository } from '../../src/modules/analyses/analysis-repository.js';
import { createAnalysisService } from '../../src/modules/analyses/analysis-service.js';

const buildPayload = () => ({
  retentionPreference: 'session_only',
  horizonMonths: 120,
  currentMortgage: {
    pendingPrincipal: '185000.00',
    remainingMonths: 240,
    nominalAnnualRate: '2.35',
  },
  alternativeOffer: {
    withoutBonus: {
      pendingPrincipal: '185000.00',
      remainingMonths: 240,
      nominalAnnualRate: '2.10',
    },
    withBonus: {
      pendingPrincipal: '185000.00',
      remainingMonths: 240,
      nominalAnnualRate: '1.85',
      linkedProductsMonthlyCost: '35.00',
      bonificationRateDelta: '0.25',
    },
  },
  switchCosts: [
    {
      costType: 'notary',
      timing: 'one_off_switch',
      amount: '1250.00',
      sourceType: 'user_provided',
    },
  ],
});

const createClock = (timestamps: string[]) => {
  const queue = [...timestamps];
  const fallback = queue.at(-1) ?? '2026-04-23T21:00:00.000Z';

  return () => new Date(queue.shift() ?? fallback);
};

describe('analysis retention foundation', () => {
  it('creates a session-owned analysis, refreshes inactivity retention on access and hides it without the cookie', async () => {
    const app = createApp({
      analysisService: createAnalysisService({
        repository: new InMemoryAnalysisRepository(),
        now: createClock([
          '2026-04-23T21:00:00.000Z',
          '2026-04-23T22:15:00.000Z',
        ]),
      }),
    });
    const agent = request.agent(app);

    const created = await agent.post('/api/v1/analyses').send(buildPayload());

    expect(created.status).toBe(201);
    expect(created.body.analysis.dataQualityStatus).toBe('conditional_estimate');
    expect(created.body.analysis.accessMode).toBe('analysis_session_cookie');
    expect(created.body.analysis.lastAccessedAt).toBe('2026-04-23T21:00:00.000Z');
    expect(created.body.analysis.expiresAt).toBe('2026-04-24T01:00:00.000Z');
    expect(created.body.analysis.purgeAfter).toBe('2026-04-24T01:15:00.000Z');
    expect(created.body.analysis.retentionMetadata).toMatchObject({
      provider: 'memory',
      mode: 'session_ephemeral',
      durable: false,
      access: 'analysis_session_cookie',
    });
    expect(created.headers['x-analysis-access-model']).toBe('analysis_session_cookie');
    const sessionCookie = created.headers['set-cookie']?.[0];
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('analysis_session=');
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie).toContain('SameSite=Lax');

    const analysisId = created.body.analysis.id as string;
    const fetched = await agent.get(`/api/v1/analyses/${analysisId}`);

    expect(fetched.status).toBe(200);
    expect(fetched.body.analysis.id).toBe(analysisId);
    expect(fetched.body.analysis.lastAccessedAt).toBe('2026-04-23T22:15:00.000Z');
    expect(fetched.body.analysis.expiresAt).toBe('2026-04-24T02:15:00.000Z');
    expect(fetched.body.analysis.purgeAfter).toBe('2026-04-24T02:30:00.000Z');

    const missingCookie = await request(app).get(`/api/v1/analyses/${analysisId}`);
    expect(missingCookie.status).toBe(401);

    const wrongCookie = await request(app)
      .get(`/api/v1/analyses/${analysisId}`)
      .set('Cookie', 'analysis_session=wrong-owner');
    expect(wrongCookie.status).toBe(404);

    const deleted = await agent.delete(`/api/v1/analyses/${analysisId}`);
    expect(deleted.status).toBe(204);
  });

  it('surfaces memory fallback and explicit 30-day retention when save_analysis is requested without PostgreSQL', async () => {
    const app = createApp({
      analysisService: createAnalysisService({
        repository: new InMemoryAnalysisRepository(),
        now: createClock(['2026-04-23T21:00:00.000Z']),
      }),
    });

    const created = await request(app)
      .post('/api/v1/analyses')
      .send({
        ...buildPayload(),
        retentionPreference: 'save_analysis',
      });

    expect(created.status).toBe(201);
    expect(created.body.analysis.retentionMetadata).toMatchObject({
      provider: 'memory',
      mode: 'save_requested_fallback',
      durable: false,
      access: 'analysis_session_cookie',
    });
    expect(created.body.analysis.assumptions).toContain(
      'save_analysis was requested, but PostgreSQL persistence is not wired yet; this analysis currently survives only while the API process stays alive.',
    );
    expect(created.body.analysis.expiresAt).toBe('2026-05-23T21:00:00.000Z');
    expect(created.body.analysis.purgeAfter).toBe('2026-05-24T21:00:00.000Z');
    const sessionCookie = created.headers['set-cookie']?.[0];
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('Expires=');
  });
});
