import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  // Hide on quote page - user is already there!
  const isQuotePage = location.pathname === '/quote';

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (approx 500px)
      const shouldShow = window.scrollY > 500;
      setIsVisible(shouldShow && !isDismissed && !isQuotePage);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed, isQuotePage]);

  if (!isVisible || isQuotePage) return null;

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
          {/* Left: Message with urgency */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Online indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-medium text-xs uppercase tracking-wide">Online Now</span>
            </div>
            <span className="text-white font-medium text-sm">
              Ready to move? Get your free quote now
            </span>
          </div>

          {/* Center/Right: CTAs */}
          <div className="flex items-center gap-3 flex-1 sm:flex-none justify-center sm:justify-end">
            <div className="flex items-center gap-3">
              <a
                href="tel:+18782187397"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium group"
              >
                {/* Pulsing phone icon */}
                <div className="relative">
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                </div>
                <span className="hidden md:inline">(878) 218-7397</span>
                <span className="md:hidden">Call</span>
              </a>
              <a
                href="tel:+17199203282"
                className="hidden lg:flex items-center text-white/70 hover:text-white transition-colors text-sm"
              >
                (719) 920-3282
              </a>
            </div>
            
            <Button 
              asChild 
              size="sm"
              className="gradient-gold text-white shadow-gold hover:opacity-90 relative overflow-hidden group"
            >
              <Link to="/quote">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 group-hover:animate-pulse" />
                Get Free Quote
                <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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