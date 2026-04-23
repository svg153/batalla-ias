import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { calculateEstimatedInstallment } from '@batalla-ias/domain';

import { createApp } from '../../src/app.js';
import { InMemoryAnalysisRepository } from '../../src/modules/analyses/analysis-repository.js';
import { createAnalysisService } from '../../src/modules/analyses/analysis-service.js';

const createClock = (timestamps: string[]) => {
  const queue = [...timestamps];
  const fallback = queue.at(-1) ?? '2026-04-23T21:00:00.000Z';

  return () => new Date(queue.shift() ?? fallback);
};

const currentInstallment = calculateEstimatedInstallment({
  pendingPrincipal: '185000.00',
  remainingMonths: 240,
  nominalAnnualRate: '2.35',
}).monthlyInstallment;

const buildPayload = () => ({
  retentionPreference: 'session_only',
  horizonMonths: 120,
  currentMortgage: {
    pendingPrincipal: '185000.00',
    remainingMonths: 240,
    nominalAnnualRate: '2.35',
    currentInstallment,
    recurringCosts: [
      {
        costType: 'insurance',
        timing: 'monthly',
        amount: '18.00',
        sourceType: 'user_provided',
      },
    ],
  },
  alternativeOffer: {
    withoutBonus: {
      pendingPrincipal: '185000.00',
      remainingMonths: 240,
      nominalAnnualRate: '1.75',
      recurringCosts: [
        {
          costType: 'insurance',
          timing: 'monthly',
          amount: '10.00',
          sourceType: 'user_provided',
        },
      ],
    },
    withBonus: {
      pendingPrincipal: '185000.00',
      remainingMonths: 240,
      nominalAnnualRate: '1.45',
      linkedProductsMonthlyCost: '65.00',
      bonificationRateDelta: '0.30',
      recurringCosts: [
        {
          costType: 'insurance',
          timing: 'monthly',
          amount: '10.00',
          sourceType: 'user_provided',
        },
      ],
    },
  },
  switchCosts: [
    {
      costType: 'notary',
      timing: 'one_off_switch',
      amount: '1250.00',
      sourceType: 'user_provided',
    },
    {
      costType: 'appraisal',
      timing: 'one_off_switch',
      amount: '450.00',
      sourceType: 'user_provided',
    },
    {
      costType: 'management',
      timing: 'one_off_switch',
      amount: '350.00',
      sourceType: 'user_provided',
    },
  ],
});

describe('analysis comparison and affordability flow', () => {
  it('computes the comparison, recommendation and canonical affordability over the recommended scenario', async () => {
    const app = createApp({
      analysisService: createAnalysisService({
        repository: new InMemoryAnalysisRepository(),
        now: createClock([
          '2026-04-23T21:00:00.000Z',
          '2026-04-23T21:05:00.000Z',
          '2026-04-23T21:05:00.000Z',
          '2026-04-23T21:10:00.000Z',
          '2026-04-23T21:10:00.000Z',
        ]),
      }),
    });
    const agent = request.agent(app);

    const created = await agent.post('/api/v1/analyses').send(buildPayload());
    expect(created.status).toBe(201);

    const analysisId = created.body.analysis.id as string;
    const comparison = await agent.post(`/api/v1/analyses/${analysisId}/compare`);

    expect(comparison.status).toBe(200);
    expect(comparison.body.comparison.policyVersion).toBe(
      'mortgage-mvp/es-ES@2026.04.23-v1',
    );
    expect(comparison.body.comparison.scenarioCount).toBe(3);
    expect(comparison.body.comparison.ranking[0]).toBe('alternative_without_bonus');
    expect(comparison.body.comparison.ranking).toContain('alternative_with_bonus');
    expect(comparison.body.comparison.triggeredRules).toEqual(
      expect.arrayContaining([
        'rule.compare-scenario-set',
        'rule.rank-scenarios-by-total-cost',
      ]),
    );
    expect(comparison.body.comparison.traceReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rule.compare-scenario-set', kind: 'rule' }),
        expect.objectContaining({
          code: 'formula.total-real-cost.mvp-foundation',
          kind: 'formula',
        }),
      ]),
    );
    expect(comparison.body.recommendation.recommendedAction).toBe(
      'switch_without_bonus',
    );
    expect(comparison.body.recommendation.targetScenarioType).toBe(
      'alternative_without_bonus',
    );
    expect(comparison.body.recommendation.isSwitchWorthIt).toBe(true);
    expect(comparison.body.recommendation.breakEvenReached).toBe(true);
    expect(comparison.body.recommendation.breakEvenMonth).toBeGreaterThan(0);
    expect(comparison.body.recommendation.netSavingsAtHorizon).not.toBe('0.00');
    expect(comparison.body.recommendation.traceReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rule.recommend-switch' }),
        expect.objectContaining({ code: 'formula.break-even.switch-cost-recovery' }),
      ]),
    );

    const affordability = await agent
      .post(`/api/v1/analyses/${analysisId}/affordability`)
      .send({
        householdProfile: {
          netMonthlyIncome: '4200.00',
          monthlyObligations: '250.00',
          incomeStability: 'stable',
          notes: 'Ingreso principal fijo más un variable pequeño.',
        },
        scenarioType: 'current',
      });

    expect(affordability.status).toBe(200);
    expect(affordability.body.affordability.policyVersion).toBe(
      'mortgage-mvp/es-ES@2026.04.23-v1',
    );
    expect(affordability.body.affordability.evaluatedScenarioType).toBe(
      'alternative_without_bonus',
    );
    expect(affordability.body.affordability.classification).toBe('asumible');
    expect(affordability.body.affordability.dataQualityStatus).toBe('complete');
    expect(affordability.body.affordability.debtRatio).toMatch(/^\d+\.\d{4}$/);
    expect(affordability.body.affordability.triggeredRules).toEqual([
      'rule.affordability-target-scenario',
      'rule.affordability-thresholds',
    ]);
    expect(affordability.body.affordability.traceReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'rule.affordability-target-scenario' }),
        expect.objectContaining({ code: 'rule.affordability-thresholds' }),
      ]),
    );
  });

  it('rejects compare without the analysis_session cookie and hides affordability behind ownership checks', async () => {
    const app = createApp({
      analysisService: createAnalysisService({
        repository: new InMemoryAnalysisRepository(),
        now: createClock(['2026-04-23T21:00:00.000Z']),
      }),
    });
    const agent = request.agent(app);
    const created = await agent.post('/api/v1/analyses').send(buildPayload());
    const analysisId = created.body.analysis.id as string;

    const missingCookie = await request(app).post(
      `/api/v1/analyses/${analysisId}/compare`,
    );
    expect(missingCookie.status).toBe(401);

    const wrongCookie = await request(app)
      .post(`/api/v1/analyses/${analysisId}/affordability`)
      .set('Cookie', 'analysis_session=wrong-owner')
      .send({
        householdProfile: {
          netMonthlyIncome: '4200.00',
          monthlyObligations: '250.00',
        },
      });
    expect(wrongCookie.status).toBe(404);
  });
});
