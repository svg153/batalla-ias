import {
  calculateEstimatedInstallment,
  type CreateAnalysisInput,
} from '@batalla-ias/domain';
import type { Application } from 'express';
import request from 'supertest';
import type { Response } from 'supertest';

import { createApp } from '../../src/app.js';
import { InMemoryAnalysisRepository } from '../../src/modules/analyses/analysis-repository.js';
import { createAnalysisService } from '../../src/modules/analyses/analysis-service.js';

export const fixedNowIso = '2026-04-23T21:00:00.000Z';
export const expectedSessionExpiryIso = '2026-04-24T01:00:00.000Z';
const currentInstallment = calculateEstimatedInstallment({
  pendingPrincipal: '185000.00',
  remainingMonths: 240,
  nominalAnnualRate: '2.35',
}).monthlyInstallment;

export function createTestApp() {
  return createApp({
    analysisService: createAnalysisService({
      repository: new InMemoryAnalysisRepository(),
      now: () => new Date(fixedNowIso),
      sessionTtlMinutes: 240,
    }),
  });
}

export function buildCreateAnalysisPayload(): CreateAnalysisInput {
  return {
    retentionPreference: 'session_only',
    horizonMonths: 120,
    currentMortgage: {
      pendingPrincipal: '185000.00',
      remainingMonths: 240,
      nominalAnnualRate: '2.35',
      currentInstallment,
      recurringCosts: [
        {
          amount: '18.00',
          costType: 'insurance',
          description: 'Seguro actual',
          sourceType: 'user_provided',
          timing: 'monthly',
        },
      ],
    },
    alternativeOffer: {
      withoutBonus: {
        pendingPrincipal: '185000.00',
        remainingMonths: 240,
        nominalAnnualRate: '2.10',
        recurringCosts: [],
      },
      withBonus: {
        pendingPrincipal: '185000.00',
        remainingMonths: 240,
        nominalAnnualRate: '1.85',
        linkedProductsMonthlyCost: '42.00',
        bonificationRateDelta: '0.40',
        recurringCosts: [
          {
            amount: '12.00',
            costType: 'insurance',
            description: 'Seguro exigido por bonificación',
            sourceType: 'user_provided',
            timing: 'monthly',
          },
        ],
      },
    },
    switchCosts: [
      {
        amount: '350.00',
        costType: 'agency',
        description: 'Agencia',
        sourceType: 'user_provided',
        timing: 'one_off_switch',
      },
      {
        amount: '690.00',
        costType: 'notary',
        description: 'Notaría',
        sourceType: 'user_provided',
        timing: 'one_off_switch',
      },
      {
        amount: '1200.00',
        costType: 'cancellation_fee',
        description: 'Cancelación',
        sourceType: 'user_provided',
        timing: 'one_off_switch',
      },
    ],
    householdProfile: {
      netMonthlyIncome: '4150.00',
      monthlyObligations: '380.00',
      incomeStability: 'stable',
    },
  };
}

export function buildNoBonusAnalysisPayload(): CreateAnalysisInput {
  const payload = structuredClone(buildCreateAnalysisPayload());
  delete payload.alternativeOffer.withBonus;
  return payload;
}

export function buildConditionalEstimatePayload(): CreateAnalysisInput {
  const payload = structuredClone(buildCreateAnalysisPayload());
  delete payload.currentMortgage.currentInstallment;
  payload.householdProfile = {
    ...payload.householdProfile!,
    incomeStability: 'variable',
  };
  return payload;
}

export function buildSavedAnalysisPayload(): CreateAnalysisInput {
  const payload = structuredClone(buildCreateAnalysisPayload());
  payload.retentionPreference = 'save_analysis';
  return payload;
}

export function buildNoBreakEvenAnalysisPayload(): CreateAnalysisInput {
  const payload = structuredClone(buildCreateAnalysisPayload());
  payload.horizonMonths = 12;
  payload.switchCosts = [
    {
      amount: '8000.00',
      costType: 'notary',
      description: 'Notaría extraordinaria',
      sourceType: 'user_provided',
      timing: 'one_off_switch',
    },
  ];
  return payload;
}

export async function createAnalysis(
  app: Application,
  payload: CreateAnalysisInput = buildCreateAnalysisPayload(),
) {
  return request(app).post('/api/v1/analyses').send(payload);
}

export function getSessionCookie(response: Response) {
  const cookie = response.headers['set-cookie']?.[0];

  if (!cookie) {
    throw new Error('Expected analysis_session cookie to be set.');
  }

  return cookie;
}
