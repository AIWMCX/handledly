import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Calendar,
  ChevronDown,
  Copy,
  ExternalLink,
  Webhook,
  Undo2
} from 'lucide-react';
import { usePDFExport } from '@/hooks/usePDFExport';
import { toast } from 'sonner';

const ELEVENLABS_WEBHOOK_URL = 'https://spguevrimwpqygvcxrsk.functions.supabase.co/handle-call-status';

const CLIENT_ACCESS_CODE = 'HANDLEDLY2024'; // Simple access code

const ClientPortal = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [webhookOpen, setWebhookOpen] = useState(false);
  const { generatePDF, isGenerating } = usePDFExport();

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(ELEVENLABS_WEBHOOK_URL);
    toast.success('Webhook URL copied to clipboard!');
  };

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

  const defaultClientActions = [
    { id: 'google-ads', label: 'Provide Google Ads Conversion ID', completed: false },
    { id: 'facebook-pixel', label: 'Provide Facebook Pixel ID', completed: false },
    { id: 'elevenlabs-webhook', label: 'Configure ElevenLabs Webhook', completed: false },
    { id: 'dns-config', label: 'Approve DNS Configuration', completed: false },
    { id: 'e2e-testing', label: 'Schedule E2E Testing', completed: false },
  ];

  const [clientActionsState, setClientActionsState] = useState(() => {
    const saved = localStorage.getItem('handledly-client-actions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultClientActions;
      }
    }
    return defaultClientActions;
  });

  const toggleActionComplete = (id: string) => {
    setClientActionsState((prev: typeof defaultClientActions) => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem('handledly-client-actions', JSON.stringify(updated));
      return updated;
    });
  };

  // Celebration effect when all items complete
  useEffect(() => {
    const allComplete = clientActionsState.every((item: typeof defaultClientActions[0]) => item.completed);
    if (allComplete && clientActionsState.length > 0) {
      toast.success('🚀 All action items completed! Ready for launch!', {
        duration: 5000,
      });
    }
  }, [clientActionsState]);

  const completedDeliverables = deliverables.filter(d => d.completed).length;
  const completedActions = clientActionsState.filter((a: typeof defaultClientActions[0]) => a.completed).length;
  const overallProgress = Math.round(
    ((completedDeliverables + completedActions) / (deliverables.length + clientActionsState.length)) * 100
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
              {completedDeliverables + completedActions} of {deliverables.length + clientActionsState.length} items completed
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
                  {completedActions}/{clientActionsState.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientActionsState.map((item: { id: string; label: string; completed: boolean }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-accent flex-shrink-0" />
                      )}
                      <span className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                    <Button
                      variant={item.completed ? "ghost" : "default"}
                      size="sm"
                      onClick={() => toggleActionComplete(item.id)}
                      className={item.completed ? "text-muted-foreground hover:text-foreground" : ""}
                    >
                      {item.completed ? (
                        <>
                          <Undo2 className="h-4 w-4 mr-1" />
                          Undo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ElevenLabs Webhook Configuration Instructions */}
        <Collapsible open={webhookOpen} onOpenChange={setWebhookOpen}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-l-4 border-l-yellow-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-background/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Webhook className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Configure ElevenLabs Webhook</CardTitle>
                      <p className="text-sm text-muted-foreground">Required to capture voice call status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-500">Action Required</Badge>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${webhookOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Webhook URL Box */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-background border border-border font-mono text-sm break-all">
                      {ELEVENLABS_WEBHOOK_URL}
                    </div>
                    <Button onClick={copyWebhookUrl} variant="outline" size="icon" className="flex-shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Setup Instructions</h4>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: 'Log into ElevenLabs Dashboard', desc: 'Go to elevenlabs.io and sign in to your account' },
                      { step: 2, title: 'Navigate to Agents', desc: 'Click on "Conversational AI" in the left sidebar' },
                      { step: 3, title: 'Select Your Agent', desc: 'Choose the Handledly Voice Agent from your agents list' },
                      { step: 4, title: 'Open Agent Settings', desc: 'Click the "Settings" or gear icon for your agent' },
                      { step: 5, title: 'Find Webhook Configuration', desc: 'Scroll to the "Post-call Webhooks" or "Webhook URL" section' },
                      { step: 6, title: 'Paste Webhook URL', desc: 'Copy the URL above and paste it into the webhook field' },
                      { step: 7, title: 'Save Changes', desc: 'Click "Save" to apply the configuration' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3 p-3 rounded-lg bg-background/50">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Link */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <p className="font-medium text-foreground">Need help with this step?</p>
                    <p className="text-sm text-muted-foreground">Contact our support team for assistance</p>
                  </div>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://elevenlabs.io/docs" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      ElevenLabs Docs
                    </a>
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
