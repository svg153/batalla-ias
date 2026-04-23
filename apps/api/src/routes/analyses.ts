import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import { analysisInputSchema, type CreateAnalysisInput } from '@batalla-ias/domain';
import { z } from 'zod';

import {
  createNotFoundError,
  createUnauthorizedError,
  createValidationError,
} from '../lib/http-error.js';
import {
  buildAnalysisSessionCookieOptions,
  ANALYSIS_SESSION_COOKIE,
  extractCookieValue,
} from '../modules/analyses/analysis-session.js';
import {
  presentAffordabilityResponse,
  presentAnalysisResponse,
  presentComparisonResponse,
} from '../modules/analyses/analysis-presenters.js';
import {
  AnalysisValidationError,
  type AnalysisService,
} from '../modules/analyses/analysis-service.js';

export interface AnalysesRouterOptions {
  analysisService: AnalysisService;
}

const analysisIdSchema = z.string().uuid();
const affordabilityRequestSchema = z.object({
  householdProfile: analysisInputSchema.shape.householdProfile.unwrap(),
});

const normalizeCreateAnalysisInput = (
  input: z.infer<typeof analysisInputSchema>,
): CreateAnalysisInput => {
  const normalizeCost = (cost: (typeof input.currentMortgage.recurringCosts)[number]) => ({
    costType: cost.costType,
    timing: cost.timing,
    amount: cost.amount,
    ...(cost.includedInTotalCost === false ? { includedInTotalCost: false } : {}),
    ...(cost.description ? { description: cost.description } : {}),
    ...(cost.sourceType ? { sourceType: cost.sourceType } : {}),
  });

  const normalizeVariant = (
    variant: typeof input.alternativeOffer.withoutBonus,
  ): CreateAnalysisInput['alternativeOffer']['withoutBonus'] => ({
    pendingPrincipal: variant.pendingPrincipal,
    remainingMonths: variant.remainingMonths,
    nominalAnnualRate: variant.nominalAnnualRate,
    ...(variant.linkedProductsMonthlyCost
      ? { linkedProductsMonthlyCost: variant.linkedProductsMonthlyCost }
      : {}),
    ...(variant.bonificationRateDelta
      ? { bonificationRateDelta: variant.bonificationRateDelta }
      : {}),
    ...(variant.recurringCosts.length
      ? { recurringCosts: variant.recurringCosts.map(normalizeCost) }
      : {}),
  });

  return {
    retentionPreference: input.retentionPreference,
    horizonMonths: input.horizonMonths,
    currentMortgage: {
      pendingPrincipal: input.currentMortgage.pendingPrincipal,
      remainingMonths: input.currentMortgage.remainingMonths,
      nominalAnnualRate: input.currentMortgage.nominalAnnualRate,
      ...(input.currentMortgage.currentInstallment
        ? { currentInstallment: input.currentMortgage.currentInstallment }
        : {}),
      ...(input.currentMortgage.recurringCosts.length
        ? {
            recurringCosts: input.currentMortgage.recurringCosts.map(normalizeCost),
          }
        : {}),
    },
    alternativeOffer: {
      withoutBonus: normalizeVariant(input.alternativeOffer.withoutBonus),
      ...(input.alternativeOffer.withBonus
        ? { withBonus: normalizeVariant(input.alternativeOffer.withBonus) }
        : {}),
    },
    ...(input.switchCosts.length
      ? { switchCosts: input.switchCosts.map(normalizeCost) }
      : {}),
    ...(input.householdProfile
      ? {
          householdProfile: normalizeHouseholdProfile(input.householdProfile),
        }
      : {}),
  };
};

const normalizeHouseholdProfile = (
  householdProfile: NonNullable<z.infer<typeof analysisInputSchema>['householdProfile']>,
) => ({
  netMonthlyIncome: householdProfile.netMonthlyIncome,
  monthlyObligations: householdProfile.monthlyObligations,
  ...(householdProfile.incomeStability
    ? { incomeStability: householdProfile.incomeStability }
    : {}),
  ...(householdProfile.notes ? { notes: householdProfile.notes } : {}),
});

const requireAnalysisSessionToken = (request: Request) => {
  const token = extractCookieValue(request.headers.cookie, ANALYSIS_SESSION_COOKIE);

  if (!token) {
    throw createUnauthorizedError(
      'analysis_session',
      'Supply the analysis_session cookie emitted when the analysis was created.',
    );
  }

  return token;
};

const setAnalysisHeaders = (
  response: Response,
  analysis: ReturnType<typeof presentAnalysisResponse>['analysis'],
) =>
  response
    .set('X-Analysis-Access-Model', analysis.accessMode)
    .set('X-Analysis-Retention-Mode', analysis.retentionMetadata.mode);

const toValidationApiError = (error: AnalysisValidationError) =>
  createValidationError(
    error.issues.map((issue) => ({
      field: issue.field,
      reason: issue.reason,
      severity: issue.severity,
    })),
  );

export const createAnalysesRouter = ({
  analysisService,
}: AnalysesRouterOptions): ExpressRouter => {
  const router = Router();

  router.post('/analyses', async (request, response, next) => {
    try {
      const input = normalizeCreateAnalysisInput(
        analysisInputSchema.parse(request.body),
      );
      const created = await analysisService.create(input);
      const presented = presentAnalysisResponse(created.record);

      setAnalysisHeaders(response, presented.analysis)
        .cookie(
          ANALYSIS_SESSION_COOKIE,
          created.sessionToken,
          buildAnalysisSessionCookieOptions(
            created.record.analysis.retentionPreference,
            created.record.analysis.expiresAt ?? created.record.purgeAfter,
          ),
        )
        .location(`/api/v1/analyses/${created.record.analysis.id}`)
        .status(201)
        .json(presented);
    } catch (error) {
      next(
        error instanceof AnalysisValidationError
          ? toValidationApiError(error)
          : error,
      );
    }
  });

  router.get('/analyses/:analysisId', async (request, response, next) => {
    try {
      const analysisId = analysisIdSchema.parse(request.params.analysisId);
      const found = await analysisService.get(
        analysisId,
        requireAnalysisSessionToken(request),
      );

      if (!found) {
        throw createNotFoundError(
          'analysisId',
          'The analysis does not exist, was deleted, already expired, or is not owned by the supplied analysis_session cookie.',
        );
      }

      const presented = presentAnalysisResponse(found);
      setAnalysisHeaders(response, presented.analysis).json(presented);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/analyses/:analysisId', async (request, response, next) => {
    try {
      const analysisId = analysisIdSchema.parse(request.params.analysisId);
      const deleted = await analysisService.delete(
        analysisId,
        requireAnalysisSessionToken(request),
      );

      if (!deleted) {
        throw createNotFoundError(
          'analysisId',
          'Nothing matched the analysis identifier for the supplied analysis_session cookie.',
        );
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post('/analyses/:analysisId/compare', async (request, response, next) => {
    try {
      const analysisId = analysisIdSchema.parse(request.params.analysisId);
      const result = await analysisService.compare(
        analysisId,
        requireAnalysisSessionToken(request),
      );

      if (!result) {
        throw createNotFoundError(
          'analysisId',
          'Cannot compare an analysis that does not exist, already expired, or is not owned by the supplied analysis_session cookie.',
        );
      }

      setAnalysisHeaders(response, presentAnalysisResponse(result.record).analysis).json(
        presentComparisonResponse(result.record),
      );
    } catch (error) {
      next(
        error instanceof AnalysisValidationError
          ? toValidationApiError(error)
          : error,
      );
    }
  });

  router.post(
    '/analyses/:analysisId/affordability',
    async (request, response, next) => {
      try {
        const analysisId = analysisIdSchema.parse(request.params.analysisId);
        const affordabilityRequest = affordabilityRequestSchema.parse(request.body);
        const result = await analysisService.evaluateAffordability(
          analysisId,
          requireAnalysisSessionToken(request),
          normalizeHouseholdProfile(affordabilityRequest.householdProfile),
        );

        if (!result) {
          throw createNotFoundError(
            'analysisId',
            'Cannot evaluate affordability for an analysis that does not exist, already expired, or is not owned by the supplied analysis_session cookie.',
          );
        }

        setAnalysisHeaders(response, presentAnalysisResponse(result.record).analysis).json(
          presentAffordabilityResponse(result.record),
        );
      } catch (error) {
        next(
          error instanceof AnalysisValidationError
            ? toValidationApiError(error)
            : error,
        );
      }
    },
  );

  return router;
};
