import { describe, expect, it } from 'vitest';

import {
  calculateEstimatedInstallment,
  calculateTotalRealCost,
  formatMoney,
  roundInternal,
} from '../../src';

describe('mortgage formulas', () => {
  it('calculates french-amortization installments with deterministic rounding', () => {
    const result = calculateEstimatedInstallment({
      pendingPrincipal: '100000',
      remainingMonths: 240,
      nominalAnnualRate: '2.5',
    });

    expect(result.formulaId).toBe('formula.estimated-installment.french-amortization');
    expect(result.formulaVersion).toBe('1.0.0');
    expect(result.rawMonthlyInstallment).toBe('529.9029');
    expect(result.monthlyInstallment).toBe('529.90');
  });

  it('returns a straight-line installment when rate is zero', () => {
    const result = calculateEstimatedInstallment({
      pendingPrincipal: '1200',
      remainingMonths: 12,
      nominalAnnualRate: '0',
    });

    expect(result.rawMonthlyInstallment).toBe('100.0000');
    expect(result.monthlyInstallment).toBe('100.00');
  });

  it('calculates total real cost over the selected horizon', () => {
    const result = calculateTotalRealCost({
      pendingPrincipal: '120000',
      remainingMonths: 240,
      nominalAnnualRate: '2.2',
      horizonMonths: 60,
      recurringCosts: [
        {
          amount: '15',
          costType: 'insurance',
          timing: 'monthly',
        },
        {
          amount: '120',
          costType: 'management',
          timing: 'annual',
        },
        {
          amount: '500',
          costType: 'opening_fee',
          timing: 'upfront',
        },
      ],
      switchCosts: [
        {
          amount: '1000',
          costType: 'notary',
          timing: 'one_off_switch',
        },
      ],
    });

    expect(result.monthlyInstallment).toBe('618.49');
    expect(result.rawMonthlyInstallment).toBe('618.4916');
    expect(result.principalRepaid).toBe('25249.6594');
    expect(result.interestPaid).toBe('11859.8388');
    expect(result.recurringCostsTotal).toBe('1500.0000');
    expect(result.upfrontCostsTotal).toBe('500.0000');
    expect(result.switchCostsTotal).toBe('1000.0000');
    expect(result.totalRealCost).toBe('14859.8388');
    expect(result.finalAmountPaid).toBe('40109.4982');
    expect(result.costBreakdown).toHaveLength(4);
  });

  it('charges linked products into total real cost even when the bonus lowers the rate', () => {
    const withoutLinkedProducts = calculateTotalRealCost({
      pendingPrincipal: '185000',
      remainingMonths: 240,
      nominalAnnualRate: '2.10',
      horizonMonths: 60,
      switchCosts: [
        {
          amount: '1250',
          costType: 'notary',
          timing: 'one_off_switch',
        },
      ],
    });
    const withLinkedProducts = calculateTotalRealCost({
      pendingPrincipal: '185000',
      remainingMonths: 240,
      nominalAnnualRate: '1.85',
      horizonMonths: 60,
      linkedProductsMonthlyCost: '45',
      switchCosts: [
        {
          amount: '1250',
          costType: 'notary',
          timing: 'one_off_switch',
        },
      ],
    });

    expect(Number.parseFloat(withLinkedProducts.monthlyInstallment)).toBeLessThan(
      Number.parseFloat(withoutLinkedProducts.monthlyInstallment),
    );
    expect(withLinkedProducts.recurringCostsTotal).toBe('2700.0000');
    expect(Number.parseFloat(withLinkedProducts.interestPaid)).toBeLessThan(
      Number.parseFloat(withoutLinkedProducts.interestPaid),
    );
    expect(Number.parseFloat(withLinkedProducts.totalRealCost)).toBeGreaterThan(
      Number.parseFloat(withoutLinkedProducts.totalRealCost),
    );
  });

  it('keeps excluded cost lines visible without counting them into total real cost', () => {
    const result = calculateTotalRealCost({
      pendingPrincipal: '50000',
      remainingMonths: 120,
      nominalAnnualRate: '1.8',
      horizonMonths: 12,
      recurringCosts: [
        {
          amount: '20',
          costType: 'insurance',
          timing: 'monthly',
          includedInTotalCost: false,
          description: 'Seguro opcional visible',
        },
        {
          amount: '10',
          costType: 'management',
          timing: 'monthly',
          description: 'Gestión incluida',
        },
      ],
    });

    expect(result.recurringCostsTotal).toBe('120.0000');
    expect(result.costBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          costType: 'insurance',
          includedInTotalCost: false,
          totalAmount: '0.0000',
        }),
        expect.objectContaining({
          costType: 'management',
          includedInTotalCost: true,
          totalAmount: '120.0000',
        }),
      ]),
    );
  });

  it('keeps HALF_UP rounding helpers deterministic for money outputs', () => {
    expect(roundInternal('1.00555').toFixed(4)).toBe('1.0056');
    expect(formatMoney('1.005')).toBe('1.01');
  });
});
