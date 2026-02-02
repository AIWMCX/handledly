import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  Globe, 
  Key, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink,
  Copy,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const QuickReferenceCard = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const quickLinks = [
    { label: 'Admin Dashboard', url: '/admin', icon: Globe },
    { label: 'Client Portal', url: '/client-portal', icon: ExternalLink },
  ];

  const contacts = [
    { label: 'Technical Support', value: 'support@lovable.dev', type: 'email' },
    { label: 'Business Phone', value: '(878) 218-7397', type: 'phone' },
  ];

  const credentials = [
    { label: 'Client Portal Code', value: 'HANDLEDLY2024', sensitive: true },
  ];

  const troubleshooting = [
    { issue: 'Email not sending', solution: 'Check Resend API key in secrets' },
    { issue: 'Voice call fails', solution: 'Verify ElevenLabs webhook is configured' },
    { issue: 'Lead not saving', solution: 'Check rate limit (5/hour max)' },
    { issue: 'Chat not responding', solution: 'Verify LOVABLE_API_KEY is set' },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm print:shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Quick Reference Card
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Links
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map(link => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Key Contacts */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Key Contacts
          </h4>
          <div className="space-y-2">
            {contacts.map(contact => (
              <div 
                key={contact.label}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  {contact.type === 'email' ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">{contact.label}:</span>
                  <span className="text-sm font-medium">{contact.value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contact.value, contact.label)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Access Credentials */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Access Credentials
          </h4>
          <div className="space-y-2">
            {credentials.map(cred => (
              <div 
                key={cred.label}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{cred.label}:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {cred.value}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(cred.value, cred.label)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Common Troubleshooting */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Common Troubleshooting
          </h4>
          <div className="space-y-2">
            {troubleshooting.map((item, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.issue}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Emergency Support</p>
              <p className="text-sm text-muted-foreground">
                For critical issues, contact support@lovable.dev
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickReferenceCard;
