import { describe, expect, it } from 'vitest';

import { validateAnalysisInput } from '../../src';

describe('analysis input validation', () => {
  it('flags current installment contradictions as conditional estimates', () => {
    const result = validateAnalysisInput({
      retentionPreference: 'session_only',
      horizonMonths: 120,
      currentMortgage: {
        pendingPrincipal: '100000',
        remainingMonths: 240,
        nominalAnnualRate: '2.5',
        currentInstallment: '620.00',
      },
      alternativeOffer: {
        withoutBonus: {
          pendingPrincipal: '100000',
          remainingMonths: 240,
          nominalAnnualRate: '2.1',
        },
      },
    });

    expect(result.success).toBe(true);
    expect(result.dataQualityStatus).toBe('conditional_estimate');
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'currentMortgage.currentInstallment',
          severity: 'warning',
        }),
      ]),
    );
  });

  it('blocks indistinguishable with-bonus variants', () => {
    const result = validateAnalysisInput({
      retentionPreference: 'session_only',
      horizonMonths: 120,
      currentMortgage: {
        pendingPrincipal: '100000',
        remainingMonths: 240,
        nominalAnnualRate: '2.5',
      },
      alternativeOffer: {
        withoutBonus: {
          pendingPrincipal: '100000',
          remainingMonths: 240,
          nominalAnnualRate: '2.1',
        },
        withBonus: {
          pendingPrincipal: '100000',
          remainingMonths: 240,
          nominalAnnualRate: '2.1',
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.dataQualityStatus).toBe('blocked');
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'alternativeOffer.withBonus',
          severity: 'blocking',
        }),
      ]),
    );
  });
});
