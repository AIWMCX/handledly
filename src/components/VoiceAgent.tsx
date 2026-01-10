import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceAgentProps {
  className?: string;
  variant?: "floating" | "inline";
  agentId?: string;
}

export function VoiceAgent({ className, variant = "floating", agentId }: VoiceAgentProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to voice agent");
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
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setMicPermission('granted');

      // If we have an agent ID, get signed URL for it
      if (agentId) {
        const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
          body: { agent_id: agentId }
        });
        
        if (error || !data?.signed_url) {
          throw new Error(error?.message || 'Failed to get conversation token');
        }

        await conversation.startSession({
          signedUrl: data.signed_url,
        });
      } else {
        // No agent ID configured - show helpful message
        toast.error("Voice agent not configured. Please set up an ElevenLabs agent.");
        return;
      }
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied');
        toast.error("Microphone access is required for voice calls");
      } else {
        toast.error(error.message || "Failed to connect. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, agentId]);

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