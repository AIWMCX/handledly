import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Health check doesn't need restricted CORS - allow any origin to check health
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    supabase_connection: boolean;
  };
  latency?: {
    database_ms: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: false,
      supabase_connection: false,
    },
  };

  try {
    // Check Supabase connection and database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      healthStatus.status = 'unhealthy';
      healthStatus.checks.supabase_connection = false;
    } else {
      healthStatus.checks.supabase_connection = true;
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test database query
      const dbStart = Date.now();
      const { error } = await supabase
        .from('business_settings')
        .select('id')
        .limit(1);
      
      const dbLatency = Date.now() - dbStart;
      
      if (error) {
        console.error('[health-check] Database check failed:', error.message);
        healthStatus.checks.database = false;
        healthStatus.status = 'degraded';
      } else {
        healthStatus.checks.database = true;
        healthStatus.latency = { database_ms: dbLatency };
      }
    }

    // Determine overall status
    if (!healthStatus.checks.database || !healthStatus.checks.supabase_connection) {
      healthStatus.status = healthStatus.checks.supabase_connection ? 'degraded' : 'unhealthy';
    }

    const httpStatus = healthStatus.status === 'unhealthy' ? 503 : 200;

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: httpStatus, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        } 
      }
    );

  } catch (error) {
    console.error('[health-check] Error:', error);
    
    healthStatus.status = 'unhealthy';
    
    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: 503, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
