// Shared rate limiting utility for edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  tableName: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
}

// Get client identifier from request
export function getClientIdentifier(req: Request): string {
  // Try x-forwarded-for first (most common for proxied requests)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to x-real-ip
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Last resort: use a hash of user-agent + other headers
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const acceptLang = req.headers.get('accept-language') || '';
  return `anon-${hashString(userAgent + acceptLang)}`;
}

// Simple hash function for fallback identifier
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Check rate limit using database function
export async function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const identifier = getClientIdentifier(req);
  
  try {
    const { data: allowed, error } = await supabase.rpc('check_rate_limit_readonly', {
      p_table_name: config.tableName,
      p_identifier: identifier,
      p_max_requests: config.maxRequests,
      p_time_window_minutes: config.windowMinutes,
    });
    
    if (error) {
      console.warn(`[rate-limit] Error checking rate limit: ${error.message}`);
      // Fail open - allow request if rate limit check fails
      return { allowed: true };
    }
    
    if (!allowed) {
      console.log(`[rate-limit] Rate limit exceeded for ${identifier} on ${config.tableName}`);
      return { 
        allowed: false, 
        retryAfter: config.windowMinutes * 60 
      };
    }
    
    // Record the request for rate limiting
    await supabase
      .from('rate_limit_tracker')
      .insert({
        identifier,
        table_name: config.tableName,
      });
    
    return { allowed: true };
  } catch (err) {
    console.warn(`[rate-limit] Exception during rate limit check: ${err}`);
    // Fail open
    return { allowed: true };
  }
}

// Create rate limit exceeded response
export function createRateLimitResponse(
  corsHeaders: Record<string, string>,
  retryAfter: number = 60
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryable: true,
      retryAfter,
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      } 
    }
  );
}

// Rate limit configurations for each function
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-chat': { maxRequests: 30, windowMinutes: 1, tableName: 'edge_ai_chat' },
  'send-quote-email': { maxRequests: 5, windowMinutes: 1, tableName: 'edge_quote_email' },
  'trigger-confirmation-call': { maxRequests: 5, windowMinutes: 1, tableName: 'edge_confirmation_call' },
  'send-sms-notification': { maxRequests: 5, windowMinutes: 1, tableName: 'edge_sms_notification' },
  'health-check': { maxRequests: 60, windowMinutes: 1, tableName: 'edge_health_check' },
};
