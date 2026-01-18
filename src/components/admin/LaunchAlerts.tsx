import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare,
  RefreshCw,
  Bell,
  Activity
} from 'lucide-react';
import { format, subHours, isWithinInterval } from 'date-fns';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  category: 'email' | 'voice' | 'chat' | 'database' | 'rate_limit';
  title: string;
  description: string;
  timestamp: Date;
  count?: number;
}

const LaunchAlerts = () => {
  // Fetch recent leads to analyze for issues
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['launch-alerts-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', subHours(new Date(), 24).toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch rate limit data
  const { data: rateLimits, isLoading: rateLimitsLoading } = useQuery({
    queryKey: ['launch-alerts-rate-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_tracker')
        .select('*')
        .gte('created_at', subHours(new Date(), 1).toISOString());
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['launch-alerts-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .gte('created_at', subHours(new Date(), 24).toISOString());
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const isLoading = leadsLoading || rateLimitsLoading || conversationsLoading;

  // Analyze data for alerts
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    // Check email failures
    const emailFailed = leads?.filter(l => l.email_sent === false && l.created_at) || [];
    if (emailFailed.length > 0) {
      alerts.push({
        id: 'email-failed',
        type: 'error',
        category: 'email',
        title: 'Email Delivery Issues',
        description: `${emailFailed.length} emails failed to send in the last 24 hours`,
        timestamp: new Date(emailFailed[0]?.created_at || now),
        count: emailFailed.length,
      });
    }

    // Check voice call failures
    const callsFailed = leads?.filter(l => 
      l.confirmation_call_status === 'failed' || 
      l.confirmation_call_status === 'no-answer'
    ) || [];
    if (callsFailed.length > 0) {
      alerts.push({
        id: 'call-failed',
        type: 'warning',
        category: 'voice',
        title: 'Voice Call Issues',
        description: `${callsFailed.length} confirmation calls failed or went unanswered`,
        timestamp: new Date(callsFailed[0]?.created_at || now),
        count: callsFailed.length,
      });
    }

    // Check rate limit triggers
    const rateLimitHits = rateLimits?.length || 0;
    if (rateLimitHits > 10) {
      alerts.push({
        id: 'rate-limit',
        type: 'warning',
        category: 'rate_limit',
        title: 'High Rate Limit Activity',
        description: `${rateLimitHits} rate limit events in the last hour`,
        timestamp: now,
        count: rateLimitHits,
      });
    }

    // Check for pending calls (webhook not received)
    const pendingCalls = leads?.filter(l => 
      l.confirmation_call_status === 'pending' && 
      l.created_at &&
      isWithinInterval(new Date(l.created_at), {
        start: subHours(now, 24),
        end: subHours(now, 1), // More than 1 hour old but within 24 hours
      })
    ) || [];
    if (pendingCalls.length > 0) {
      alerts.push({
        id: 'pending-calls',
        type: 'info',
        category: 'voice',
        title: 'Pending Call Status',
        description: `${pendingCalls.length} calls awaiting webhook confirmation`,
        timestamp: new Date(pendingCalls[0]?.created_at || now),
        count: pendingCalls.length,
      });
    }

    // Success metrics
    const successfulEmails = leads?.filter(l => l.email_sent === true).length || 0;
    const successfulCalls = leads?.filter(l => l.confirmation_call_status === 'completed').length || 0;
    const totalLeads = leads?.length || 0;

    if (totalLeads > 0 && successfulEmails === totalLeads) {
      alerts.push({
        id: 'email-success',
        type: 'success',
        category: 'email',
        title: 'Email System Healthy',
        description: `All ${successfulEmails} emails delivered successfully`,
        timestamp: now,
      });
    }

    if (successfulCalls > 0) {
      alerts.push({
        id: 'calls-success',
        type: 'success',
        category: 'voice',
        title: 'Voice Calls Active',
        description: `${successfulCalls} confirmation calls completed`,
        timestamp: now,
      });
    }

    // Chat activity
    const chatCount = conversations?.length || 0;
    if (chatCount > 0) {
      alerts.push({
        id: 'chat-activity',
        type: 'info',
        category: 'chat',
        title: 'Chat Activity',
        description: `${chatCount} conversations in the last 24 hours`,
        timestamp: now,
        count: chatCount,
      });
    }

    return alerts.sort((a, b) => {
      // Sort by type priority: error > warning > info > success
      const priority = { error: 0, warning: 1, info: 2, success: 3 };
      return priority[a.type] - priority[b.type];
    });
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: Alert['category']) => {
    switch (category) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const errorCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const handleRefresh = () => {
    refetchLeads();
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Launch Day Alerts
            </CardTitle>
            <CardDescription>
              Real-time system health monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} Errors</Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {warningCount} Warnings
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-400">All Systems Operational</p>
            <p className="text-sm text-muted-foreground">No issues detected</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{alert.title}</p>
                    <Badge variant="outline" className="text-xs gap-1">
                      {getCategoryIcon(alert.category)}
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                <div className="text-right">
                  {alert.count && (
                    <Badge variant="secondary" className="text-xs">
                      {alert.count}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {format(alert.timestamp, 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-2xl font-bold text-foreground">{leads?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Leads (24h)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-2xl font-bold text-foreground">{conversations?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Chats (24h)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-2xl font-bold text-foreground">
              {leads?.filter(l => l.email_sent).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Emails Sent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchAlerts;
