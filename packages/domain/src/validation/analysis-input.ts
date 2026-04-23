import { z } from 'zod';

import {
  affordabilityClassifications,
  costTimings,
  costTypes,
  currencies,
  dataQualityStatuses,
  incomeStabilities,
  retentionPreferences,
  sourceTypes,
} from '../types/common';
import type {
  AnalysisValidationResult,
  ValidatedMortgageAnalysisInput,
  ValidationIssue,
} from '../types/analysis';
import { calculateEstimatedInstallment } from '../formulas/calculate-estimated-installment';
import { formatMoney, toDecimal } from '../formulas/decimal';
import { getRuleSource } from '../rules/rule-sources';

const decimalStringSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    try {
      toDecimal(value);
      return true;
    } catch {
      return false;
    }
  }, 'Expected a decimal-compatible string');

const positiveMoneySchema = decimalStringSchema.refine(
  (value) => toDecimal(value).gt(0),
  'Expected a positive monetary amount',
);

const nonNegativeMoneySchema = decimalStringSchema.refine(
  (value) => toDecimal(value).gte(0),
  'Expected a non-negative monetary amount',
);

const nonNegativePercentageSchema = decimalStringSchema.refine(
  (value) => toDecimal(value).gte(0),
  'Expected a non-negative percentage',
);

const costInputSchema = z.object({
  costType: z.enum(costTypes),
  timing: z.enum(costTimings),
  amount: nonNegativeMoneySchema,
  description: z.string().trim().min(1).optional(),
  includedInTotalCost: z.boolean().default(true),
  sourceType: z.enum(sourceTypes).default('user_provided'),
});

const mortgageTermsSchema = z.object({
  pendingPrincipal: positiveMoneySchema,
  remainingMonths: z.number().int().positive(),
  nominalAnnualRate: nonNegativePercentageSchema,
  recurringCosts: z.array(costInputSchema).default([]),
  assumptions: z.array(z.string().trim().min(1)).default([]),
});

const currentMortgageInputSchema = mortgageTermsSchema.extend({
  currentInstallment: positiveMoneySchema.optional(),
});

const offerVariantInputSchema = mortgageTermsSchema.extend({
  linkedProductsMonthlyCost: nonNegativeMoneySchema.optional(),
  bonificationRateDelta: nonNegativePercentageSchema.optional(),
});

const householdProfileInputSchema = z.object({
  netMonthlyIncome: positiveMoneySchema,
  monthlyObligations: nonNegativeMoneySchema,
  incomeStability: z.enum(incomeStabilities).optional(),
  notes: z.string().trim().min(1).optional(),
});

export const analysisInputSchema = z.object({
  retentionPreference: z.enum(retentionPreferences),
  horizonMonths: z.number().int().positive(),
  currency: z.enum(currencies).default('EUR'),
  currentMortgage: currentMortgageInputSchema,
  alternativeOffer: z.object({
    withoutBonus: offerVariantInputSchema,
    withBonus: offerVariantInputSchema.optional(),
  }),
  switchCosts: z.array(costInputSchema).default([]),
  householdProfile: householdProfileInputSchema.optional(),
});

export const dataQualityStatusSchema = z.enum(dataQualityStatuses);
export const affordabilityClassificationSchema = z.enum(affordabilityClassifications);

export function validateAnalysisInput(input: unknown): AnalysisValidationResult {
  const parsed = analysisInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        reason: issue.message,
        severity: 'blocking',
      })),
      dataQualityStatus: 'blocked',
    };
  }

  const data = parsed.data as ValidatedMortgageAnalysisInput;
  const issues: ValidationIssue[] = [];

  issues.push(
    ...validateHorizon('currentMortgage.remainingMonths', data.horizonMonths, data.currentMortgage.remainingMonths),
  );
  issues.push(
    ...validateHorizon(
      'alternativeOffer.withoutBonus.remainingMonths',
      data.horizonMonths,
      data.alternativeOffer.withoutBonus.remainingMonths,
    ),
  );

  if (data.alternativeOffer.withBonus) {
    issues.push(
      ...validateHorizon(
        'alternativeOffer.withBonus.remainingMonths',
        data.horizonMonths,
        data.alternativeOffer.withBonus.remainingMonths,
      ),
    );
    const withBonusIssue = validateWithBonusVariant(data);
    if (withBonusIssue) {
      issues.push(withBonusIssue);
    }
  }

  const currentInstallmentIssue = detectCurrentInstallmentContradiction(data);
  if (currentInstallmentIssue) {
    issues.push(currentInstallmentIssue);
  }

  if (data.householdProfile?.incomeStability === 'variable' && !data.householdProfile.notes) {
    issues.push({
      field: 'householdProfile.notes',
      reason:
        'Income stability is variable; add a note so the future affordability explanation can expose the assumption.',
      severity: 'warning',
      ruleId: getRuleSource('AFFORDABILITY_THRESHOLDS').id,
    });
  }

  const dataQualityStatus = deriveValidationQualityStatus(issues);

  return {
    success: dataQualityStatus !== 'blocked',
    issues,
    dataQualityStatus,
    data: dataQualityStatus === 'blocked' ? undefined : data,
  };
}

export function detectCurrentInstallmentContradiction(
  data: ValidatedMortgageAnalysisInput,
): ValidationIssue | undefined {
  const declaredInstallment = data.currentMortgage.currentInstallment;

  if (!declaredInstallment) {
    return undefined;
  }

  const consistencyRule = getRuleSource('CURRENT_INSTALLMENT_CONSISTENCY');
  const technicalTolerance = toDecimal(
    consistencyRule.thresholds?.technicalToleranceEur ?? '0.50',
  );
  const estimatedInstallment = calculateEstimatedInstallment({
    pendingPrincipal: data.currentMortgage.pendingPrincipal,
    remainingMonths: data.currentMortgage.remainingMonths,
    nominalAnnualRate: data.currentMortgage.nominalAnnualRate,
  }).monthlyInstallment;
  const difference = toDecimal(declaredInstallment).minus(estimatedInstallment).abs();

  if (difference.lte(technicalTolerance)) {
    return undefined;
  }

  return {
    field: 'currentMortgage.currentInstallment',
    reason: `Declared installment (${formatMoney(declaredInstallment)} EUR) differs from the estimated installment (${estimatedInstallment} EUR) by ${formatMoney(
      difference,
    )} EUR. Review principal, term or rate.`,
    severity: 'warning',
    ruleId: consistencyRule.id,
  };
}

function validateHorizon(
  field: string,
  horizonMonths: number,
  remainingMonths: number,
): ValidationIssue[] {
  if (horizonMonths <= remainingMonths) {
    return [];
  }

  return [
    {
      field,
      reason: 'Horizon cannot exceed remaining months for the current MVP foundation.',
      severity: 'blocking',
    },
  ];
}

function validateWithBonusVariant(
  data: ValidatedMortgageAnalysisInput,
): ValidationIssue | undefined {
  const withBonus = data.alternativeOffer.withBonus;

  if (!withBonus) {
    return undefined;
  }

  const withoutBonus = data.alternativeOffer.withoutBonus;
  const sameRate = withBonus.nominalAnnualRate === withoutBonus.nominalAnnualRate;
  const sameLinkedCost =
    (withBonus.linkedProductsMonthlyCost ?? '0') ===
    (withoutBonus.linkedProductsMonthlyCost ?? '0');
  const sameBonusDelta = (withBonus.bonificationRateDelta ?? '0') === '0';
  const sameRecurringCosts =
    JSON.stringify(withBonus.recurringCosts) === JSON.stringify(withoutBonus.recurringCosts);

  if (!(sameRate && sameLinkedCost && sameBonusDelta && sameRecurringCosts)) {
    return undefined;
  }

  return {
    field: 'alternativeOffer.withBonus',
    reason:
      'The with-bonus variant must change rate or linked-cost assumptions; otherwise it is indistinguishable from the without-bonus offer.',
    severity: 'blocking',
  };
}

function deriveValidationQualityStatus(
  issues: ReadonlyArray<ValidationIssue>,
): AnalysisValidationResult['dataQualityStatus'] {
  if (issues.some((issue) => issue.severity === 'blocking')) {
    return 'blocked';
  }

  if (issues.some((issue) => issue.severity === 'warning')) {
    return 'conditional_estimate';
  }

  return 'complete';
}
