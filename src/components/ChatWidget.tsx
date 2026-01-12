import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Calendar, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  className?: string;
  variant?: "floating" | "inline";
}

// Client tools interfaces - same as VoiceAgent
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

const quickActions = [
  { icon: DollarSign, label: "Get a Quote", prompt: "I'd like to get a quote for my move" },
  { icon: Clock, label: "Service Hours", prompt: "What are your hours of operation?" },
  { icon: Calendar, label: "Schedule Move", prompt: "I want to schedule a move" },
  { icon: Sparkles, label: "Pricing Info", prompt: "How much do you charge for moving?" },
];

export function ChatWidget({ className, variant = "floating" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(variant === "inline");
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const conversation = useConversation({
    textOnly: true,
    onConnect: () => {
      console.log("Chat connected");
      retryCountRef.current = 0;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Hi! I'm the Handled moving assistant. How can I help you today? I can provide instant quotes, answer questions about our services, or help schedule your move.",
        timestamp: new Date(),
      }]);
    },
    onDisconnect: () => {
      console.log("Chat disconnected");
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      const msg = message as any;
      
      // Handle agent response events
      if (msg.type === 'agent_response' && msg.agent_response_event?.agent_response) {
        setIsSending(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          content: msg.agent_response_event.agent_response,
          timestamp: new Date(),
        }]);
      }
      
      // Handle agent response correction (when interrupted)
      if (msg.type === 'agent_response_correction' && msg.agent_response_correction_event?.corrected_agent_response) {
        setIsSending(false);
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'agent') {
              updated[i] = {
                ...updated[i],
                content: msg.agent_response_correction_event.corrected_agent_response,
              };
              break;
            }
          }
          return updated;
        });
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsSending(false);
      toast.error("Connection error. Please try again.");
    },
    // Client-side tools the agent can use - same as VoiceAgent
    clientTools: {
      createLead: async (params: CreateLeadParams) => {
        console.log("Creating lead via chat:", params);
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
        console.log("Scheduling appointment via chat:", params);
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
        console.log("Checking availability via chat for:", params.date);
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-connect for inline variant
  useEffect(() => {
    if (variant === "inline" && conversation.status !== 'connected') {
      startChat();
    }
  }, [variant]);

  const startChat = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token');
      
      if (error) {
        throw new Error(error.message || 'Failed to connect to chat');
      }
      
      if (!data?.signed_url) {
        throw new Error('No signed URL received');
      }

      console.log('Starting chat with agent:', data.agent_id);
      
      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        toast.error(`Connection failed. Retrying... (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => startChat(), 1000 * retryCountRef.current);
        return;
      }
      
      toast.error("Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const endChat = useCallback(async () => {
    await conversation.endSession();
    setMessages([]);
    setShowQuickActions(true);
  }, [conversation]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (conversation.status !== 'connected') {
      await startChat();
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    if (conversation.status === 'connected') {
      await endChat();
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || conversation.status !== 'connected' || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    setShowQuickActions(false);
    
    try {
      await conversation.sendUserMessage(messageText);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSending(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isConnected = conversation.status === 'connected';

  // Inline variant for Contact page
  if (variant === "inline") {
    return (
      <div className={cn("rounded-2xl bg-card border border-border overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Chat Support</p>
              <p className="text-xs text-muted-foreground">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                ) : isConnecting ? (
                  "Connecting..."
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isConnecting && (
            <div className="text-center py-6">
              <Bot className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Start a conversation with our AI assistant!
              </p>
            </div>
          )}

          {isConnecting && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'agent' && (
                <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div
                  className={cn(
                    "max-w-[240px] px-3 py-2 rounded-2xl text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  )}
                >
                  {message.content}
                </div>
                <span className={cn(
                  "text-[10px] text-muted-foreground",
                  message.role === 'user' ? "text-right" : "text-left ml-1"
                )}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && isConnected && messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 2).map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
                >
                  <action.icon className="w-3 h-3 text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border bg-secondary/30">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (isConnected) conversation.sendUserActivity();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={!isConnected || isSending}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || !isConnected || isSending}
              size="icon"
              className="gradient-gold text-primary-foreground h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Floating variant (default)
  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={cn(
            "fixed bottom-[6.5rem] right-6 z-50 w-14 h-14 rounded-full",
            "bg-secondary hover:bg-secondary/80 border border-border",
            "shadow-lg transition-all duration-300 hover:scale-105",
            "flex items-center justify-center",
            className
          )}
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 text-foreground" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-[6.5rem] right-6 z-50 w-[380px] h-[520px]",
          "bg-card border border-border rounded-2xl shadow-elegant",
          "flex flex-col overflow-hidden",
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Handled</p>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online
                    </span>
                  ) : isConnecting ? (
                    "Connecting..."
                  ) : (
                    "Offline"
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isConnecting && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Start a conversation with our AI assistant!
                </p>
              </div>
            )}

            {isConnecting && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "max-w-[260px] px-3 py-2 rounded-2xl text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    )}
                  >
                    {message.content}
                  </div>
                  <span className={cn(
                    "text-[10px] text-muted-foreground",
                    message.role === 'user' ? "text-right" : "text-left ml-1"
                  )}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isSending && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && isConnected && messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
                  >
                    <action.icon className="w-3 h-3 text-primary" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-secondary/30">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (isConnected) conversation.sendUserActivity();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={!isConnected || isSending}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || !isConnected || isSending}
                size="icon"
                className="gradient-gold text-primary-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              For instant voice quotes, try our <span className="text-primary">phone assistant</span> →
            </p>
          </div>
        </div>
      )}
    </>
  );
}