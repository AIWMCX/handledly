import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PDFReportData } from '@/components/admin/DeliverablesPDFReport';

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all necessary data for the report
  const { data: leads } = useQuery({
    queryKey: ['pdf-export-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: conversations } = useQuery({
    queryKey: ['pdf-export-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id');
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['pdf-export-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: quoteRequests } = useQuery({
    queryKey: ['pdf-export-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('id, total_quote');
      if (error) throw error;
      return data;
    },
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamic import to avoid ESM/CJS conflict at module load time
      const [{ pdf }, { default: DeliverablesPDFReport }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/admin/DeliverablesPDFReport'),
      ]);

      // Calculate metrics
      const today = new Date();
      const totalLeads = leads?.length || 0;
      const newLeadsToday = leads?.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.toDateString() === today.toDateString();
      }).length || 0;

      const totalChats = conversations?.length || 0;
      const totalQuotes = quoteRequests?.length || 0;
      const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.estimated_quote || 0), 0) || 0;
      
      const completedCalls = leads?.filter(l => l.confirmation_call_status === 'completed').length || 0;
      const upcomingAppointments = appointments?.filter(a => a.status === 'scheduled').length || 0;
      
      const conversionRate = totalLeads > 0 
        ? Math.round((appointments?.length || 0) / totalLeads * 100) 
        : 0;

      const recentLeads = (leads || []).slice(0, 8).map(lead => ({
        full_name: lead.full_name,
        email: lead.email,
        status: lead.status,
        created_at: lead.created_at,
        estimated_quote: lead.estimated_quote,
      }));

      const reportData: PDFReportData = {
        totalLeads,
        newLeadsToday,
        totalChats,
        totalQuotes,
        totalRevenue,
        conversionRate,
        completedCalls,
        upcomingAppointments,
        recentLeads,
      };

      // Generate PDF blob
      const blob = await pdf(<DeliverablesPDFReport data={reportData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `handledly-deliverables-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your deliverables report has been downloaded.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
  };
};
