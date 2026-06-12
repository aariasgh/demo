/**
 * API Error Handling Utilities
 * Provides retry logic with exponential backoff and error classification
 */

export const ApiErrorType = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  CLIENT: 'CLIENT_ERROR', // 4xx
  SERVER: 'SERVER_ERROR', // 5xx
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorType = (typeof ApiErrorType)[keyof typeof ApiErrorType];

export interface ApiError {
  type: ApiErrorType;
  statusCode?: number;
  message: string;
  isRetryable: boolean;
}

/**
 * Classify error and determine if it's retryable
 */
export function classifyError(error: unknown, statusCode?: number): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ApiErrorType.NETWORK,
      message: 'Error de conexión. Por favor verifica tu internet.',
      isRetryable: true,
    };
  }

  if (error instanceof Error && error.message.includes('timeout')) {
    return {
      type: ApiErrorType.TIMEOUT,
      statusCode,
      message: 'Tiempo de espera agotado. Por favor intenta de nuevo.',
      isRetryable: true,
    };
  }

  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return {
      type: ApiErrorType.CLIENT,
      statusCode,
      message: `Error del cliente (${statusCode}). Por favor verifica tu solicitud.`,
      isRetryable: false,
    };
  }

  if (statusCode && statusCode >= 500) {
    return {
      type: ApiErrorType.SERVER,
      statusCode,
      message: 'El servidor está experimentando problemas. Por favor intenta más tarde.',
      isRetryable: true,
    };
  }

  return {
    type: ApiErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : 'Error desconocido',
    isRetryable: true,
  };
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  shouldRetry?: (error: ApiError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  // Add jitter: ±20% randomness
  const jitter = exponentialDelay * (0.8 + Math.random() * 0.4);
  return Math.floor(jitter);
}

/**
 * Sleep utility for async delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      // Create AbortController with timeout (polyfill: manual timeout for older browsers)
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (response.ok) {
        return response;
      }

      const error = classifyError(null, response.status);
      lastError = error;

      // Don't retry on client errors (4xx)
      if (!error.isRetryable) {
        throw error;
      }

      // Last attempt, don't sleep
      if (attempt < config.maxAttempts - 1) {
        const delayMs = calculateBackoffDelay(attempt, config);
        await sleep(delayMs);
      }
    } catch (err) {
      const error = classifyError(err, undefined);
      lastError = error;

      if (!error.isRetryable || attempt === config.maxAttempts - 1) {
        throw error;
      }

      const delayMs = calculateBackoffDelay(attempt, config);
      await sleep(delayMs);
    }
  }

  throw lastError || {
    type: ApiErrorType.UNKNOWN,
    message: 'Todos los intentos fallaron',
    isRetryable: false,
  };
}

/**
 * Request deduplication cache
 * Prevents duplicate concurrent requests to the same endpoint
 */
class RequestCache {
  private cache = new Map<string, Promise<Response>>();

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    const cacheKey = `${options?.method || 'GET'}:${url}`;

    // Return cached promise if one is in flight
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Execute new request and cache the promise
    const promise = fetchWithRetry(url, options);
    this.cache.set(cacheKey, promise);

    try {
      const response = await promise;
      return response;
    } finally {
      // Clean up cache after request completes (success or failure)
      this.cache.delete(cacheKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
