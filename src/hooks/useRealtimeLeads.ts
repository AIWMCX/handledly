import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeLeads = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
          queryClient.invalidateQueries({ queryKey: ['admin-leads-paginated'] });
          queryClient.invalidateQueries({ queryKey: ['admin-leads-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-call-logs'] });
          setLastUpdate(new Date());
          
          // Show toast for new leads
          if (payload.eventType === 'INSERT') {
            const lead = payload.new as { full_name?: string; estimated_quote?: number };
            toast.success(`New lead: ${lead.full_name}`, {
              description: lead.estimated_quote 
                ? `Quote: $${lead.estimated_quote.toLocaleString()}` 
                : 'Quote pending',
              action: {
                label: 'View',
                onClick: () => window.location.href = '/admin/leads'
              }
            });
          }
          
          // Show toast for status updates
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as { confirmation_call_status?: string; full_name?: string };
            const oldData = payload.old as { confirmation_call_status?: string };
            
            if (newData.confirmation_call_status !== oldData.confirmation_call_status) {
              if (newData.confirmation_call_status === 'completed') {
                toast.success(`Call completed: ${newData.full_name}`);
              } else if (newData.confirmation_call_status === 'failed') {
                toast.warning(`Call failed: ${newData.full_name}`, {
                  description: 'Retry scheduled automatically'
                });
              }
            }
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isConnected, lastUpdate };
};
