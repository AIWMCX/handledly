import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (approx 500px)
      const shouldShow = window.scrollY > 500;
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-300",
        "bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Message */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white font-medium text-sm">
              Ready to move? Get your free quote now
            </span>
          </div>

          {/* Center/Right: CTAs */}
          <div className="flex items-center gap-3 flex-1 sm:flex-none justify-center sm:justify-end">
            <a
              href="tel:+18782187397"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline">(878) 218-7397</span>
              <span className="md:hidden">Call</span>
            </a>
            
            <Button 
              asChild 
              size="sm"
              className="gradient-gold text-white shadow-gold hover:opacity-90"
            >
              <Link to="/quote">
                Get Free Quote
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
