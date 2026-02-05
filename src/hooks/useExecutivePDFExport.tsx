import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ExecutivePDFData } from '@/components/admin/pdf/ExecutiveSummaryPDF';

// Helper to get last 7 days of lead data
const getLast7DaysLeads = (leads: Array<{ created_at: string }> | null | undefined) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const count = leads?.filter(l => {
      const leadDate = new Date(l.created_at);
      return leadDate.toDateString() === date.toDateString();
    }).length || 0;
    
    days.push({ label, value: count });
  }
  return days;
};

export const useExecutivePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch leads data
  const { data: leads } = useQuery({
    queryKey: ['executive-pdf-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch conversations data
  const { data: conversations } = useQuery({
    queryKey: ['executive-pdf-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id');
      if (error) throw error;
      return data;
    },
  });

  // Fetch appointments data
  const { data: appointments } = useQuery({
    queryKey: ['executive-pdf-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const generateExecutivePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamic import to avoid ESM/CJS conflict at module load time
      const [{ pdf }, { default: ExecutiveSummaryPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/admin/pdf/ExecutiveSummaryPDF'),
      ]);

      // Calculate metrics
      const totalLeads = leads?.length || 0;
      const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.estimated_quote || 0), 0) || 0;
      const totalChats = conversations?.length || 0;
      const completedCalls = leads?.filter(l => l.confirmation_call_status === 'completed').length || 0;
      const upcomingAppointments = appointments?.filter(a => a.status === 'scheduled').length || 0;
      
      const conversionRate = totalLeads > 0 
        ? Math.round((appointments?.length || 0) / totalLeads * 100) 
        : 0;

      const leadsByDay = getLast7DaysLeads(leads);

      const recentLeads = (leads || []).slice(0, 10).map(lead => ({
        full_name: lead.full_name,
        email: lead.email,
        status: lead.status,
        estimated_quote: lead.estimated_quote,
      }));

      const reportData: ExecutivePDFData = {
        totalLeads,
        totalRevenue,
        totalChats,
        conversionRate,
        completedCalls,
        upcomingAppointments,
        leadsByDay,
        recentLeads,
      };

      // Generate PDF blob
      const blob = await pdf(<ExecutiveSummaryPDF data={reportData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `handledly-executive-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Executive Summary PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateExecutivePDF,
    isGenerating,
  };
};
