import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Database,
  Webhook,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface TestItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: 'quote_flow' | 'notifications' | 'ai_systems' | 'data_integrity';
  status: 'pending' | 'running' | 'passed' | 'failed';
  lastTested?: string;
}

const initialTests: TestItem[] = [
  // Quote Flow
  {
    id: 'quote_form_local',
    label: 'Quote Form - Local Moving',
    description: 'Submit a quote for local moving service',
    icon: FileText,
    category: 'quote_flow',
    status: 'pending',
  },
  {
    id: 'quote_form_longdist',
    label: 'Quote Form - Long Distance',
    description: 'Submit a quote for long distance moving',
    icon: FileText,
    category: 'quote_flow',
    status: 'pending',
  },
  {
    id: 'quote_form_specialty',
    label: 'Quote Form - Specialty Items',
    description: 'Submit a quote with piano/safe/pool table',
    icon: FileText,
    category: 'quote_flow',
    status: 'pending',
  },
  // Notifications
  {
    id: 'email_delivery',
    label: 'Email Confirmation',
    description: 'Verify quote email arrives in inbox',
    icon: Mail,
    category: 'notifications',
    status: 'pending',
  },
  {
    id: 'sms_notification',
    label: 'SMS Admin Alert',
    description: 'Confirm admin receives SMS for new lead',
    icon: Bell,
    category: 'notifications',
    status: 'pending',
  },
  // AI Systems
  {
    id: 'ai_chat',
    label: 'AI Chat Widget',
    description: 'Test chat conversation and quote collection',
    icon: MessageSquare,
    category: 'ai_systems',
    status: 'pending',
  },
  {
    id: 'voice_call_init',
    label: 'Voice Call Initiation',
    description: 'Verify AI call triggers after quote',
    icon: Phone,
    category: 'ai_systems',
    status: 'pending',
  },
  {
    id: 'webhook_capture',
    label: 'Webhook Status Capture',
    description: 'Confirm call status saves to database',
    icon: Webhook,
    category: 'ai_systems',
    status: 'pending',
  },
  // Data Integrity
  {
    id: 'lead_creation',
    label: 'Lead Record Created',
    description: 'Verify lead appears in admin dashboard',
    icon: Database,
    category: 'data_integrity',
    status: 'pending',
  },
  {
    id: 'quote_calculation',
    label: 'Quote Calculation Accuracy',
    description: 'Confirm pricing matches expected formula',
    icon: Database,
    category: 'data_integrity',
    status: 'pending',
  },
];

const E2ETestChecklist = () => {
  const [tests, setTests] = useState<TestItem[]>(initialTests);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const getCategoryLabel = (category: TestItem['category']) => {
    const labels = {
      quote_flow: 'Quote Flow',
      notifications: 'Notifications',
      ai_systems: 'AI Systems',
      data_integrity: 'Data Integrity',
    };
    return labels[category];
  };

  const getCategoryColor = (category: TestItem['category']) => {
    const colors = {
      quote_flow: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      notifications: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ai_systems: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      data_integrity: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[category];
  };

  const getStatusIcon = (status: TestItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const toggleTestStatus = (id: string) => {
    setTests(prev => prev.map(test => {
      if (test.id === id) {
        const newStatus = test.status === 'passed' ? 'pending' : 'passed';
        return { 
          ...test, 
          status: newStatus,
          lastTested: newStatus === 'passed' ? new Date().toISOString() : undefined
        };
      }
      return test;
    }));
  };

  const markAsFailed = (id: string) => {
    setTests(prev => prev.map(test => {
      if (test.id === id) {
        return { 
          ...test, 
          status: 'failed',
          lastTested: new Date().toISOString()
        };
      }
      return test;
    }));
  };

  const resetAllTests = () => {
    setTests(initialTests);
    toast.info('All tests reset to pending');
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const totalCount = tests.length;
  const progressPercent = Math.round((passedCount / totalCount) * 100);

  const categories = ['quote_flow', 'notifications', 'ai_systems', 'data_integrity'] as const;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              End-to-End Test Checklist
            </CardTitle>
            <CardDescription>
              Verify all systems before launch (Jan 26-30)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              {passedCount} Passed
            </Badge>
            {failedCount > 0 && (
              <Badge variant="outline" className="text-red-400 border-red-500/30">
                {failedCount} Failed
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetAllTests}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Test Progress</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <Badge className={`${getCategoryColor(category)} border`}>
              {getCategoryLabel(category)}
            </Badge>
            
            <div className="space-y-2 pl-2">
              {tests
                .filter(test => test.category === category)
                .map(test => {
                  const Icon = test.icon;
                  return (
                    <div 
                      key={test.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        test.status === 'passed' 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : test.status === 'failed'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-background/50 border-border/50 hover:border-border'
                      }`}
                    >
                      <Checkbox
                        checked={test.status === 'passed'}
                        onCheckedChange={() => toggleTestStatus(test.id)}
                        className="mt-1"
                      />
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          test.status === 'passed' ? 'text-green-400' : 
                          test.status === 'failed' ? 'text-red-400' : 
                          'text-foreground'
                        }`}>
                          {test.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {test.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.status !== 'failed' && test.status !== 'passed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsFailed(test.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {getStatusIcon(test.status)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Summary Box */}
        {passedCount === totalCount && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-400">All Tests Passed!</p>
                <p className="text-sm text-muted-foreground">
                  Platform is ready for launch on January 26-30
                </p>
              </div>
            </div>
          </div>
        )}

        {failedCount > 0 && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-red-400">{failedCount} Test(s) Failed</p>
                <p className="text-sm text-muted-foreground">
                  Resolve issues before proceeding to launch
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default E2ETestChecklist;
