// Shared CORS utility for all edge functions
// Restricts origins to production domains only

const ALLOWED_ORIGINS = [
  'https://handledly.com',
  'https://www.handledly.com',
  'https://id-preview--c4ec72c4-17ec-431f-865b-98773c111e46.lovable.app',
  'https://c4ec72c4-17ec-431f-865b-98773c111e46.lovableproject.com',
  // Allow localhost for development
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check if origin is in allowed list
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Default to primary domain
  
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

export { ALLOWED_ORIGINS };
