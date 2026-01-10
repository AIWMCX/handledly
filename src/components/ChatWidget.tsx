import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
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
}

export function ChatWidget({ className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const conversation = useConversation({
    onConnect: () => {
      console.log("Chat connected");
      retryCountRef.current = 0;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: "Hi! I'm the Denver Premium Moving assistant. How can I help you today? I can provide instant quotes, answer questions about our services, or help schedule your move.",
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
          // Replace the last agent message with corrected version
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
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Get signed URL and agent_id from backend
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

  const sendMessage = async () => {
    if (!inputValue.trim() || conversation.status !== 'connected' || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    
    try {
      // Send text message to the ElevenLabs conversation
      await conversation.sendUserMessage(inputValue.trim());
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

  const isConnected = conversation.status === 'connected';

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={cn(
            "fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full",
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
          "fixed bottom-24 right-6 z-50 w-[360px] h-[500px]",
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
                <p className="font-medium text-foreground text-sm">Denver Premium Moving</p>
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
                <div
                  className={cn(
                    "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  )}
                >
                  {message.content}
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

          {/* Input */}
          <div className="p-4 border-t border-border bg-secondary/30">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={!isConnected || isSending}
              />
              <Button
                onClick={sendMessage}
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