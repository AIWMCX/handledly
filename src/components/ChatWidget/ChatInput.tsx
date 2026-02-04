import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isQuoteSubmitted: boolean;
  showPhoneCta?: boolean;
  compact?: boolean;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  disabled, 
  isQuoteSubmitted, 
  showPhoneCta = false,
  compact = false 
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`border-t border-border bg-secondary/30 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isQuoteSubmitted ? "Ask another question..." : "Type a message..."}
          className={compact ? "flex-1 text-sm" : "flex-1"}
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className={`gradient-gold text-primary-foreground ${compact ? 'h-9 w-9' : ''}`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {showPhoneCta && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          <a href="tel:8782187397" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Phone className="w-3 h-3" />
            Call (878) 218-7397
          </a>
          {" for instant voice quotes"}
        </p>
      )}
    </div>
  );
}
