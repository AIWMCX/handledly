// Shared security utilities for all edge functions
// Provides: request size limits, security headers, IP rate limiting

// Maximum request body size (100KB)
export const MAX_BODY_SIZE = 100 * 1024;

// Security response headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Extract client IP from request headers
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

// Validate request body size
// Returns the body text if valid, or throws an error response
export async function validateRequestSize(
  req: Request,
  corsHeaders: Record<string, string>,
  maxSize: number = MAX_BODY_SIZE
): Promise<{ body: string; error?: Response }> {
  try {
    const body = await req.text();
    
    if (body.length > maxSize) {
      console.warn(`[security] Request body too large: ${body.length} bytes (max: ${maxSize})`);
      return {
        body: '',
        error: new Response(
          JSON.stringify({ error: 'Request too large' }),
          { 
            status: 413, 
            headers: { 
              ...corsHeaders, 
              ...securityHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        ),
      };
    }
    
    return { body };
  } catch (err) {
    console.error('[security] Failed to read request body:', err);
    return {
      body: '',
      error: new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            ...securityHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      ),
    };
  }
}

// Create a secure JSON response with all security headers
export function secureJsonResponse(
  data: unknown,
  corsHeaders: Record<string, string>,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Create a secure error response
export function secureErrorResponse(
  error: string,
  corsHeaders: Record<string, string>,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({ error }),
    {
      status,
      headers: {
        ...corsHeaders,
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Check IP-based rate limit using Supabase
// Returns true if request is allowed, false if rate limited
export async function checkIpRateLimit(
  supabase: any,
  clientIp: string,
  tableName: string,
  maxRequests: number = 10,
  windowMinutes: number = 60
): Promise<{ allowed: boolean; error?: Response; corsHeaders?: Record<string, string> }> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    
    const { count, error } = await supabase
      .from('rate_limit_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', clientIp)
      .eq('table_name', tableName)
      .gte('created_at', windowStart);

    if (error) {
      console.warn(`[security] Rate limit check failed: ${error.message}`);
      return { allowed: true }; // Fail open on DB errors
    }

    if ((count || 0) >= maxRequests) {
      console.warn(`[security] IP rate limit exceeded for ${clientIp} on ${tableName}: ${count}/${maxRequests}`);
      return { allowed: false };
    }

    // Record this request
    await supabase.from('rate_limit_tracker').insert({
      identifier: clientIp,
      table_name: tableName,
    });

    return { allowed: true };
  } catch (err) {
    console.warn('[security] Rate limit error:', err);
    return { allowed: true }; // Fail open
  }
}

// Combine all security headers with CORS headers
export function getAllSecurityHeaders(corsHeaders: Record<string, string>): Record<string, string> {
  return {
    ...corsHeaders,
    ...securityHeaders,
    'Content-Type': 'application/json',
  };
}
