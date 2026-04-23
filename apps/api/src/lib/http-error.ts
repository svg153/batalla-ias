import type { ErrorDetail, ErrorResponse } from '@batalla-ias/domain';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createNotFoundError = (field: string, reason: string) =>
  new ApiError(404, 'analysis_not_found', 'Analysis not found.', [
    { field, reason, severity: 'blocking' },
  ]);

export const createUnauthorizedError = (field: string, reason: string) =>
  new ApiError(401, 'unauthorized', 'Missing or invalid analysis session.', [
    { field, reason, severity: 'blocking' },
  ]);

export const createNotImplementedError = (field: string, reason: string) =>
  new ApiError(501, 'feature_not_implemented', 'Feature is not implemented yet.', [
    { field, reason, severity: 'blocking' },
  ]);

export const createValidationError = (
  details: ErrorDetail[],
  message = 'Request failed validation or consistency checks.',
) => new ApiError(400, 'validation_error', message, details);

export const createBadJsonError = () =>
  new ApiError(400, 'invalid_json', 'Request body must be valid JSON.', [
    {
      field: 'body',
      reason: 'Malformed JSON payload.',
      severity: 'blocking',
    },
  ]);

export const fromZodError = (error: ZodError): ApiError =>
  new ApiError(
    400,
    'validation_error',
    'Request failed validation or consistency checks.',
    error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      reason: issue.message,
      severity: 'blocking' as const,
    })),
  );

export const toErrorResponse = (error: ApiError): ErrorResponse => ({
  code: error.code,
  message: error.message,
  details: error.details,
});
