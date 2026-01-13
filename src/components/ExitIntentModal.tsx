import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem("exitIntentShown");
    if (alreadyShown) {
      setHasTriggered(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport
      if (e.clientY <= 0 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Only add listener after a delay (let user browse first)
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasTriggered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      // Save lead with discount flag
      const { error } = await supabase.from("leads").insert({
        email: email.trim(),
        full_name: "Exit Intent Lead",
        phone: "",
        notes: "10% discount - Exit Intent capture",
        status: "new",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Discount code sent to your email!");
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in",
        "border border-border/50"
      )}>
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white p-8 pb-12">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
              <Gift className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold text-center">
            Wait! Don't Leave Empty-Handed
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-primary mb-2">
                  Get <span className="text-accent">10% OFF</span> Your Move
                </p>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you an exclusive discount code
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
                <Button 
                  type="submit" 
                  className="w-full h-12 gradient-gold text-white shadow-gold hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Get My 10% Discount"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

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
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                Check Your Email!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your 10% discount code is on its way. Use it when you book your move!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 gradient-gold text-white shadow-gold">
                  <Link to="/quote" onClick={() => setIsOpen(false)}>
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
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}