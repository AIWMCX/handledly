import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceAgentProps {
  className?: string;
  variant?: "floating" | "inline";
}

// Client tools that the agent can call
interface CreateLeadParams {
  fullName: string;
  email: string;
  phone: string;
  serviceType?: string;
  bedrooms?: number;
  estimatedQuote?: number;
}

interface ScheduleAppointmentParams {
  date: string;
  time: string;
  serviceType: string;
}

interface CheckAvailabilityParams {
  date: string;
}

export function VoiceAgent({ className, variant = "floating" }: VoiceAgentProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to voice agent");
      retryCountRef.current = 0;
      toast.success("Connected! Start speaking...");
    },
    onDisconnect: () => {
      console.log("Disconnected from voice agent");
      toast.info("Call ended");
    },
    onMessage: (message) => {
      console.log("Agent message:", message);
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      toast.error("Connection error. Please try again.");
    },
    // Client-side tools the agent can use
    clientTools: {
      createLead: async (params: CreateLeadParams) => {
        console.log("Creating lead:", params);
        try {
          const { data, error } = await supabase
            .from('leads')
            .insert({
              full_name: params.fullName,
              email: params.email,
              phone: params.phone,
              property_type: params.serviceType || 'apartment-condo',
              bedrooms: params.bedrooms,
              estimated_quote: params.estimatedQuote,
              status: 'new',
            })
            .select()
            .single();

          if (error) throw error;
          return `Lead created successfully for ${params.fullName}. We'll follow up shortly!`;
        } catch (error) {
          console.error("Error creating lead:", error);
          return "I apologize, I had trouble saving your information. Let me transfer you to our team.";
        }
      },
      scheduleAppointment: async (params: ScheduleAppointmentParams) => {
        console.log("Scheduling appointment:", params);
        try {
          const { data, error } = await supabase
            .from('appointments')
            .insert({
              scheduled_date: params.date,
              scheduled_time: params.time,
              move_type: params.serviceType,
              status: 'scheduled',
            })
            .select()
            .single();

          if (error) throw error;
          return `Appointment scheduled for ${params.date} at ${params.time}. We'll send you a confirmation!`;
        } catch (error) {
          console.error("Error scheduling appointment:", error);
          return "I had trouble scheduling that time. Let me connect you with our team to finalize.";
        }
      },
      checkAvailability: async (params: CheckAvailabilityParams) => {
        console.log("Checking availability for:", params.date);
        const dayOfWeek = new Date(params.date).getDay();
        if (dayOfWeek === 0) {
          return "We have limited availability on Sundays. Our hours are 8am to 5pm.";
        }
        if (dayOfWeek === 6) {
          return "Saturday is a popular day! We have morning slots at 7am, 8am, and an afternoon slot at 1pm available.";
        }
        return "We have great availability on that date! We can start as early as 7am or schedule you for any time up to 4pm.";
      },
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');

      // Get signed URL and agent_id from backend (no frontend env var needed)
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token');
      
      if (error) {
        throw new Error(error.message || 'Failed to get conversation token');
      }
      
      if (!data?.signed_url) {
        throw new Error('No signed URL received from server');
      }

      console.log('Starting conversation with agent:', data.agent_id);
      
      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied');
        toast.error("Microphone access is required for voice calls");
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        toast.error(`Connection failed. Retrying... (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => startConversation(), 1000 * retryCountRef.current);
        return;
      } else {
        toast.error(error.message || "Failed to connect. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  if (variant === "floating") {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        {/* Pulse ring when connected */}
        {isConnected && (
          <div className="absolute inset-0 rounded-full animate-pulse-gold" />
        )}
        
        <Button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          size="lg"
          className={cn(
            "w-16 h-16 rounded-full shadow-elegant transition-all duration-300",
            isConnected
              ? "bg-destructive hover:bg-destructive/90"
              : "gradient-gold hover:opacity-90 shadow-gold",
            isSpeaking && "voice-pulse"
          )}
        >
          {isConnecting ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="w-6 h-6 text-destructive-foreground" />
          ) : (
            <Phone className="w-6 h-6 text-primary-foreground" />
          )}
        </Button>

        {/* Status label */}
        <div className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "bg-card px-3 py-1.5 rounded-full text-xs font-medium",
          "border border-border shadow-lg",
          "transition-opacity duration-300",
          isConnected ? "opacity-100" : "opacity-0"
        )}>
          {isSpeaking ? (
            <span className="text-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Agent speaking...
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Mic className="w-3 h-3" />
              Listening...
            </span>
          )}
        </div>

        {/* Microphone denied message */}
        {micPermission === 'denied' && (
          <div className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-card border border-border rounded-lg shadow-lg">
            <p className="text-sm text-foreground font-medium mb-1">Microphone Required</p>
            <p className="text-xs text-muted-foreground">
              Please enable microphone access in your browser settings to use voice calling.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Inline variant for the contact page
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          size="lg"
          className={cn(
            "gap-2",
            isConnected
              ? "bg-destructive hover:bg-destructive/90"
              : "gradient-gold hover:opacity-90 shadow-gold"
          )}
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : isConnected ? (
            <>
              <PhoneOff className="w-5 h-5" />
              End Call
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Start AI Call
            </>
          )}
        </Button>

        {isConnected && (
          <div className="flex items-center gap-2 text-sm">
            {isSpeaking ? (
              <span className="text-primary flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Agent speaking...
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Listening...
              </span>
            )}
          </div>
        )}
      </div>

      {micPermission === 'denied' && (
        <p className="text-sm text-destructive">
          Microphone access is required. Please enable it in your browser settings.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Speak with our AI assistant to get an instant quote, schedule your move, or ask questions.
      </p>
    </div>
  );
}