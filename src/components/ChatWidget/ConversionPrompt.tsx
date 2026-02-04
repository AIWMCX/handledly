import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { ConversionPrompt as ConversionPromptType } from "./types";

interface ConversionPromptProps {
  prompt: ConversionPromptType;
  onAction: () => void;
  onDismiss: () => void;
}

export function ConversionPrompt({ prompt, onAction, onDismiss }: ConversionPromptProps) {
  return (
    <div className="mx-2 my-3 p-3 bg-primary/10 border border-primary/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground">{prompt.text}</p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={onAction}
              className="gradient-gold text-primary-foreground text-xs h-7 px-3"
            >
              {prompt.cta}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs h-7 px-2 text-muted-foreground"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
