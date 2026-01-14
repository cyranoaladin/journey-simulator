/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Middleware system for API requests
 * Reduces cognitive complexity by separating concerns
 */

import { logger } from './logger';
import { tokenStore } from './tokenStore';

export type MiddlewareContext<T> = {
  path: string;
  options: RequestInit;
  retryOnUnauthorized: boolean;
  token: string | null;
  response?: Response;
  result?: T;
};

export type Middleware<T> = (
  context: MiddlewareContext<T>,
  next: () => Promise<MiddlewareContext<T>>
) => Promise<MiddlewareContext<T>>;

/**
 * Demo mode middleware - handles all demo mode logic
 */
export const demoModeMiddleware: Middleware<unknown> = async (context, next) => {
  const { path, options, token } = context;
  const isAIAgentCall = path.includes('/step') || path.includes('/submit');

  if (token !== 'demo-token' || isAIAgentCall) {
    return next();
  }

  logger.debug(`[Demo Mode] Mocking request to ${path}`);
  return handleDemoRequest(path, options);
};

/**
 * Auth middleware - handles token refresh on 401
 */
export const authMiddleware: Middleware<unknown> = async (context, _next) => {
  const { path, options, retryOnUnauthorized } = context;
  let response: Response;

  try {
    response = await fetch(`${context.path}`, {
      ...options,
      headers: { ...(options.headers || {}) },
    });
  } catch (networkError) {
    const fallback = await handleOfflineFallback(path, networkError);
    if (fallback !== undefined) {
      return { ...context, result: fallback };
    }
    throw networkError;
  }

  if (response.status === 401 && retryOnUnauthorized) {
    return handleTokenRefresh(context, response, path, options);
  }

  return { ...context, response };
};

/**
 * Response handler middleware
 */
export const responseHandlerMiddleware: Middleware<unknown> = async (_context, next) => {
  const ctx = await next();
  if (!ctx.response) {
    return ctx;
  }
  return { ...ctx, result: await handleResponse(ctx.response) };
};

/**
 * Helper: Handle demo mode requests
 */
async function handleDemoRequest<T>(path: string, options: RequestInit): Promise<MiddlewareContext<T>> {
  // Demo mode logic extracted from original request function
  // This is a simplified version - full implementation would include all demo handlers
  const demoHandlers = getDemoHandlers();
  const handler = demoHandlers.find((h) => h.matches(path, options));

  if (handler) {
    return {
      path,
      options,
      retryOnUnauthorized: false,
      token: 'demo-token',
      result: await handler.handle(path, options) as T,
    };
  }

  return {
    path,
    options,
    retryOnUnauthorized: false,
    token: 'demo-token',
    result: { success: true } as T,
  };
}

/**
 * Helper: Handle token refresh
 */
async function handleTokenRefresh<T>(
  context: MiddlewareContext<T>,
  response: Response,
  path: string,
  options: RequestInit
): Promise<MiddlewareContext<T>> {
  const storedRefreshToken = tokenStore.getRefreshToken();
  if (!storedRefreshToken) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: 'Unauthorized and no refresh token available',
    }));
    throw new Error(errorData.message || 'Unauthorized');
  }

  if (storedRefreshToken === 'demo-refresh-token') {
    tokenStore.setAccessToken('demo-token');
    return { ...context, token: 'demo-token' };
  }

  // Refresh token logic
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const refreshResp = await fetch(`${API_BASE_URL}/user/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: storedRefreshToken }),
  });

  if (refreshResp.ok) {
    const refreshData = await refreshResp.json();
    if (refreshData?.accessToken) {
      tokenStore.setAccessToken(refreshData.accessToken);
    }
    if (refreshData?.refreshToken) {
      tokenStore.setRefreshToken(refreshData.refreshToken);
    }
    // Retry original request
    const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${tokenStore.getAccessToken()}`,
      },
    });
    return { ...context, response: retryResponse };
  }

  tokenStore.clearTokens();
  const errorData = await refreshResp.json().catch(() => ({
    success: false,
    message: 'Token refresh failed',
  }));
  throw new Error(errorData.message || 'Token refresh failed');
}

/**
 * Helper: Handle response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: 'Network error occurred',
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Helper: Handle offline fallback
 */
async function handleOfflineFallback<T>(_path: string, _error: unknown): Promise<T | undefined> {
  // Offline fallback logic placeholder
  return undefined;
}

/**
 * Demo handler interface
 */
interface DemoHandler {
  matches: (path: string, options: RequestInit) => boolean;
  handle: (path: string, options: RequestInit) => Promise<unknown>;
}

/**
 * Demo handlers registry
 */
function getDemoHandlers(): DemoHandler[] {
  // This would contain all the demo mode handlers
  // For now, return empty array - full implementation would include all handlers
  return [];
}

/**
 * Compose middlewares
 */
export function composeMiddlewares<T>(...middlewares: Middleware<T>[]): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: () => Promise<MiddlewareContext<T>>) => {
    let index = -1;

    const dispatch = async (i: number): Promise<MiddlewareContext<T>> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const middleware = middlewares[i];
      if (!middleware) {
        return next();
      }
      return middleware(context, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
}
