import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Calendar, Clock, DollarSign, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAIChat } from "@/hooks/useAIChat";

interface ChatWidgetProps {
  className?: string;
  variant?: "floating" | "inline";
}

const quickActions = [
  { icon: DollarSign, label: "Get a Quote", prompt: "I'd like to get a quote for my move" },
  { icon: Clock, label: "Service Hours", prompt: "What are your hours of operation?" },
  { icon: Calendar, label: "Schedule Move", prompt: "I want to schedule a move" },
  { icon: Sparkles, label: "Pricing Info", prompt: "How much do you charge for moving?" },
];

export function ChatWidget({ className, variant = "floating" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(variant === "inline");
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isConnected,
    startChat,
    endChat,
    sendMessage,
  } = useAIChat({
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-connect for inline variant
  useEffect(() => {
    if (variant === "inline" && !isConnected && !isLoading) {
      startChat();
    }
  }, [variant, isConnected, isLoading, startChat]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!isConnected) {
      await startChat();
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    if (isConnected) {
      await endChat();
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || !isConnected || isLoading) return;

    setShowQuickActions(false);
    setInputValue("");
    await sendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              <p className="font-medium text-foreground text-sm">Jack - AI Assistant</p>
              <p className="text-xs text-muted-foreground">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                ) : isLoading ? (
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
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-6">
              <Bot className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Start a conversation with our AI assistant!
              </p>
            </div>
          )}

          {isLoading && messages.length === 0 && (
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
              {message.role === 'assistant' && (
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
          
          {/* Typing indicator */}
          {isLoading && messages.length > 0 && (
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
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={!isConnected || isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || !isConnected || isLoading}
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
            "fixed bottom-[10rem] md:bottom-[6.5rem] right-6 z-40 w-14 h-14 rounded-full",
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
          "fixed bottom-[10rem] md:bottom-[6.5rem] right-6 z-50 w-[calc(100%-3rem)] max-w-[380px] h-[420px] md:h-[520px]",
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
                <p className="font-medium text-foreground text-sm">Jack - AI Assistant</p>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : isLoading ? (
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
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Start a conversation with our AI assistant!
                </p>
              </div>
            )}

            {isLoading && messages.length === 0 && (
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
                {message.role === 'assistant' && (
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
            {isLoading && messages.length > 0 && (
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={!isConnected || isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || !isConnected || isLoading}
                size="icon"
                className="gradient-gold text-primary-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <a href="tel:7205550123" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="w-3 h-3" />
                Call (720) 555-0123
              </a>
              {" for instant voice quotes"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
