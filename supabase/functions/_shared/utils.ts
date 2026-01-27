// Shared utilities for edge functions

// Fetch with timeout wrapper
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 25000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Structured logging utility
export function log(
  functionName: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    function: functionName,
    message,
    ...data,
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

// Standardized error response
export interface ErrorResponseBody {
  error: string;
  code: string;
  retryable: boolean;
  retryAfter?: number;
}

export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  corsHeaders: Record<string, string>,
  retryable: boolean = false
): Response {
  const body: ErrorResponseBody = {
    error: message,
    code,
    retryable,
    ...(retryable && { retryAfter: 30 }),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Success response helper
export function createSuccessResponse(
  data: Record<string, unknown>,
  corsHeaders: Record<string, string>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
