import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Rocket, 
  FileText, 
  Users, 
  DollarSign, 
  MessageSquare,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { usePDFExport } from '@/hooks/usePDFExport';

const CLIENT_ACCESS_CODE = 'HANDLEDLY2024'; // Simple access code

const ClientPortal = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const { generatePDF, isGenerating } = usePDFExport();

  // Fetch live metrics
  const { data: leads } = useQuery({
    queryKey: ['client-portal-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: quotes } = useQuery({
    queryKey: ['client-portal-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quote_requests').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: conversations } = useQuery({
    queryKey: ['client-portal-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('chat_conversations').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === CLIENT_ACCESS_CODE) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid access code. Please contact your project manager.');
    }
  };

  // Checklist items
  const deliverables = [
    { label: 'Frontend Development (24 Routes)', completed: true },
    { label: 'Backend Infrastructure (8 Tables)', completed: true },
    { label: 'AI Chat Integration', completed: true },
    { label: 'Voice Agent (ElevenLabs)', completed: true },
    { label: 'Email Automation (Resend)', completed: true },
    { label: 'SMS Notifications (Twilio)', completed: true },
    { label: 'Quote Calculator Engine', completed: true },
    { label: 'Admin Dashboard', completed: true },
    { label: 'Security (RLS Policies)', completed: true },
    { label: 'Analytics (GA4)', completed: true },
    { label: 'SEO Optimization', completed: true },
    { label: 'PDF Export System', completed: true },
  ];

  const clientActions = [
    { label: 'Provide Google Ads Conversion ID', completed: false },
    { label: 'Provide Facebook Pixel ID', completed: false },
    { label: 'Configure ElevenLabs Webhook', completed: false },
    { label: 'Approve DNS Configuration', completed: false },
    { label: 'Schedule E2E Testing', completed: false },
  ];

  const completedDeliverables = deliverables.filter(d => d.completed).length;
  const completedActions = clientActions.filter(a => a.completed).length;
  const overallProgress = Math.round(
    ((completedDeliverables + completedActions) / (deliverables.length + clientActions.length)) * 100
  );

  const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.estimated_quote || 0), 0) || 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your access code to view project status
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-lg tracking-widest"
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Access Portal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Handledly Project Portal</h1>
              <p className="text-muted-foreground">Real-time project status & deliverables</p>
            </div>
            <Button onClick={generatePDF} disabled={isGenerating}>
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Overall Progress */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-accent" />
                Launch Readiness
              </CardTitle>
              <Badge className="bg-accent/20 text-accent text-xl px-4 py-2">
                {overallProgress}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedDeliverables + completedActions} of {deliverables.length + clientActions.length} items completed
            </p>
          </CardContent>
        </Card>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold text-foreground">{leads?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Value</p>
                  <p className="text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Conversations</p>
                  <p className="text-3xl font-bold text-foreground">{conversations?.length || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Requests</p>
                  <p className="text-3xl font-bold text-foreground">{quotes?.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deliverables Completed */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Deliverables Completed</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {completedDeliverables}/{deliverables.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliverables.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background/50"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Action Items */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Action Items</span>
                <Badge className="bg-accent/20 text-accent">
                  {completedActions}/{clientActions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientActions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-accent flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Summary */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Investment</p>
                <p className="text-4xl font-bold text-foreground">$9,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Value</p>
                <p className="text-4xl font-bold text-green-500">$22,000+</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Savings</p>
                <p className="text-4xl font-bold text-accent">54%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Schedule Call
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Book Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Confidential Client Portal • AI With Mitch Consulting</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;
