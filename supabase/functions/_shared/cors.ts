// Shared CORS utility for all edge functions
// Restricts origins to production domains only

const PRODUCTION_DOMAINS = [
  'https://handledly.com',
  'https://www.handledly.com',
];

// Dynamic origin validation for Lovable preview/project domains
function isAllowedOrigin(origin: string): boolean {
  if (PRODUCTION_DOMAINS.includes(origin)) return true;
  // Match Lovable preview domains: https://*.lovable.app
  if (/^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/.test(origin)) return true;
  // Match Lovable project domains: https://*.lovableproject.com
  if (/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin)) return true;
  return false;
}

// For backwards compatibility, export as array (used by some edge functions)
const ALLOWED_ORIGINS = PRODUCTION_DOMAINS;

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check if origin is allowed (production domains or Lovable preview/project domains)
  const allowedOrigin = isAllowedOrigin(origin) 
    ? origin 
    : PRODUCTION_DOMAINS[0]; // Default to primary domain
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

// For webhook endpoints that need to accept requests from external services
export const webhookCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, elevenlabs-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export { ALLOWED_ORIGINS, PRODUCTION_DOMAINS, isAllowedOrigin };
