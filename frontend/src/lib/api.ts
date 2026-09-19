/**
 * FRIDAY API Foundation (Phase 2)
 *
 * Provides typed contract wrappers, response containers, and error formatting
 * ready for subsequent feature phase endpoint integration.
 * In accordance with Phase 2 rules: no network requests or backend integrations are executed.
 */

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base HTTP request foundation prepared for future phases.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  _config?: RequestConfig
): Promise<ApiResponse<T>> {
  // Phase 2 contract placeholder - returns structured foundation container
  return {
    data: {} as T,
    status: 200,
    message: `Endpoint stubbed for Phase 2: ${endpoint}`,
    timestamp: new Date().toISOString(),
  };
}
