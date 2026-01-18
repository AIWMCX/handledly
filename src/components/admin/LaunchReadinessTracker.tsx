import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, AlertTriangle, Rocket } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  category: 'development' | 'client' | 'launch';
  description?: string;
}

const checklistItems: ChecklistItem[] = [
  // Development Items (Completed)
  { id: 'frontend', label: 'Frontend Development (24 Routes)', status: 'completed', category: 'development' },
  { id: 'backend', label: 'Backend Infrastructure (8 Tables)', status: 'completed', category: 'development' },
  { id: 'ai-chat', label: 'AI Chat Integration', status: 'completed', category: 'development' },
  { id: 'voice-agent', label: 'ElevenLabs Voice Agent', status: 'completed', category: 'development' },
  { id: 'email-automation', label: 'Email Automation (Resend)', status: 'completed', category: 'development' },
  { id: 'sms-notifications', label: 'SMS Notifications (Twilio)', status: 'completed', category: 'development' },
  { id: 'quote-engine', label: 'Quote Calculator Engine', status: 'completed', category: 'development' },
  { id: 'admin-dashboard', label: 'Admin Dashboard (7 Panels)', status: 'completed', category: 'development' },
  { id: 'rls-security', label: 'RLS Security Policies', status: 'completed', category: 'development' },
  { id: 'rate-limiting', label: 'Rate Limiting System', status: 'completed', category: 'development' },
  { id: 'seo', label: 'SEO & Meta Tags', status: 'completed', category: 'development' },
  { id: 'ga4', label: 'Google Analytics 4', status: 'completed', category: 'development' },
  
  // Client Action Items (Pending)
  { id: 'google-ads', label: 'Google Ads Conversion ID', status: 'pending', category: 'client', description: 'Provide ID for conversion tracking' },
  { id: 'facebook-pixel', label: 'Facebook Pixel ID', status: 'pending', category: 'client', description: 'Provide ID for retargeting' },
  { id: 'elevenlabs-webhook', label: 'ElevenLabs Webhook Config', status: 'pending', category: 'client', description: 'Configure in ElevenLabs dashboard' },
  
  // Launch Items
  { id: 'dns-config', label: 'DNS Configuration', status: 'pending', category: 'launch' },
  { id: 'e2e-testing', label: 'End-to-End Testing', status: 'pending', category: 'launch' },
  { id: 'go-live', label: 'Production Deployment', status: 'pending', category: 'launch' },
];

const getStatusIcon = (status: ChecklistItem['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    case 'blocked':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: ChecklistItem['status']) => {
  const variants: Record<ChecklistItem['status'], string> = {
    completed: 'bg-green-500/20 text-green-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    pending: 'bg-muted text-muted-foreground',
    blocked: 'bg-red-500/20 text-red-400',
  };
  return variants[status];
};

const getCategoryLabel = (category: ChecklistItem['category']) => {
  const labels: Record<ChecklistItem['category'], string> = {
    development: 'Dev',
    client: 'Client',
    launch: 'Launch',
  };
  return labels[category];
};

const getCategoryColor = (category: ChecklistItem['category']) => {
  const colors: Record<ChecklistItem['category'], string> = {
    development: 'bg-blue-500/20 text-blue-400',
    client: 'bg-purple-500/20 text-purple-400',
    launch: 'bg-accent/20 text-accent',
  };
  return colors[category];
};

const LaunchReadinessTracker = () => {
  const completedCount = checklistItems.filter(item => item.status === 'completed').length;
  const totalCount = checklistItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const developmentItems = checklistItems.filter(item => item.category === 'development');
  const clientItems = checklistItems.filter(item => item.category === 'client');
  const launchItems = checklistItems.filter(item => item.category === 'launch');

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Launch Readiness
          </CardTitle>
          <Badge className="bg-accent/20 text-accent text-lg px-3 py-1">
            {completionPercentage}%
          </Badge>
        </div>
        <Progress value={completionPercentage} className="h-2 mt-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {completedCount} of {totalCount} items completed
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Development Section */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Development ({developmentItems.filter(i => i.status === 'completed').length}/{developmentItems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {developmentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background/50 text-sm"
              >
                {getStatusIcon(item.status)}
                <span className={item.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Action Items */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Client Actions ({clientItems.filter(i => i.status === 'completed').length}/{clientItems.length})
          </h4>
          <div className="space-y-2">
            {clientItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <div>
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusBadge(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Items */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Launch Steps ({launchItems.filter(i => i.status === 'completed').length}/{launchItems.length})
          </h4>
          <div className="space-y-2">
            {launchItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge className={getStatusBadge(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchReadinessTracker;
