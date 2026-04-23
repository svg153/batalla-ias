import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import type { CookieOptions } from 'express';

import type { RetentionPreference } from '@batalla-ias/domain';

export const ANALYSIS_SESSION_COOKIE = 'analysis_session';

const hashToken = (token: string, pepper = process.env.ANALYSIS_SESSION_PEPPER ?? '') =>
  createHash('sha256').update(`${pepper}:${token}`).digest('hex');

export const generateAnalysisSessionToken = () => randomBytes(32).toString('base64url');

export const hashAnalysisSessionToken = (token: string) => hashToken(token);

export const matchesAnalysisSessionToken = (
  token: string,
  expectedHash: string,
) => {
  const candidate = Buffer.from(hashToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
};

export const extractCookieValue = (
  cookieHeader: string | undefined,
  name: string,
) => {
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

export const buildAnalysisSessionCookieOptions = (
  retentionPreference: RetentionPreference,
  expiresAt: string,
): CookieOptions => {
  const secure =
    process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test';

  return {
    httpOnly: true,
    path: '/api/v1',
    sameSite: 'lax',
    secure,
    ...(retentionPreference === 'save_analysis'
      ? { expires: new Date(expiresAt) }
      : {}),
  };
};
