import { getRuleSource } from '../rules/rule-sources';
import type { ScenarioCostBreakdownLine } from '../types/scenario';
import type { AssociatedCostInput } from '../types/scenario';
import type { MoneyString } from '../types/common';
import {
  type DecimalInput,
  formatMoney,
  roundInternal,
  sumDecimal,
  toDecimal,
  zero,
} from './decimal';
import {
  calculateEstimatedInstallment,
  calculateMonthlyRate,
  calculatePreciseInstallmentValue,
  calculateRemainingBalanceAfterPayments,
} from './calculate-estimated-installment';

type CostBucket = 'recurring' | 'upfront' | 'switch';

export interface CalculateTotalRealCostInput {
  pendingPrincipal: DecimalInput;
  remainingMonths: number;
  nominalAnnualRate: DecimalInput;
  horizonMonths: number;
  monthlyInstallment?: DecimalInput;
  recurringCosts?: ReadonlyArray<AssociatedCostInput>;
  linkedProductsMonthlyCost?: DecimalInput;
  switchCosts?: ReadonlyArray<AssociatedCostInput>;
}

export interface CalculateTotalRealCostResult {
  formulaId: string;
  formulaVersion: string;
  horizonMonths: number;
  paymentsConsidered: number;
  monthlyInstallment: MoneyString;
  rawMonthlyInstallment: MoneyString;
  principalRepaid: MoneyString;
  interestPaid: MoneyString;
  recurringCostsTotal: MoneyString;
  upfrontCostsTotal: MoneyString;
  switchCostsTotal: MoneyString;
  totalRealCost: MoneyString;
  finalAmountPaid: MoneyString;
  remainingBalanceAfterHorizon: MoneyString;
  costBreakdown: ReadonlyArray<ScenarioCostBreakdownLine>;
}

interface CostContribution {
  bucket: CostBucket;
  line: ScenarioCostBreakdownLine;
  totalAmountValue: ReturnType<typeof toDecimal>;
}

export function calculateTotalRealCost(
  input: CalculateTotalRealCostInput,
): CalculateTotalRealCostResult {
  if (!Number.isInteger(input.remainingMonths) || input.remainingMonths <= 0) {
    throw new Error('remainingMonths must be a positive integer');
  }

  if (!Number.isInteger(input.horizonMonths) || input.horizonMonths <= 0) {
    throw new Error('horizonMonths must be a positive integer');
  }

  const paymentsConsidered = Math.min(input.remainingMonths, input.horizonMonths);
  const monthlyRate = calculateMonthlyRate(input.nominalAnnualRate);
  const installment = input.monthlyInstallment
    ? toDecimal(input.monthlyInstallment)
    : calculatePreciseInstallmentValue({
        pendingPrincipal: input.pendingPrincipal,
        remainingMonths: input.remainingMonths,
        nominalAnnualRate: input.nominalAnnualRate,
      });

  const remainingBalance = calculateRemainingBalanceAfterPayments(
    input.pendingPrincipal,
    monthlyRate,
    input.remainingMonths,
    paymentsConsidered,
    installment,
  );

  const principal = toDecimal(input.pendingPrincipal);
  const totalInstallmentFlow = installment.mul(paymentsConsidered);
  const principalRepaid = roundInternal(principal.minus(remainingBalance));
  const interestPaid = roundInternal(totalInstallmentFlow.minus(principalRepaid));

  const contributions = buildCostContributions(
    input.recurringCosts ?? [],
    input.switchCosts ?? [],
    paymentsConsidered,
    input.linkedProductsMonthlyCost,
  );

  const recurringCostsTotalValue = sumDecimal(
    contributions
      .filter((contribution) => contribution.bucket === 'recurring')
      .map((contribution) => contribution.totalAmountValue),
  );
  const upfrontCostsTotalValue = sumDecimal(
    contributions
      .filter((contribution) => contribution.bucket === 'upfront')
      .map((contribution) => contribution.totalAmountValue),
  );
  const switchCostsTotalValue = sumDecimal(
    contributions
      .filter((contribution) => contribution.bucket === 'switch')
      .map((contribution) => contribution.totalAmountValue),
  );

  const totalRealCostValue = roundInternal(
    interestPaid.plus(recurringCostsTotalValue).plus(upfrontCostsTotalValue).plus(switchCostsTotalValue),
  );
  const finalAmountPaidValue = roundInternal(principalRepaid.plus(totalRealCostValue));

  const formula = getRuleSource('TOTAL_REAL_COST');

  return {
    formulaId: formula.id,
    formulaVersion: formula.version,
    horizonMonths: input.horizonMonths,
    paymentsConsidered,
    monthlyInstallment: formatMoney(installment),
    rawMonthlyInstallment: installment.toFixed(4),
    principalRepaid: principalRepaid.toFixed(4),
    interestPaid: interestPaid.toFixed(4),
    recurringCostsTotal: recurringCostsTotalValue.toFixed(4),
    upfrontCostsTotal: upfrontCostsTotalValue.toFixed(4),
    switchCostsTotal: switchCostsTotalValue.toFixed(4),
    totalRealCost: totalRealCostValue.toFixed(4),
    finalAmountPaid: finalAmountPaidValue.toFixed(4),
    remainingBalanceAfterHorizon: remainingBalance.toFixed(4),
    costBreakdown: contributions.map((contribution) => contribution.line),
  };
}

function buildCostContributions(
  recurringCosts: ReadonlyArray<AssociatedCostInput>,
  switchCosts: ReadonlyArray<AssociatedCostInput>,
  paymentsConsidered: number,
  linkedProductsMonthlyCost?: DecimalInput,
): ReadonlyArray<CostContribution> {
  const normalizedRecurringCosts = recurringCosts.map((cost) =>
    normalizeCostContribution(cost, paymentsConsidered),
  );
  const normalizedSwitchCosts = switchCosts.map((cost) =>
    normalizeCostContribution(cost, paymentsConsidered, 'switch'),
  );

  const linkedProductContribution =
    linkedProductsMonthlyCost === undefined
      ? []
      : [
          normalizeCostContribution(
            {
              amount: String(linkedProductsMonthlyCost),
              costType: 'linked_product',
              timing: 'monthly',
              description: 'Coste mensual declarado para productos vinculados',
              includedInTotalCost: true,
              sourceType: 'user_provided',
            },
            paymentsConsidered,
          ),
        ];

  return [...normalizedRecurringCosts, ...linkedProductContribution, ...normalizedSwitchCosts];
}

function normalizeCostContribution(
  cost: AssociatedCostInput,
  paymentsConsidered: number,
  forcedBucket?: CostBucket,
): CostContribution {
  const includedInTotalCost = cost.includedInTotalCost ?? true;
  const amountValue = includedInTotalCost ? toDecimal(cost.amount) : zero();
  const sourceType = cost.sourceType ?? 'user_provided';

  const { totalAmountValue, periodsApplied, bucket } = calculateCostImpact(
    amountValue,
    cost.timing,
    paymentsConsidered,
    forcedBucket,
  );

  return {
    bucket,
    totalAmountValue,
    line: {
      amount: formatMoney(cost.amount),
      costType: cost.costType,
      description: cost.description,
      includedInTotalCost,
      periodsApplied,
      sourceType,
      timing: cost.timing,
      totalAmount: totalAmountValue.toFixed(4),
    },
  };
}

function calculateCostImpact(
  amountValue: ReturnType<typeof toDecimal>,
  timing: AssociatedCostInput['timing'],
  paymentsConsidered: number,
  forcedBucket?: CostBucket,
): {
  bucket: CostBucket;
  periodsApplied?: number;
  totalAmountValue: ReturnType<typeof toDecimal>;
} {
  switch (timing) {
    case 'monthly':
      return {
        bucket: forcedBucket ?? 'recurring',
        periodsApplied: paymentsConsidered,
        totalAmountValue: roundInternal(amountValue.mul(paymentsConsidered)),
      };
    case 'annual':
      return {
        bucket: forcedBucket ?? 'recurring',
        periodsApplied: paymentsConsidered,
        totalAmountValue: roundInternal(amountValue.mul(paymentsConsidered).div(12)),
      };
    case 'one_off_switch':
      return {
        bucket: 'switch',
        periodsApplied: 1,
        totalAmountValue: roundInternal(amountValue),
      };
    case 'upfront':
    default:
      return {
        bucket: forcedBucket ?? 'upfront',
        periodsApplied: 1,
        totalAmountValue: roundInternal(amountValue),
      };
  }
}
