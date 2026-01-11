import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from '@/components/admin/StatsCard';
import { Users, Phone, Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const Overview = () => {
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

  const isLoading = leadsLoading || appointmentsLoading || conversationsLoading;

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
      <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>

      {/* Stats Grid */}
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
    </div>
  );
};

export default Overview;
