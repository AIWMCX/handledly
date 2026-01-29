import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ExportFormat = 'csv' | 'json' | 'txt';

interface ExportOptions {
  filename?: string;
  format: ExportFormat;
}

// Convert array of objects to CSV string
const toCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null, undefined, arrays, and objects
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return `\"${value.join('; ')}\"`;
        if (typeof value === 'object') return `\"${JSON.stringify(value).replace(/\"/g, '\"\"')}\"`;
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\"')) {
          return `\"${stringValue.replace(/\"/g, '\"\"')}\"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  return csvRows.join('\n');
};

// Download helper
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    data: Record<string, any>[],
    options: ExportOptions
  ) => {
    const { format, filename } = options;
    const timestamp = format === 'csv' || format === 'json' 
      ? new Date().toISOString().split('T')[0] 
      : new Date().toISOString().replace(/[:.]/g, '-');
    
    const baseFilename = filename || `export-${timestamp}`;
    
    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'csv':
          content = toCSV(data);
          mimeType = 'text/csv;charset=utf-8';
          extension = 'csv';
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'txt':
          content = data.map(row => 
            Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
          ).join('\n\n---\n\n');
          mimeType = 'text/plain;charset=utf-8';
          extension = 'txt';
          break;
        default:
          throw new Error('Unsupported format');
      }

      downloadFile(content, `${baseFilename}.${extension}`, mimeType);
      toast.success(`Exported ${data.length} records as ${extension.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Export leads
  const exportLeads = async (format: ExportFormat, filters?: { status?: string }) => {
    setIsExporting(true);
    try {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      await exportData(data || [], {
        format,
        filename: `leads-${format === 'csv' ? 'export' : 'data'}-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export leads error:', error);
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  // Export call logs
  const exportCallLogs = async (format: ExportFormat, filters?: { status?: string }) => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('leads')
        .select('id, full_name, email, phone, confirmation_call_status, confirmation_call_time, call_duration_seconds, call_notes, call_transcript, call_retry_count, next_retry_at, call_sid')
        .not('confirmation_call_status', 'is', null)
        .order('confirmation_call_time', { ascending: false });
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('confirmation_call_status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      await exportData(data || [], {
        format,
        filename: `call-logs-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export call logs error:', error);
      toast.error('Failed to export call logs');
    } finally {
      setIsExporting(false);
    }
  };

  // Export conversations
  const exportConversations = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*, chat_messages(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Flatten for CSV or keep nested for JSON
      const exportableData = format === 'csv' 
        ? (data || []).map(conv => ({
            id: conv.id,
            session_id: conv.session_id,
            status: conv.status,
            source_page: conv.source_page,
            customer_satisfaction: conv.customer_satisfaction,
            message_count: conv.chat_messages?.length || 0,
            created_at: conv.created_at,
            ended_at: conv.ended_at,
          }))
        : data;
      
      await exportData(exportableData || [], {
        format,
        filename: `conversations-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export conversations error:', error);
      toast.error('Failed to export conversations');
    } finally {
      setIsExporting(false);
    }
  };

  // Export appointments
  const exportAppointments = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, leads(full_name, email, phone)')
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      
      const exportableData = (data || []).map(apt => ({
        id: apt.id,
        scheduled_date: apt.scheduled_date,
        scheduled_time: apt.scheduled_time,
        move_type: apt.move_type,
        status: apt.status,
        crew_size: apt.crew_size,
        estimated_duration: apt.estimated_duration,
        notes: apt.notes,
        lead_name: apt.leads?.full_name,
        lead_email: apt.leads?.email,
        lead_phone: apt.leads?.phone,
        created_at: apt.created_at,
      }));
      
      await exportData(exportableData, {
        format,
        filename: `appointments-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export appointments error:', error);
      toast.error('Failed to export appointments');
    } finally {
      setIsExporting(false);
    }
  };

  // Export quotes
  const exportQuotes = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*, leads(full_name, email, phone)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const exportableData = (data || []).map(quote => ({
        id: quote.id,
        quote_number: quote.quote_number,
        property_type: quote.property_type,
        bedrooms: quote.bedrooms,
        square_footage: quote.square_footage,
        has_stairs: quote.has_stairs,
        floor_number: quote.floor_number,
        specialty_items: quote.specialty_items?.join('; '),
        base_price: quote.base_price,
        distance_fee: quote.distance_fee,
        stairs_fee: quote.stairs_fee,
        specialty_fee: quote.specialty_fee,
        total_quote: quote.total_quote,
        distance_zone: quote.distance_zone,
        lead_name: quote.leads?.full_name,
        lead_email: quote.leads?.email,
        created_at: quote.created_at,
      }));
      
      await exportData(exportableData, {
        format,
        filename: `quotes-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export quotes error:', error);
      toast.error('Failed to export quotes');
    } finally {
      setIsExporting(false);
    }
  };

  // Export cost tracking data
  const exportCostData = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('cost_tracker')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      await exportData(data || [], {
        format,
        filename: `cost-tracking-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export cost data error:', error);
      toast.error('Failed to export cost data');
    } finally {
      setIsExporting(false);
    }
  };

  // Export AI quality reviews
  const exportAIQualityReviews = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('ai_quality_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      await exportData(data || [], {
        format,
        filename: `ai-quality-reviews-${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      console.error('Export AI quality reviews error:', error);
      toast.error('Failed to export AI quality reviews');
    } finally {
      setIsExporting(false);
    }
  };

  // Generic export for custom data
  const exportCustomData = async (
    data: Record<string, any>[],
    filename: string,
    format: ExportFormat
  ) => {
    setIsExporting(true);
    try {
      await exportData(data, { format, filename });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportLeads,
    exportCallLogs,
    exportConversations,
    exportAppointments,
    exportQuotes,
    exportCostData,
    exportAIQualityReviews,
    exportCustomData,
  };
};
