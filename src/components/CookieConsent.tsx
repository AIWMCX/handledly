import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

type ConsentStatus = "accepted" | "declined" | null;

function getStoredConsent(): ConsentStatus {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    const { status, expiry } = JSON.parse(stored);
    if (new Date(expiry) < new Date()) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return status as ConsentStatus;
  } catch {
    return null;
  }
}

function setStoredConsent(status: "accepted" | "declined") {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ status, expiry: expiry.toISOString() }));
}

/** Disables GA4 tracking by setting the opt-out window property */
function disableGA() {
  (window as any)["ga-disable-G-QZBNDFDW9Q"] = true;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === null) {
      // Show banner after a short delay to not block initial render
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    if (consent === "declined") {
      disableGA();
    }
  }, []);

  const handleAccept = () => {
    setStoredConsent("accepted");
    dismiss();
  };

  const handleDecline = () => {
    setStoredConsent("declined");
    disableGA();
    dismiss();
  };

  const dismiss = () => {
    setAnimateOut(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[70] rounded-2xl border border-border bg-background shadow-depth-3 p-5 transition-all duration-300",
        animateOut ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">We value your privacy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use cookies and Google Analytics to improve your experience and analyze site traffic. 
            No data is shared with third-party advertisers.{" "}
            <a href="/privacy" className="text-primary underline hover:text-primary/80">
              Privacy Policy
            </a>
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleAccept}
              className="gradient-gold text-primary-foreground text-xs h-8 px-4"
            >
              Accept All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              className="text-xs h-8 px-4 border-border"
            >
              Decline
            </Button>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss cookie consent"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
