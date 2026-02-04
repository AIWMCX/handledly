import { RefObject } from "react";
import { Headset, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "./types";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  compact?: boolean;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessages({ messages, isLoading, messagesEndRef, compact = false }: ChatMessagesProps) {
  return (
    <>
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className={cn("text-center", compact ? "py-6" : "py-8")}>
          <Headset className={cn("mx-auto text-muted-foreground mb-3", compact ? "w-10 h-10" : "w-12 h-12 mb-4")} />
          <p className="text-sm text-muted-foreground">
            Chat with Jack about your upcoming move!
          </p>
        </div>
      )}

      {/* Initial loading spinner */}
      {isLoading && messages.length === 0 && (
        <div className={cn("flex items-center justify-center", compact ? "py-6" : "py-8")}>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Message list */}
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
                "px-3 py-2 rounded-2xl text-sm",
                compact ? "max-w-[240px]" : "max-w-[260px]",
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
    </>
  );
}
