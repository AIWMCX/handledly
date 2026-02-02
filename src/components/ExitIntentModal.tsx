import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, ArrowRight, CheckCircle, Phone, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useExitIntent } from "@/hooks/useExitIntent";
import { ConversionEvents } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";

// A/B Test variants
type OfferVariant = 'discount_10' | 'free_supplies' | 'priority_booking';

const OFFER_VARIANTS: Record<OfferVariant, { title: string; subtitle: string; buttonText: string; value: string }> = {
  discount_10: {
    title: "10% OFF",
    subtitle: "Your Move",
    buttonText: "Get My 10% Discount",
    value: "10% discount",
  },
  free_supplies: {
    title: "FREE",
    subtitle: "Packing Supplies",
    buttonText: "Claim Free Supplies",
    value: "Free packing supplies",
  },
  priority_booking: {
    title: "PRIORITY",
    subtitle: "Scheduling",
    buttonText: "Get Priority Booking",
    value: "Priority scheduling",
  },
};

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [variant] = useState<OfferVariant>(() => {
    // Random A/B test variant selection
    const variants: OfferVariant[] = ['discount_10', 'free_supplies', 'priority_booking'];
    return variants[Math.floor(Math.random() * variants.length)];
  });

  const currentOffer = OFFER_VARIANTS[variant];

  // Use exit intent hook
  const { hasTriggered } = useExitIntent({
    onTrigger: () => {
      const alreadyShown = sessionStorage.getItem("exitIntentShown");
      if (!alreadyShown) {
        setIsOpen(true);
        sessionStorage.setItem("exitIntentShown", "true");
        ConversionEvents.exitIntentTriggered(variant);
      }
    },
    delay: 5000,
    sensitivity: 20,
  });

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        email: email.trim(),
        phone: phone.trim() || "",
        full_name: "Exit Intent Lead",
        notes: `${currentOffer.value} - Exit Intent capture (Variant: ${variant})`,
        status: "new",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Discount code sent to your email!");
      ConversionEvents.exitIntentConverted(variant, email);
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden",
              "border border-border/50"
            )}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white p-8 pb-12">
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />

              {/* Countdown timer */}
              {!isSubmitted && countdown > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Expires in {formatTime(countdown)}</span>
                </div>
              )}

              <div className="flex justify-center mb-4 mt-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                >
                  <Gift className="w-8 h-8 text-accent" />
                </motion.div>
              </div>
              <h2 className="font-heading text-2xl font-bold text-center text-white drop-shadow-sm">
                Wait! Don't Leave Empty-Handed
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 pt-0">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <p className="text-lg font-semibold text-primary mb-2">
                      Get <span className="text-accent">{currentOffer.title}</span> {currentOffer.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enter your details and we'll send you an exclusive offer
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                    <Input
                      type="tel"
                      placeholder="Phone (optional - for quick callback)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 text-base"
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 gradient-gold text-white shadow-gold hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : currentOffer.buttonText}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>

                  {/* Quick action buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-11 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Link to="/quote" onClick={handleClose}>
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Quote
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-11 border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      <a href="tel:+18782187397">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Or call Denver direct: <a href="tel:+17199203282" className="font-medium hover:text-accent">(719) 920-3282</a>
                  </p>

                  <div className="mt-6 space-y-2">
                    {["No spam, ever", "Unsubscribe anytime", "Limited time offer"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </motion.div>
                  <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                    Check Your Email!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your exclusive offer is on its way. Use it when you book your move!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1 gradient-gold text-white shadow-gold">
                      <Link to="/quote" onClick={handleClose}>
                        Get Your Quote Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <a href="tel:+18782187397">
                        <Phone className="mr-2 w-4 h-4" />
                        Call Us
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* No thanks link */}
              <button
                onClick={handleClose}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}