import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address");

interface ComingSoonSignupProps {
  serviceName: string;
  serviceSlug: string;
  compact?: boolean;
}

export function ComingSoonSignup({ serviceName, serviceSlug, compact = false }: ComingSoonSignupProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: "Invalid email",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store as a lead with special lead_source for service notifications
      const { error } = await supabase.from("leads").insert({
        full_name: "Service Interest",
        email: result.data,
        phone: "N/A",
        lead_source: `coming-soon:${serviceSlug}`,
        notes: `Interested in ${serviceName} - Coming Soon notification signup`,
        status: "new",
      });

      if (error) {
        // Check if it's a rate limit error
        if (error.message.includes("rate")) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setIsSubscribed(true);
      toast({
        title: "You're on the list!",
        description: `We'll notify you when ${serviceName} launches.`,
      });
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-2 ${compact ? "text-sm" : "p-4 rounded-xl bg-accent/10 border border-accent/30"}`}>
        <CheckCircle className="w-5 h-5 text-accent" />
        <span className="text-foreground font-medium">You'll be notified when we launch!</span>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading} className="shrink-0">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        </Button>
      </form>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-primary">Get Notified</h3>
          <p className="text-sm text-muted-foreground">Be the first to know when {serviceName} launches</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="gradient-gold text-white shadow-gold">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </>
          )}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-3">
        We'll only email you when this service launches. No spam, unsubscribe anytime.
      </p>
    </div>
  );
}
