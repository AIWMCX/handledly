import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface ProjectMetrics {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsThisWeek: number;
  totalQuotes: number;
  totalQuoteValue: number;
  totalConversations: number;
  conversationsToday: number;
  completedCalls: number;
  conversionRate: number;
  upcomingAppointments: number;
}

export interface DevelopmentHours {
  category: string;
  hours: number;
  rate: number;
  total: number;
}

export interface DocumentationData {
  projectName: string;
  clientName: string;
  generatedDate: string;
  generatedTime: string;
  metrics: ProjectMetrics;
  developmentHours: DevelopmentHours[];
  totalHours: number;
  totalValue: number;
  clientInvestment: number;
  savingsPercentage: number;
}

// Estimated development hours by category
const developmentHoursBreakdown: DevelopmentHours[] = [
  { category: 'Frontend Development (React/TypeScript)', hours: 45, rate: 150, total: 6750 },
  { category: 'UI/UX Design & Components', hours: 20, rate: 125, total: 2500 },
  { category: 'Backend & Database Architecture', hours: 25, rate: 175, total: 4375 },
  { category: 'AI Integration (Chat + Voice)', hours: 18, rate: 200, total: 3600 },
  { category: 'Email/SMS Automation', hours: 10, rate: 150, total: 1500 },
  { category: 'Security & RLS Policies', hours: 12, rate: 175, total: 2100 },
  { category: 'Analytics & Tracking', hours: 8, rate: 125, total: 1000 },
  { category: 'Testing & QA', hours: 10, rate: 100, total: 1000 },
  { category: 'Documentation & Handoff', hours: 5, rate: 100, total: 500 },
];

export const useDocumentationGenerator = () => {
  // Fetch all required data
  const { data: leads } = useQuery({
    queryKey: ['doc-gen-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes } = useQuery({
    queryKey: ['doc-gen-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quote_requests').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: conversations } = useQuery({
    queryKey: ['doc-gen-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('chat_conversations').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['doc-gen-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments').select('*');
      if (error) throw error;
      return data;
    },
  });

  const generateDocumentation = (): DocumentationData => {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate metrics
    const totalLeads = leads?.length || 0;
    const newLeadsToday = leads?.filter(l => new Date(l.created_at).toDateString() === today).length || 0;
    const newLeadsThisWeek = leads?.filter(l => new Date(l.created_at) >= weekAgo).length || 0;
    
    const totalQuotes = quotes?.length || 0;
    const totalQuoteValue = leads?.reduce((sum, l) => sum + (l.estimated_quote || 0), 0) || 0;
    
    const totalConversations = conversations?.length || 0;
    const conversationsToday = conversations?.filter(c => new Date(c.created_at).toDateString() === today).length || 0;
    
    const completedCalls = leads?.filter(l => l.confirmation_call_status === 'completed').length || 0;
    
    const upcomingAppointments = appointments?.filter(a => a.status === 'scheduled').length || 0;
    
    const conversionRate = totalLeads > 0 
      ? Math.round((upcomingAppointments / totalLeads) * 100) 
      : 0;

    // Calculate totals
    const totalHours = developmentHoursBreakdown.reduce((sum, d) => sum + d.hours, 0);
    const totalValue = developmentHoursBreakdown.reduce((sum, d) => sum + d.total, 0);
    const clientInvestment = 9000;
    const savingsPercentage = Math.round(((totalValue - clientInvestment) / totalValue) * 100);

    return {
      projectName: 'Handledly Moving Services',
      clientName: 'Client',
      generatedDate: format(now, 'MMMM d, yyyy'),
      generatedTime: format(now, 'h:mm a'),
      metrics: {
        totalLeads,
        newLeadsToday,
        newLeadsThisWeek,
        totalQuotes,
        totalQuoteValue,
        totalConversations,
        conversationsToday,
        completedCalls,
        conversionRate,
        upcomingAppointments,
      },
      developmentHours: developmentHoursBreakdown,
      totalHours,
      totalValue,
      clientInvestment,
      savingsPercentage,
    };
  };

  const generateMarkdownReport = (): string => {
    const data = generateDocumentation();
    
    return `
# ${data.projectName}
## Project Deliverables Report

**Generated:** ${data.generatedDate} at ${data.generatedTime}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Your Investment | $${data.clientInvestment.toLocaleString()} |
| Market Value | $${data.totalValue.toLocaleString()} |
| Your Savings | ${data.savingsPercentage}% |
| Total Dev Hours | ${data.totalHours} hours |

---

## Live Platform Metrics

| Metric | Value |
|--------|-------|
| Total Leads | ${data.metrics.totalLeads} |
| Leads This Week | ${data.metrics.newLeadsThisWeek} |
| Total Quote Value | $${data.metrics.totalQuoteValue.toLocaleString()} |
| AI Conversations | ${data.metrics.totalConversations} |
| Completed Calls | ${data.metrics.completedCalls} |
| Conversion Rate | ${data.metrics.conversionRate}% |

---

## Development Hours Breakdown

| Category | Hours | Rate | Total |
|----------|-------|------|-------|
${data.developmentHours.map(d => `| ${d.category} | ${d.hours} | $${d.rate}/hr | $${d.total.toLocaleString()} |`).join('\n')}
| **TOTAL** | **${data.totalHours}** | - | **$${data.totalValue.toLocaleString()}** |

---

## Deliverables Checklist

### ✅ Completed (90%)
- [x] Frontend Development (24 Routes)
- [x] Backend Infrastructure (8 Tables)
- [x] AI Chat Integration
- [x] Voice Agent (ElevenLabs)
- [x] Email Automation (Resend)
- [x] SMS Notifications (Twilio)
- [x] Quote Calculator Engine
- [x] Admin Dashboard (7 Panels)
- [x] Security (RLS Policies)
- [x] Analytics (GA4)
- [x] SEO Optimization
- [x] PDF Export System

### ⏳ Client Actions Required (10%)
- [ ] Provide Google Ads Conversion ID
- [ ] Provide Facebook Pixel ID
- [ ] Configure ElevenLabs Webhook
- [ ] Approve DNS Configuration
- [ ] Schedule E2E Testing

---

*Confidential - AI With Mitch Consulting*
    `.trim();
  };

  return {
    generateDocumentation,
    generateMarkdownReport,
    isLoading: !leads || !quotes || !conversations || !appointments,
  };
};
