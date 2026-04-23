import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeMortgage } from './analysis-api';
import type { CreateAnalysisRequest } from '../features/mortgage-analysis/types';

const baseRequest: CreateAnalysisRequest = {
  retentionPreference: 'session_only',
  horizonMonths: 120,
  currentMortgage: {
    pendingPrincipal: '186000.00',
    remainingMonths: 276,
    nominalAnnualRate: '3.65',
    currentInstallment: '948.00',
    recurringCosts: []
  },
  alternativeOffer: {
    withoutBonus: {
      pendingPrincipal: '186000.00',
      remainingMonths: 276,
      nominalAnnualRate: '2.85',
      recurringCosts: []
    },
    withBonus: {
      pendingPrincipal: '186000.00',
      remainingMonths: 276,
      nominalAnnualRate: '2.45',
      linkedProductsMonthlyCost: '42.00',
      bonificationRateDelta: '0.40',
      recurringCosts: []
    }
  },
  switchCosts: [
    {
      costType: 'notary',
      timing: 'one_off_switch',
      amount: '690.00',
      description: 'Notaría',
      sourceType: 'user_provided'
    }
  ],
  householdProfile: {
    netMonthlyIncome: '4150.00',
    monthlyObligations: '380.00',
    incomeStability: 'stable'
  }
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('analyzeMortgage', () => {
  it('keeps live analysis metadata and falls back locally only for compare and affordability when backend lacks the path', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            analysis: {
              id: '11111111-1111-1111-1111-111111111111',
              status: 'validated',
              retentionPreference: 'session_only',
              horizonMonths: 120,
              dataQualityStatus: 'complete',
              missingData: [],
              assumptions: [],
              createdAt: '2026-04-23T20:10:00.000Z',
              retentionMetadata: {
                provider: 'memory',
                mode: 'session_ephemeral',
                durable: false,
                access: 'analysis_session_cookie',
                message: 'Session analyses stay in process memory.'
              }
            }
          },
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
              'X-Analysis-Access-Model': 'analysis_session_cookie',
              'X-Analysis-Retention-Mode': 'session_ephemeral'
            }
          }
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            analysis: {
              id: '11111111-1111-1111-1111-111111111111',
              status: 'validated',
              retentionPreference: 'session_only',
              horizonMonths: 120,
              dataQualityStatus: 'complete',
              missingData: [],
              assumptions: [],
              createdAt: '2026-04-23T20:10:00.000Z',
                lastAccessedAt: '2026-04-23T20:10:01.000Z',
                retentionMetadata: {
                  provider: 'memory',
                  mode: 'session_ephemeral',
                  durable: false,
                  access: 'analysis_session_cookie',
                  message: 'Session analyses stay in process memory.'
                }
              }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Analysis-Access-Model': 'analysis_session_cookie',
              'X-Analysis-Retention-Mode': 'session_ephemeral'
            }
          }
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: 'feature_not_implemented',
            message: 'Feature is not implemented yet.',
            details: [
              {
                field: 'comparison',
                reason: 'Comparison orchestration lands after the backend foundation.',
                severity: 'blocking'
              }
            ]
          },
          { status: 501, headers: { 'Content-Type': 'application/json' } }
        )
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeMortgage(baseRequest);

    expect(result.analysis.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(result.analysis.accessMode).toBe('analysis_session_cookie');
    expect(result.stages.analysis.source).toBe('api');
    expect(result.stages.comparison.source).toBe('local_preview');
    expect(result.stages.affordability.source).toBe('local_preview');
    expect(result.comparison?.scenarioCount).toBe(3);
    expect(result.recommendation?.targetScenarioType).toBeDefined();
    expect(result.notices.some((notice) => notice.title.includes('Comparación aún no soportada'))).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('uses exactly two scenarios when the user does not declare a bonus variant', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const requestWithoutBonus: CreateAnalysisRequest = {
      ...baseRequest,
      alternativeOffer: {
        withoutBonus: baseRequest.alternativeOffer.withoutBonus
      }
    };

    const result = await analyzeMortgage(requestWithoutBonus);

    expect(result.stages.analysis.source).toBe('local_preview');
    expect(result.comparison?.scenarioCount).toBe(2);
    expect(result.comparison?.ranking).not.toContain('alternative_with_bonus');
    expect(result.notices.some((notice) => notice.detail.includes('dos escenarios'))).toBe(true);
  });

  it('falls back to a visible local preview when same-origin /api/v1 is missing on the deployment', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<html><body>Not Found</body></html>', {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeMortgage(baseRequest);

    expect(result.analysis.id).toBe('local-preview');
    expect(result.stages.analysis.source).toBe('local_preview');
    expect(result.notices.some((notice) => notice.title === 'API no disponible')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not fake a comparison when the backend returns an unexpected compare failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            analysis: {
              id: '22222222-2222-2222-2222-222222222222',
              status: 'validated',
              retentionPreference: 'session_only',
              horizonMonths: 120,
              dataQualityStatus: 'complete',
              missingData: [],
              assumptions: [],
              createdAt: '2026-04-23T20:10:00.000Z'
            }
          },
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            analysis: {
              id: '22222222-2222-2222-2222-222222222222',
              status: 'validated',
              retentionPreference: 'session_only',
              horizonMonths: 120,
              dataQualityStatus: 'complete',
              missingData: [],
              assumptions: [],
              createdAt: '2026-04-23T20:10:00.000Z'
            }
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: 'internal_error',
            message: 'Unexpected failure',
            details: [
              {
                field: 'comparison',
                reason: 'A runtime error interrupted the calculation.',
                severity: 'blocking'
              }
            ]
          },
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeMortgage(baseRequest);

    expect(result.comparison).toBeUndefined();
    expect(result.recommendation).toBeUndefined();
    expect(result.stages.comparison.source).toBe('unavailable');
    expect(result.notices.some((notice) => notice.tone === 'error')).toBe(true);
  });
});

function jsonResponse(
  body: unknown,
  init?: { status?: number; headers?: HeadersInit }
) {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });
}
