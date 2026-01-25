import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Headset, User, Loader2, Sparkles, Calendar, Clock, DollarSign, Phone, CheckCircle, Mail, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAIChat } from "@/hooks/useAIChat";
import { ConversionEvents } from "@/lib/analytics";

interface ChatWidgetProps {
  className?: string;
  variant?: "floating" | "inline";
}

const quickActions = [
  { icon: DollarSign, label: "Get Free Quote", prompt: "I'd like to get a free quote for my move", priority: true },
  { icon: Calendar, label: "Book Same-Day", prompt: "I need a same-day moving service", priority: true },
  { icon: Clock, label: "Service Hours", prompt: "What are your hours of operation?", priority: false },
  { icon: Sparkles, label: "View Pricing", prompt: "How much do you charge for moving?", priority: false },
];

// Proactive conversion prompts shown after message count threshold
const conversionPrompts = [
  { message: 3, text: "💡 Ready to get your personalized quote? I just need a few quick details!", cta: "Start My Quote" },
  { message: 6, text: "📞 Want to talk to someone? Call us at (878) 218-7397 or let me get your quote now!", cta: "Get Quote Now" },
];

export function ChatWidget({ className, variant = "floating" }: ChatWidgetProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(variant === "inline");
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [shownConversionPrompts, setShownConversionPrompts] = useState<number[]>([]);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isConnected,
    quoteSubmission,
    isQuoteSubmitted,
    startChat,
    endChat,
    sendMessage,
  } = useAIChat({
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error("Something went wrong. Please try again.");
    },
    onQuoteSubmitted: (result) => {
      if (result.success) {
        toast.success(`Quote ${result.quoteNumber} submitted successfully!`);
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isQuoteSubmitted]);

  // Auto-connect for inline variant
  useEffect(() => {
    if (variant === "inline" && !isConnected && !isLoading) {
      startChat('inline');
    }
  }, [variant, isConnected, isLoading, startChat]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!isConnected) {
      await startChat('floating');
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

  const handleQuickAction = (action: string, prompt: string) => {
    ConversionEvents.chatQuickActionUsed(action, window.location.pathname);
    handleSendMessage(prompt);
  };

  const handleViewConfirmation = () => {
    if (quoteSubmission) {
      navigate(`/quote?confirmed=true&quoteNumber=${quoteSubmission.quoteNumber}&email=${quoteSubmission.email}&name=${quoteSubmission.firstName}&total=${quoteSubmission.totalQuote}`);
    }
  };

  // Check if we should show a conversion prompt based on message count
  const getActiveConversionPrompt = () => {
    if (dismissedPrompt || isQuoteSubmitted) return null;
    
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    
    for (const prompt of conversionPrompts) {
      if (userMessageCount >= prompt.message && !shownConversionPrompts.includes(prompt.message)) {
        return prompt;
      }
    }
    return null;
  };

  const handleConversionPromptAction = (prompt: typeof conversionPrompts[0]) => {
    setShownConversionPrompts(prev => [...prev, prompt.message]);
    handleSendMessage("I'd like to get a free quote for my move");
  };

  const dismissConversionPrompt = () => {
    setDismissedPrompt(true);
  };

  const activePrompt = getActiveConversionPrompt();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Quote Confirmation Card Component
  const QuoteConfirmationCard = () => (
    <div className="mx-2 my-4 p-4 bg-accent/10 border border-accent/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Quote Submitted!</p>
          <p className="text-xs text-muted-foreground">#{quoteSubmission?.quoteNumber}</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-accent" />
          <span className="text-foreground">Email confirmation sent</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <PhoneCall className="w-4 h-4 text-accent" />
          <span className="text-foreground">Call scheduled in ~30 seconds</span>
        </div>
        {quoteSubmission?.totalQuote && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-foreground font-medium">
              Estimated: ${quoteSubmission.totalQuote.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      
      <Button
        onClick={handleViewConfirmation}
        className="w-full gradient-gold text-primary-foreground"
        size="sm"
      >
        View Full Confirmation
      </Button>
    </div>
  );

  // Inline variant for Contact page
  if (variant === "inline") {
    return (
      <div className={cn("rounded-2xl bg-card border border-border overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
              <Headset className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Jack - Moving Specialist</p>
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
              <Headset className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Chat with Jack about your upcoming move!
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
                  <Headset className="w-4 h-4 text-primary-foreground" />
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
          
          {/* Quote Confirmation Card */}
          {isQuoteSubmitted && quoteSubmission && <QuoteConfirmationCard />}
          
          {/* Conversion Prompt Banner */}
          {activePrompt && !isLoading && (
            <div className="mx-2 my-3 p-3 bg-primary/10 border border-primary/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activePrompt.text}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleConversionPromptAction(activePrompt)}
                      className="gradient-gold text-primary-foreground text-xs h-7 px-3"
                    >
                      {activePrompt.cta}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={dismissConversionPrompt}
                      className="text-xs h-7 px-2 text-muted-foreground"
                    >
                      Later
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Typing indicator */}
          {isLoading && messages.length > 0 && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                <Headset className="w-4 h-4 text-primary-foreground" />
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

        {/* Quick Actions - prioritize conversion actions */}
        {showQuickActions && isConnected && messages.length <= 1 && !isQuoteSubmitted && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.filter(a => a.priority).map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label, action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium text-foreground transition-colors"
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
              placeholder={isQuoteSubmitted ? "Ask another question..." : "Type a message..."}
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
          "fixed bottom-[10rem] md:bottom-[6.5rem] right-6 z-50 w-[calc(100%-3rem)] max-w-[380px] h-[480px] md:h-[560px]",
          "bg-card border border-border rounded-2xl shadow-elegant",
          "flex flex-col overflow-hidden",
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Headset className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Jack - Moving Specialist</p>
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
                <Headset className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Chat with Jack about your upcoming move!
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
                    <Headset className="w-4 h-4 text-primary-foreground" />
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
            
            {/* Quote Confirmation Card */}
            {isQuoteSubmitted && quoteSubmission && <QuoteConfirmationCard />}
            
            {/* Conversion Prompt Banner */}
            {activePrompt && !isLoading && (
              <div className="mx-2 my-3 p-3 bg-primary/10 border border-primary/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activePrompt.text}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleConversionPromptAction(activePrompt)}
                        className="gradient-gold text-primary-foreground text-xs h-7 px-3"
                      >
                        {activePrompt.cta}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={dismissConversionPrompt}
                        className="text-xs h-7 px-2 text-muted-foreground"
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing indicator */}
            {isLoading && messages.length > 0 && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full gradient-gold flex-shrink-0 flex items-center justify-center">
                  <Headset className="w-4 h-4 text-primary-foreground" />
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

          {/* Quick Actions - prioritize conversion actions */}
          {showQuickActions && isConnected && messages.length <= 1 && !isQuoteSubmitted && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">How can I help?</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.filter(a => a.priority).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label, action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium text-foreground transition-colors"
                  >
                    <action.icon className="w-3 h-3 text-primary" />
                    {action.label}
                  </button>
                ))}
                {quickActions.filter(a => !a.priority).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label, action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
                  >
                    <action.icon className="w-3 h-3 text-muted-foreground" />
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
                placeholder={isQuoteSubmitted ? "Ask another question..." : "Type a message..."}
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
              <a href="tel:8782187397" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="w-3 h-3" />
                Call (878) 218-7397
              </a>
              {" for instant voice quotes"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
