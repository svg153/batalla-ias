import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { ZodError } from 'zod';

import {
  ApiError,
  createBadJsonError,
  fromZodError,
  toErrorResponse,
} from './lib/http-error.js';
import { createPrivacyMiddleware } from './middleware/privacy.js';
import { createAnalysisRepository } from './modules/analyses/analysis-repository.js';
import {
  createAnalysisService,
  type AnalysisService,
} from './modules/analyses/analysis-service.js';
import { createAnalysesRouter } from './routes/analyses.js';

export interface AppDependencies {
  analysisService?: AnalysisService;
}

export const createApp = ({
  analysisService,
}: AppDependencies = {}): Application => {
  const app = express();
  const resolvedAnalysisService =
    analysisService ??
    createAnalysisService({
      repository: createAnalysisRepository(),
    });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(createPrivacyMiddleware());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use(
    '/api/v1',
    createAnalysesRouter({ analysisService: resolvedAnalysisService }),
  );

  app.use((request, response) => {
    response.status(404).json({
      code: 'route_not_found',
      message: 'Route not found.',
      details: [
        {
          field: 'route',
          reason: `No handler for ${request.method} ${request.originalUrl}.`,
          severity: 'blocking',
        },
      ],
    });
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      const normalizedError =
        error instanceof ApiError
          ? error
          : error instanceof ZodError
            ? fromZodError(error)
            : error instanceof SyntaxError && 'body' in error
              ? createBadJsonError()
              : new ApiError(500, 'internal_error', 'Unexpected server error.', [
                  {
                    field: 'server',
                    reason: 'Unhandled backend failure.',
                    severity: 'blocking',
                  },
                ]);

      if (normalizedError.statusCode >= 500 && process.env.NODE_ENV !== 'test') {
        console.error(error);
      }

      response
        .status(normalizedError.statusCode)
        .json(toErrorResponse(normalizedError));
    },
  );

  return app;
};

export const app: Application = createApp();
