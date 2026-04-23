import type { NextFunction, Request, Response } from 'express';

const REDACTED = '[REDACTED]';
const sensitiveFields = new Set([
  'amount',
  'bonificationRateDelta',
  'currentInstallment',
  'linkedProductsMonthlyCost',
  'monthlyObligations',
  'netMonthlyIncome',
  'nominalAnnualRate',
  'notes',
  'pendingPrincipal',
]);

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const redactValue = (value: unknown, key?: string): JsonValue => {
  if (key && sensitiveFields.has(key)) {
    return REDACTED;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactValue(entryValue, entryKey),
      ]),
    );
  }

  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  return String(value);
};

export const redactSensitivePayload = <T>(value: T): JsonValue =>
  redactValue(value) satisfies JsonValue;

export interface PrivacyMiddlewareOptions {
  logger?: (message: string, context?: JsonValue) => void;
}

export const createPrivacyMiddleware = (
  options: PrivacyMiddlewareOptions = {},
) => {
  const logger =
    options.logger ??
    ((message: string, context?: JsonValue) => {
      if (process.env.NODE_ENV === 'test') {
        return;
      }

      if (context) {
        console.info(message, JSON.stringify(context));
        return;
      }

      console.info(message);
    });

  return (request: Request, response: Response, next: NextFunction) => {
    const redactedBody = redactSensitivePayload(request.body ?? {});

    response.locals.privacy = {
      redactedBody,
      receivedAt: new Date().toISOString(),
    };

    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Referrer-Policy', 'no-referrer');

    response.on('finish', () => {
      logger(
        `[privacy] ${request.method} ${request.originalUrl} -> ${response.statusCode}`,
        redactedBody,
      );
    });

    next();
  };
};
