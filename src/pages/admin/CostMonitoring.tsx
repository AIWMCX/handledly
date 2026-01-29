/**
 * AI Cost Monitoring Dashboard
 * 
 * Provides real-time visibility into AI/call spending,
 * circuit breaker status, and abuse detection.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ExportDropdown from "@/components/admin/ExportDropdown";
import { useDataExport } from "@/hooks/useDataExport";
import {
  DollarSign,
  AlertTriangle,
  Shield,
  TrendingUp,
  Phone,
  MessageSquare,
  Mail,
  MessageCircle,
  RefreshCw,
  Zap,
  Activity,
  Ban,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Service icons mapping
const serviceIcons: Record<string, React.ElementType> = {
  ai_chat: MessageSquare,
  confirmation_call: Phone,
  sms: MessageCircle,
  email: Mail,
};

// Service colors mapping
const serviceColors: Record<string, string> = {
  ai_chat: "#8884d8",
  confirmation_call: "#82ca9d",
  sms: "#ffc658",
  email: "#ff7300",
};

interface CircuitBreakerConfig {
  id: string;
  service_name: string;
  enabled: boolean;
  daily_limit: number;
  hourly_limit: number;
  current_daily_spend: number;
  current_hourly_spend: number;
  tripped: boolean;
  tripped_at: string | null;
  trip_reason: string | null;
}

interface CostSummary {
  service_type: string;
  total_cost: number;
  request_count: number;
  avg_cost: number;
  date: string;
}

interface HoneypotDetection {
  id: string;
  created_at: string;
  ip_hash: string;
  page: string;
  detection_type: string;
  blocked: boolean;
}

export default function CostMonitoring() {
  const { exportCostData, isExporting } = useDataExport();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "14" | "30">("7");

  // Fetch circuit breaker configs
  const { data: circuitBreakers, isLoading: loadingBreakers } = useQuery({
    queryKey: ["circuit-breakers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circuit_breaker_config" as never)
        .select("*")
        .order("service_name");
      
      if (error) throw error;
      return data as unknown as CircuitBreakerConfig[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch cost summary
  const { data: costSummary, isLoading: loadingCosts } = useQuery({
    queryKey: ["cost-summary", selectedPeriod],
    queryFn: async () => {
      // Use raw fetch since RPC isn't in generated types yet
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/get_cost_summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ p_days: parseInt(selectedPeriod) }),
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch cost summary");
      return await response.json() as CostSummary[];
    },
    refetchInterval: 30000,
  });

  // Fetch recent honeypot detections
  const { data: honeypotDetections } = useQuery({
    queryKey: ["honeypot-detections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("honeypot_detections" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as unknown as HoneypotDetection[];
    },
    refetchInterval: 30000,
  });

  // Toggle circuit breaker
  const toggleBreaker = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("circuit_breaker_config" as never)
        .update({ enabled, tripped: false, trip_reason: null } as never)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circuit-breakers"] });
      toast.success("Circuit breaker updated");
    },
    onError: () => {
      toast.error("Failed to update circuit breaker");
    },
  });

  // Reset circuit breaker
  const resetBreaker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("circuit_breaker_config" as never)
        .update({
          tripped: false,
          trip_reason: null,
          current_hourly_spend: 0,
        } as never)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circuit-breakers"] });
      toast.success("Circuit breaker reset");
    },
  });

  // Calculate totals
  const totalDailySpend = circuitBreakers?.reduce(
    (sum, cb) => sum + (cb.current_daily_spend || 0),
    0
  ) || 0;

  const totalHourlySpend = circuitBreakers?.reduce(
    (sum, cb) => sum + (cb.current_hourly_spend || 0),
    0
  ) || 0;

  const trippedCount = circuitBreakers?.filter((cb) => cb.tripped).length || 0;

  // Format cost data for chart
  const chartData = costSummary
    ? Object.entries(
        costSummary.reduce((acc, item) => {
          const date = item.date;
          if (!acc[date]) {
            acc[date] = { date };
          }
          acc[date][item.service_type] = item.total_cost;
          return acc;
        }, {} as Record<string, Record<string, number | string>>)
      )
        .map(([, value]) => value)
        .reverse()
    : [];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cost Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor AI costs, circuit breakers, and abuse detection
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["circuit-breakers"] });
                queryClient.invalidateQueries({ queryKey: ["cost-summary"] });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <ExportDropdown
              onExportCSV={() => exportCostData('csv')}
              onExportJSON={() => exportCostData('json')}
              isExporting={isExporting}
              label="Export"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Today's Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalDailySpend.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Across all services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Hourly Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalHourlySpend.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Current hour</p>
            </CardContent>
          </Card>

          <Card className={trippedCount > 0 ? "border-destructive" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Circuit Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {trippedCount > 0 ? (
                  <span className="text-destructive">{trippedCount} Tripped</span>
                ) : (
                  <span className="text-green-600">All OK</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {circuitBreakers?.length || 0} services monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Bots Blocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {honeypotDetections?.filter((d) => d.blocked).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="breakers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="breakers">Circuit Breakers</TabsTrigger>
            <TabsTrigger value="costs">Cost Trends</TabsTrigger>
            <TabsTrigger value="detections">Bot Detections</TabsTrigger>
          </TabsList>

          {/* Circuit Breakers Tab */}
          <TabsContent value="breakers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {circuitBreakers?.map((breaker) => {
                const Icon = serviceIcons[breaker.service_name] || Shield;
                const dailyPercent = (breaker.current_daily_spend / breaker.daily_limit) * 100;
                const hourlyPercent = (breaker.current_hourly_spend / breaker.hourly_limit) * 100;

                return (
                  <Card
                    key={breaker.id}
                    className={breaker.tripped ? "border-destructive bg-destructive/5" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          {breaker.service_name.replace("_", " ").toUpperCase()}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {breaker.tripped && (
                            <Badge variant="destructive" className="text-xs">
                              TRIPPED
                            </Badge>
                          )}
                          <Switch
                            checked={breaker.enabled}
                            onCheckedChange={(enabled) =>
                              toggleBreaker.mutate({ id: breaker.id, enabled })
                            }
                          />
                        </div>
                      </div>
                      {breaker.trip_reason && (
                        <CardDescription className="text-destructive">
                          {breaker.trip_reason}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Daily Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Daily</span>
                          <span>
                            ${breaker.current_daily_spend.toFixed(2)} / $
                            {breaker.daily_limit.toFixed(2)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(dailyPercent, 100)}
                          className={dailyPercent > 80 ? "[&>div]:bg-destructive" : ""}
                        />
                      </div>

                      {/* Hourly Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hourly</span>
                          <span>
                            ${breaker.current_hourly_spend.toFixed(2)} / $
                            {breaker.hourly_limit.toFixed(2)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(hourlyPercent, 100)}
                          className={hourlyPercent > 80 ? "[&>div]:bg-destructive" : ""}
                        />
                      </div>

                      {/* Actions */}
                      {breaker.tripped && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetBreaker.mutate(breaker.id)}
                          className="w-full"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Circuit Breaker
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Cost Trends Tab */}
          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cost Trends</CardTitle>
                  <div className="flex gap-2">
                    {(["7", "14", "30"] as const).map((period) => (
                      <Button
                        key={period}
                        size="sm"
                        variant={selectedPeriod === period ? "default" : "outline"}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period}d
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(4)}`, ""]}
                      />
                      <Legend />
                      <Bar
                        dataKey="ai_chat"
                        name="AI Chat"
                        fill={serviceColors.ai_chat}
                        stackId="stack"
                      />
                      <Bar
                        dataKey="confirmation_call"
                        name="Calls"
                        fill={serviceColors.confirmation_call}
                        stackId="stack"
                      />
                      <Bar
                        dataKey="sms"
                        name="SMS"
                        fill={serviceColors.sms}
                        stackId="stack"
                      />
                      <Bar
                        dataKey="email"
                        name="Email"
                        fill={serviceColors.email}
                        stackId="stack"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bot Detections Tab */}
          <TabsContent value="detections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bot Detections</CardTitle>
                <CardDescription>
                  Honeypot triggers and suspicious activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {honeypotDetections?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No bot detections recorded
                    </p>
                  ) : (
                    honeypotDetections?.map((detection) => (
                      <div
                        key={detection.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              detection.blocked ? "text-destructive" : "text-amber-500"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {detection.detection_type.replace("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {detection.page} • {detection.ip_hash.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={detection.blocked ? "destructive" : "secondary"}>
                            {detection.blocked ? "Blocked" : "Logged"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(detection.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
