import { Check, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteConfirmationProps {
  customerName: string;
  totalQuote: number;
  email: string;
  emailSent: boolean;
  callScheduled: boolean;
  preferEmailOnly: boolean;
}

export function QuoteConfirmation({
  customerName,
  totalQuote,
  email,
  emailSent,
  callScheduled,
  preferEmailOnly,
}: QuoteConfirmationProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-primary-foreground" />
      </div>
      
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
        Quote Submitted!
      </h2>
      
      <p className="text-lg text-primary font-medium mb-4">
        Estimated Total: ${totalQuote}
      </p>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Thank you, {customerName}! We've received your request and our transparent, 
        flat-rate quote has been sent to your email.
      </p>

      {/* Status indicators */}
      <div className="space-y-3 mb-8 max-w-sm mx-auto">
        {/* Email Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            emailSent ? 'bg-green-500/20' : 'bg-secondary'
          }`}>
            <Mail className={`w-4 h-4 ${emailSent ? 'text-green-500' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">
              {emailSent ? 'Quote emailed!' : 'Sending email...'}
            </p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          {emailSent && <Check className="w-4 h-4 text-green-500" />}
        </div>

        {/* Call Status */}
        {!preferEmailOnly && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              callScheduled ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              <Phone className={`w-4 h-4 ${callScheduled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">
                {callScheduled ? 'Confirmation call scheduled' : 'Scheduling call...'}
              </p>
              <p className="text-xs text-muted-foreground">
                We'll call within 10 minutes
              </p>
            </div>
            {callScheduled && <Clock className="w-4 h-4 text-primary animate-pulse" />}
          </div>
        )}
      </div>

      {/* What to expect */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-8 max-w-sm mx-auto text-left">
        <h3 className="font-medium text-foreground mb-2 text-sm">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5" />
            <span>Check your email for detailed quote breakdown</span>
          </li>
          {!preferEmailOnly && (
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5" />
              <span>Expect our call to confirm details & schedule</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5" />
            <span>No hidden fees - just our flat hourly rate!</span>
          </li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="gradient-gold text-primary-foreground">
          <a href="tel:+13035551234">
            <Phone className="mr-2 w-4 h-4" />
            Call Us Now
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="/">
            <MessageCircle className="mr-2 w-4 h-4" />
            Chat With Us
          </a>
        </Button>
      </div>
    </div>
  );
}
