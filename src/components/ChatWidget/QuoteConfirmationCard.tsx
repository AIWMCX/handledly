import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, PhoneCall, DollarSign } from "lucide-react";
import type { QuoteSubmission } from "./types";

interface QuoteConfirmationCardProps {
  quoteSubmission: QuoteSubmission | null;
  onViewConfirmation: () => void;
}

export function QuoteConfirmationCard({ quoteSubmission, onViewConfirmation }: QuoteConfirmationCardProps) {
  if (!quoteSubmission) return null;
  
  return (
    <div className="mx-2 my-4 p-4 bg-accent/10 border border-accent/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Quote Submitted!</p>
          {quoteSubmission.quoteNumber && (
            <p className="text-xs text-muted-foreground">#{quoteSubmission.quoteNumber}</p>
          )}
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
        {quoteSubmission.totalQuote && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-foreground font-medium">
              Estimated: ${quoteSubmission.totalQuote.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      
      <Button
        onClick={onViewConfirmation}
        className="w-full gradient-gold text-primary-foreground"
        size="sm"
      >
        View Full Confirmation
      </Button>
    </div>
  );
}
