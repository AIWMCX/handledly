import { useState, useEffect } from "react";
import { Check, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteConfirmationProps {
  customerName: string;
  firstName?: string;
  totalQuote: number;
  email: string;
  emailSent: boolean;
  callScheduled: boolean;
  preferEmailOnly: boolean;
}

export function QuoteConfirmation({
  customerName,
  firstName,
  email,
  emailSent,
  callScheduled,
  preferEmailOnly,
}: QuoteConfirmationProps) {
  // 30-second countdown for the call
  const [callCountdown, setCallCountdown] = useState(30);
  const displayName = firstName || customerName.split(' ')[0] || 'Friend';

  useEffect(() => {
    if (!preferEmailOnly && callScheduled && callCountdown > 0) {
      const timer = setInterval(() => {
        setCallCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [preferEmailOnly, callScheduled, callCountdown]);

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <h2 className="font-heading text-3xl font-semibold text-primary mb-3">
        Thank You, {displayName}!
      </h2>
      
      <p className="text-muted-foreground mb-8 text-lg">
        Your quote request has been received. We're honored you chose Handled 
        for your moving needs!
      </p>

      {/* Status indicators */}
      <div className="space-y-3 mb-8">
        {/* Email Status */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-card">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            emailSent ? 'bg-green-500/20' : 'bg-secondary'
          }`}>
            <Mail className={`w-5 h-5 ${emailSent ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">
              {emailSent ? 'Confirmation email sent!' : 'Sending confirmation email...'}
            </p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          {emailSent && <Check className="w-5 h-5 text-green-600" />}
        </div>

        {/* Call Status with Countdown */}
        {!preferEmailOnly && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-card">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              callCountdown === 0 ? 'bg-accent/20 animate-pulse' : callScheduled ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              <Phone className={`w-5 h-5 ${
                callCountdown === 0 ? 'text-accent' : callScheduled ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">
                {callCountdown === 0 
                  ? '📱 Calling you now!' 
                  : callScheduled 
                    ? `📱 We'll call you in ${callCountdown} seconds...`
                    : 'Preparing your callback...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {callCountdown === 0 
                  ? 'Please answer your phone!'
                  : 'Our friendly team will confirm your quote'}
              </p>
            </div>
            {callScheduled && callCountdown > 0 && (
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">{callCountdown}</span>
              </div>
            )}
            {callCountdown === 0 && (
              <Clock className="w-5 h-5 text-accent animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* What to expect */}
      <div className="p-5 rounded-xl bg-secondary border border-border mb-8 text-left">
        <h3 className="font-semibold text-primary mb-3">What Happens Next?</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <span>Check your inbox for a detailed quote breakdown</span>
          </li>
          {!preferEmailOnly && (
            <li className="flex items-start gap-3">
              <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>
                {callCountdown > 0 
                  ? `Answer our call in ${callCountdown} seconds to confirm details`
                  : 'Answer our call now to confirm your move!'}
              </span>
            </li>
          )}
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <span>We'll finalize your booking and send a confirmation</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <span>No hidden fees — transparent, flat-rate pricing</span>
          </li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="gradient-gold text-primary-foreground font-semibold shadow-gold">
          <a href="tel:+18782187397">
            <Phone className="mr-2 w-4 h-4" />
            Call Us Now
          </a>
        </Button>
        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
          <a href="/">
            <MessageCircle className="mr-2 w-4 h-4" />
            Back to Home
          </a>
        </Button>
      </div>
    </div>
  );
}
