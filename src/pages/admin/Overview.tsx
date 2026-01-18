import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from '@/components/admin/StatsCard';
import LaunchReadinessTracker from '@/components/admin/LaunchReadinessTracker';
import E2ETestChecklist from '@/components/admin/E2ETestChecklist';
import LaunchAlerts from '@/components/admin/LaunchAlerts';
import QuickReferenceCard from '@/components/admin/QuickReferenceCard';
import { Users, Phone, Calendar, DollarSign, MessageSquare, TrendingUp, BarChart3, Loader2, Download, Copy, Check, Rocket, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useDocumentationGenerator } from '@/hooks/useDocumentationGenerator';
import { useState } from 'react';
import { toast } from 'sonner';

// Chart configuration for chat activity
const chatChartConfig = {
  chats: {
    label: "Chats",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

// Helper function to get last 7 days of chat data
const getLast7DaysChats = (conversations: Array<{ created_at: string }> | null | undefined) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    const count = conversations?.filter(c => {
      const chatDate = new Date(c.created_at);
      return chatDate.toDateString() === date.toDateString();
    }).length || 0;
    
    days.push({ date: dateStr, chats: count });
  }
  return days;
};

const Overview = () => {
  const { generatePDF, isGenerating } = usePDFExport();
  const { generateMarkdownReport } = useDocumentationGenerator();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'launch'>('standard');
  const [showE2E, setShowE2E] = useState(false);

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdownReport();
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success('Markdown report copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  // Fetch leads data
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['admin-leads-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch appointments data
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch conversations data
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['admin-conversations-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch chat messages data for analytics
  const { data: chatMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-chat-messages-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, conversation_id, role, created_at');
      if (error) throw error;
      return data;
    },
  });

  const isLoading = leadsLoading || appointmentsLoading || conversationsLoading || messagesLoading;

  // Calculate stats
  const totalLeads = leads?.length || 0;
  const newLeadsToday = leads?.filter(lead => {
    const today = new Date();
    const leadDate = new Date(lead.created_at);
    return leadDate.toDateString() === today.toDateString();
  }).length || 0;

  const totalCalls = leads?.filter(lead => lead.confirmation_call_status !== 'pending').length || 0;
  const completedCalls = leads?.filter(lead => lead.confirmation_call_status === 'completed').length || 0;

  const upcomingAppointments = appointments?.filter(apt => apt.status === 'scheduled').length || 0;
  const totalConversations = conversations?.length || 0;

  const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.estimated_quote || 0), 0) || 0;

  const recentLeads = leads?.slice(0, 5) || [];

  // Chat Analytics Calculations
  const totalChats = conversations?.length || 0;
  const chatsToday = conversations?.filter(c => {
    const today = new Date();
    const chatDate = new Date(c.created_at);
    return chatDate.toDateString() === today.toDateString();
  }).length || 0;

  const chatsWithQuotes = conversations?.filter(c => c.lead_id !== null).length || 0;
  const quoteConversionRate = totalChats > 0 
    ? Math.round((chatsWithQuotes / totalChats) * 100) 
    : 0;

  const userMessages = chatMessages?.filter(m => m.role === 'user').length || 0;
  const avgMessagesPerSession = totalChats > 0 
    ? (userMessages / totalChats).toFixed(1) 
    : '0';

  const chatsByDay = getLast7DaysChats(conversations);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400',
      contacted: 'bg-yellow-500/20 text-yellow-400',
      booked: 'bg-green-500/20 text-green-400',
      completed: 'bg-primary/20 text-primary',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'standard' | 'launch')}>
            <TabsList className="h-8">
              <TabsTrigger value="standard" className="text-xs px-3">Standard</TabsTrigger>
              <TabsTrigger value="launch" className="text-xs px-3 gap-1">
                <Rocket className="h-3 w-3" />
                Launch Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyMarkdown}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Report
              </>
            )}
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            variant="default"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Launch Mode View */}
      {viewMode === 'launch' && (
        <div className="space-y-6">
          {/* Launch Alerts - Real-time monitoring */}
          <LaunchAlerts />
          
          {/* E2E Test Checklist - Collapsible */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setShowE2E(!showE2E)}
            >
              <span className="font-semibold">E2E Verification Checklist</span>
              {showE2E ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            {showE2E && <E2ETestChecklist />}
          </div>

          {/* Quick Reference */}
          <QuickReferenceCard />
        </div>
      )}

      {/* Standard View - Stats Grid */}
      {viewMode === 'standard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Leads"
              value={totalLeads}
              icon={Users}
              trend={{ value: newLeadsToday, isPositive: true }}
            />
            <StatsCard
              title="Calls Made"
              value={`${completedCalls}/${totalCalls}`}
              icon={Phone}
            />
            <StatsCard
              title="Conversations"
              value={totalConversations}
              icon={MessageSquare}
            />
            <StatsCard
              title="Total Quotes"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Upcoming Appointments"
              value={upcomingAppointments}
              icon={Calendar}
            />
            <StatsCard
              title="Conversion Rate"
              value={totalLeads > 0 ? `${Math.round((appointments?.length || 0) / totalLeads * 100)}%` : '0%'}
              icon={TrendingUp}
            />
          </div>

          {/* Chat Analytics Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Chat Analytics
            </h2>
            
            {/* Chat Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Chats"
                value={totalChats}
                icon={MessageSquare}
                trend={chatsToday > 0 ? { value: chatsToday, isPositive: true } : undefined}
              />
              <StatsCard
                title="Quote Conversion"
                value={`${quoteConversionRate}%`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Avg Messages/Chat"
                value={avgMessagesPerSession}
                icon={MessageSquare}
              />
              <StatsCard
                title="Chats → Quotes"
                value={chatsWithQuotes}
                icon={DollarSign}
              />
            </div>
            
            {/* Chats Over Time Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Chat Activity (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chatChartConfig} className="h-[200px] w-full">
                  <AreaChart data={chatsByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="chats" 
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Launch Readiness Tracker */}
          <LaunchReadinessTracker />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No leads yet</p>
                  ) : (
                    recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div>
                          <p className="font-medium text-foreground">{lead.full_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Call Activity */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads?.filter(l => l.confirmation_call_status !== 'pending').slice(0, 5).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No calls made yet</p>
                  ) : (
                    leads?.filter(l => l.confirmation_call_status !== 'pending').slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div>
                          <p className="font-medium text-foreground">{lead.full_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            lead.confirmation_call_status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : lead.confirmation_call_status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }>
                            {lead.confirmation_call_status}
                          </Badge>
                          {lead.confirmation_call_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(lead.confirmation_call_time), 'MMM d, h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
