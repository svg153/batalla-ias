import { getRuleSource } from '../rules/rule-sources';
import type { MoneyString } from '../types/common';
import {
  Decimal,
  type DecimalInput,
  formatMoney,
  formatPercentage,
  one,
  roundInternal,
  toDecimal,
} from './decimal';

export interface CalculateEstimatedInstallmentInput {
  pendingPrincipal: DecimalInput;
  remainingMonths: number;
  nominalAnnualRate: DecimalInput;
}

export interface CalculateEstimatedInstallmentResult {
  formulaId: string;
  formulaVersion: string;
  monthlyRate: string;
  rawMonthlyInstallment: MoneyString;
  monthlyInstallment: MoneyString;
}

export function calculateEstimatedInstallment(
  input: CalculateEstimatedInstallmentInput,
): CalculateEstimatedInstallmentResult {
  const monthlyRate = calculateMonthlyRate(input.nominalAnnualRate);
  const preciseInstallment = calculatePreciseInstallmentValue(input);

  const formula = getRuleSource('ESTIMATED_INSTALLMENT');

  return {
    formulaId: formula.id,
    formulaVersion: formula.version,
    monthlyRate: formatPercentage(monthlyRate, 8),
    rawMonthlyInstallment: roundInternal(preciseInstallment).toFixed(4),
    monthlyInstallment: formatMoney(preciseInstallment),
  };
}

export function calculatePreciseInstallmentValue(
  input: CalculateEstimatedInstallmentInput,
): Decimal {
  if (!Number.isInteger(input.remainingMonths) || input.remainingMonths <= 0) {
    throw new Error('remainingMonths must be a positive integer');
  }

  const principal = toDecimal(input.pendingPrincipal);
  const monthlyRate = calculateMonthlyRate(input.nominalAnnualRate);
  const payments = toDecimal(input.remainingMonths);

  if (principal.lte(0)) {
    throw new Error('pendingPrincipal must be greater than zero');
  }

  if (monthlyRate.eq(0)) {
    return principal.div(payments);
  }

  return principal
    .mul(monthlyRate)
    .div(one().minus(one().plus(monthlyRate).pow(payments.negated())));
}

export function calculateMonthlyRate(nominalAnnualRate: DecimalInput): Decimal {
  const annualRate = toDecimal(nominalAnnualRate);

  if (annualRate.lt(0)) {
    throw new Error('nominalAnnualRate cannot be negative');
  }

  return annualRate.div(12).div(100);
}

export function calculateRemainingBalanceAfterPayments(
  principalInput: DecimalInput,
  monthlyRateInput: DecimalInput,
  totalPayments: number,
  paymentsMade: number,
  monthlyInstallmentInput: DecimalInput,
): Decimal {
  if (paymentsMade <= 0) {
    return roundInternal(principalInput);
  }

  if (paymentsMade >= totalPayments) {
    return new Decimal(0);
  }

  const principal = toDecimal(principalInput);
  const monthlyRate = toDecimal(monthlyRateInput);
  const monthlyInstallment = toDecimal(monthlyInstallmentInput);
  const periods = toDecimal(paymentsMade);

  if (monthlyRate.eq(0)) {
    return roundInternal(Decimal.max(new Decimal(0), principal.minus(monthlyInstallment.mul(periods))));
  }

  const growthFactor = one().plus(monthlyRate).pow(periods);
  const balance = principal
    .mul(growthFactor)
    .minus(monthlyInstallment.mul(growthFactor.minus(one())).div(monthlyRate));

  return roundInternal(Decimal.max(new Decimal(0), balance));
}
