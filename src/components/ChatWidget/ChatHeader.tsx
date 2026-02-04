import { Button } from "@/components/ui/button";
import { Headset, X } from "lucide-react";

interface ChatHeaderProps {
  isConnected: boolean;
  isLoading: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ChatHeader({ isConnected, isLoading, onClose, showCloseButton = false }: ChatHeaderProps) {
  return (
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
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
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
      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
