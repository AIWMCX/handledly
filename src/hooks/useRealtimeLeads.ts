import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HIGH_VALUE_THRESHOLD = 1000;

// Notification sound (base64-encoded short beep)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2telexx2telexy4AAD+a2telexxz';

function formatCurrency(amount: number | null): string {
  if (!amount) return 'Quote pending';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatMoveDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const useRealtimeLeads = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      audioRef.current = null;
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Audio autoplay may be blocked, ignore error
      });
    }
  }, []);

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
          
          // Show toast for new leads with enhanced details
          if (payload.eventType === 'INSERT') {
            const lead = payload.new as { 
              full_name?: string; 
              estimated_quote?: number;
              move_date?: string;
              phone?: string;
            };
            
            const isHighValue = (lead.estimated_quote || 0) >= HIGH_VALUE_THRESHOLD;
            const moveInfo = lead.move_date ? ` • Moving ${formatMoveDate(lead.move_date)}` : '';
            
            // Play sound for all new leads, louder for high value
            if (isHighValue && audioRef.current) {
              audioRef.current.volume = 0.8;
            }
            playNotificationSound();
            
            toast.success(
              isHighValue 
                ? `🔥 High-Value Lead: ${lead.full_name}` 
                : `🏠 New Lead: ${lead.full_name}`,
              {
                description: `${formatCurrency(lead.estimated_quote)}${moveInfo}`,
                duration: isHighValue ? 10000 : 5000,
                action: lead.phone ? {
                  label: '📞 Call Now',
                  onClick: () => window.open(`tel:${lead.phone}`, '_self')
                } : {
                  label: 'View',
                  onClick: () => window.location.href = '/admin/leads'
                },
                className: isHighValue ? 'border-2 border-amber-500' : undefined,
              }
            );
          }
          
          // Show toast for status updates
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as { confirmation_call_status?: string; full_name?: string };
            const oldData = payload.old as { confirmation_call_status?: string };
            
            if (newData.confirmation_call_status !== oldData.confirmation_call_status) {
              if (newData.confirmation_call_status === 'completed') {
                toast.success(`✅ Call completed: ${newData.full_name}`, {
                  description: 'AI confirmation call successful'
                });
              } else if (newData.confirmation_call_status === 'failed') {
                toast.warning(`⚠️ Call failed: ${newData.full_name}`, {
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
  }, [queryClient, playNotificationSound]);

  return { isConnected, lastUpdate };
};
