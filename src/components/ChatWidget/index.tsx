import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAIChat } from "@/hooks/useAIChat";
import { ConversionEvents } from "@/lib/analytics";

import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { QuoteConfirmationCard } from "./QuoteConfirmationCard";
import { ConversionPrompt } from "./ConversionPrompt";
import { QuickActions } from "./QuickActions";
import type { ChatWidgetProps, ConversionPrompt as ConversionPromptType } from "./types";
import { conversionPrompts } from "./types";

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
  const getActiveConversionPrompt = (): ConversionPromptType | null => {
    if (dismissedPrompt || isQuoteSubmitted) return null;
    
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    
    for (const prompt of conversionPrompts) {
      if (userMessageCount >= prompt.message && !shownConversionPrompts.includes(prompt.message)) {
        return prompt;
      }
    }
    return null;
  };

  const handleConversionPromptAction = (prompt: ConversionPromptType) => {
    setShownConversionPrompts(prev => [...prev, prompt.message]);
    handleSendMessage("I'd like to get a free quote for my move");
  };

  const dismissConversionPrompt = () => {
    setDismissedPrompt(true);
  };

  const activePrompt = getActiveConversionPrompt();

  // Inline variant for Contact page
  if (variant === "inline") {
    return (
      <div className={cn("rounded-2xl bg-card border border-border overflow-hidden", className)}>
        <ChatHeader isConnected={isConnected} isLoading={isLoading} />
        
        <div className="h-[300px] overflow-y-auto p-4 space-y-4">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
            compact
          />
          
          {isQuoteSubmitted && quoteSubmission && (
            <QuoteConfirmationCard 
              quoteSubmission={quoteSubmission} 
              onViewConfirmation={handleViewConfirmation} 
            />
          )}
          
          {activePrompt && !isLoading && (
            <ConversionPrompt 
              prompt={activePrompt} 
              onAction={() => handleConversionPromptAction(activePrompt)} 
              onDismiss={dismissConversionPrompt} 
            />
          )}
        </div>

        {showQuickActions && isConnected && messages.length <= 1 && !isQuoteSubmitted && (
          <QuickActions onAction={handleQuickAction} />
        )}

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => handleSendMessage()}
          disabled={!isConnected || isLoading}
          isQuoteSubmitted={isQuoteSubmitted}
          compact
        />
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
            "fixed bottom-[12.5rem] md:bottom-[6.5rem] right-6 z-40 w-14 h-14 rounded-full",
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
          "fixed bottom-[12.5rem] md:bottom-[6.5rem] right-6 z-50 w-[calc(100%-3rem)] max-w-[380px] h-[420px] md:h-[560px]",
          "bg-card border border-border rounded-2xl shadow-elegant",
          "flex flex-col overflow-hidden",
          className
        )}>
          <ChatHeader 
            isConnected={isConnected} 
            isLoading={isLoading} 
            onClose={handleClose} 
            showCloseButton 
          />

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
            />
            
            {isQuoteSubmitted && quoteSubmission && (
              <QuoteConfirmationCard 
                quoteSubmission={quoteSubmission} 
                onViewConfirmation={handleViewConfirmation} 
              />
            )}
            
            {activePrompt && !isLoading && (
              <ConversionPrompt 
                prompt={activePrompt} 
                onAction={() => handleConversionPromptAction(activePrompt)} 
                onDismiss={dismissConversionPrompt} 
              />
            )}
          </div>

          {showQuickActions && isConnected && messages.length <= 1 && !isQuoteSubmitted && (
            <QuickActions onAction={handleQuickAction} showSecondary showLabel />
          )}

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSendMessage()}
            disabled={!isConnected || isLoading}
            isQuoteSubmitted={isQuoteSubmitted}
            showPhoneCta
          />
        </div>
      )}
    </>
  );
}
