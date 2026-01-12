import { useState, useMemo } from "react";
import { Header, Footer, Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { QuoteConfirmation } from "@/components/QuoteConfirmation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { TrustBadges } from "@/components/TrustBadges";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  calculateQuote,
  SERVICE_TYPES,
  CREW_CONFIGURATIONS,
  type ServiceType,
} from "@/lib/quoteCalculator";
import { CheckCircle, Shield, Clock, Star, MapPin, Zap } from "lucide-react";

const BEDROOM_OPTIONS = [
  { value: "0", label: "Studio" },
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5", label: "5+ Bedrooms" },
];

export default function Quote() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [crewConfig, setCrewConfig] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [notes, setNotes] = useState("");
  const [preferEmailOnly, setPreferEmailOnly] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [callScheduled, setCallScheduled] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<number>(0);

  // Determine if bedrooms/crew config fields are needed
  const isLocalMoving = serviceType === 'local-moving';
  const isHeavyItems = serviceType === 'heavy-items';

  // Calculate quote (hidden from user)
  const quote = useMemo(() => {
    if (!serviceType) return null;
    return calculateQuote({
      serviceType: serviceType as ServiceType,
      bedrooms: isLocalMoving && bedrooms ? parseInt(bedrooms) : undefined,
      crewConfig: isLocalMoving ? crewConfig : undefined,
    });
  }, [serviceType, bedrooms, crewConfig, isLocalMoving]);

  // Form validation
  const canSubmit = phone && email && moveFrom && moveTo && serviceType && 
                    (isHeavyItems || (isLocalMoving && crewConfig));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !quote) return;
    
    setIsSubmitting(true);
    try {
      // Create lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: fullName,
          email,
          phone,
          property_type: serviceType,
          bedrooms: isLocalMoving && bedrooms ? parseInt(bedrooms) : null,
          move_from_address: moveFrom,
          move_to_address: moveTo,
          move_date: moveDate || null,
          notes: notes || null,
          estimated_quote: quote.total,
          status: 'new',
          prefer_email_only: preferEmailOnly,
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Create quote request
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .insert({
          lead_id: lead.id,
          property_type: serviceType,
          bedrooms: isLocalMoving && bedrooms ? parseInt(bedrooms) : null,
          total_quote: quote.total,
        });

      if (quoteError) throw quoteError;

      setSubmittedQuote(quote.total);
      setIsSubmitted(true);
      toast.success("Quote submitted! We'll contact you shortly.");

      // Send email quote (async)
      supabase.functions.invoke('send-quote-email', {
        body: {
          leadId: lead.id,
          customerName: fullName,
          email,
          phone,
          serviceType,
          crewSize: quote.crewSize,
          hourlyRate: quote.hourlyRate,
          estimatedHours: quote.estimatedHours,
          laborCost: quote.laborCost,
          specialtyFee: quote.specialtyFee,
          totalQuote: quote.total,
          moveDate: moveDate || undefined,
          moveFrom: moveFrom || undefined,
          moveTo: moveTo || undefined,
          notes: notes || undefined,
        }
      }).then(() => {
        setEmailSent(true);
        toast.success("Quote emailed successfully!");
      }).catch((err) => {
        console.error("Email error:", err);
      });

      // Schedule confirmation call if not email-only
      if (!preferEmailOnly) {
        supabase.functions.invoke('trigger-confirmation-call', {
          body: {
            leadId: lead.id,
            customerName: fullName,
            phone,
            email,
            serviceType,
            totalQuote: quote.total,
            moveDate: moveDate || undefined,
            crewSize: quote.crewSize,
            estimatedHours: quote.estimatedHours,
          }
        }).then(() => {
          setCallScheduled(true);
        }).catch((err) => {
          console.error("Call scheduling error:", err);
        });
      }

    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error("Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <Container className="relative z-10">
          {!isSubmitted ? (
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                {/* Denver Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Denver's Top-Rated Movers</span>
                </div>
                
                <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-primary mb-4">
                  Get Your Free Quote in <span className="text-accent">60 Seconds</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-6">
                  Fill out the form below and we'll contact you shortly with a detailed estimate.
                </p>
                
                {/* Trust indicators row */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  <GoogleReviewsBadge compact />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Same-Day Response</span>
                  </div>
                </div>
              </div>
              
              {/* Trust Badge Strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">USDOT Licensed</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">$2M+ Insured</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm text-primary font-medium">BBB A+ Rated</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">No Hidden Fees</span>
                </div>
              </div>

              {/* Form Card */}
              <form onSubmit={handleSubmit} className="glass-card border border-border rounded-2xl p-8 shadow-depth-3">
                {/* 2-Column Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-primary font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      className="bg-background"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-primary font-medium">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(878) 218-7397"
                      required
                      className="bg-background"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-primary font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="bg-background"
                    />
                  </div>

                  {/* Move Date */}
                  <div className="space-y-2">
                    <Label htmlFor="moveDate" className="text-primary font-medium">
                      Preferred Move Date
                    </Label>
                    <Input
                      id="moveDate"
                      type="date"
                      value={moveDate}
                      onChange={(e) => setMoveDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-background"
                    />
                  </div>

                  {/* Moving From */}
                  <div className="space-y-2">
                    <Label htmlFor="moveFrom" className="text-primary font-medium">
                      Moving From <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="moveFrom"
                      value={moveFrom}
                      onChange={(e) => setMoveFrom(e.target.value)}
                      placeholder="Address or ZIP Code"
                      required
                      className="bg-background"
                    />
                  </div>

                  {/* Moving To */}
                  <div className="space-y-2">
                    <Label htmlFor="moveTo" className="text-primary font-medium">
                      Moving To <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="moveTo"
                      value={moveTo}
                      onChange={(e) => setMoveTo(e.target.value)}
                      placeholder="Address or ZIP Code"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="mt-6 space-y-6">
                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-primary font-medium">
                      Select Service <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={serviceType}
                      onValueChange={(value) => {
                        setServiceType(value as ServiceType);
                        setCrewConfig("");
                        setBedrooms("");
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose a service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex flex-col">
                              <span>{service.label}</span>
                              <span className="text-xs text-muted-foreground">{service.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Crew Configuration - Only for Local Moving */}
                  {isLocalMoving && (
                    <div className="space-y-2">
                      <Label htmlFor="crewConfig" className="text-primary font-medium">
                        Crew & Truck Configuration <span className="text-red-500">*</span>
                      </Label>
                      <Select value={crewConfig} onValueChange={setCrewConfig}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select crew size and service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CREW_CONFIGURATIONS.map((config) => (
                            <SelectItem key={config.value} value={config.value}>
                              <div className="flex justify-between items-center gap-4">
                                <span>{config.label}</span>
                                <span className="text-accent font-semibold">${config.rate}/hr</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Labor Only = loading/unloading help without truck • Full Service = movers + truck included
                      </p>
                    </div>
                  )}

                  {/* Bedrooms - Optional for Local Moving */}
                  {isLocalMoving && (
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="text-primary font-medium">
                        Property Size (Optional)
                      </Label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select number of bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          {BEDROOM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-primary font-medium">
                      {isHeavyItems 
                        ? "Describe the Items You Need Moved" 
                        : "Briefly Tell Us About Your Move"
                      }
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isHeavyItems 
                        ? "Describe the heavy items (piano type, safe weight, appliance details, etc.)"
                        : "Any special requirements, heavy items, stairs, elevator access, etc."
                      }
                      rows={4}
                      className="bg-background resize-none"
                    />
                  </div>

                  {/* Email Only Preference */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="emailOnly"
                      checked={preferEmailOnly}
                      onCheckedChange={(checked) => setPreferEmailOnly(checked as boolean)}
                    />
                    <Label htmlFor="emailOnly" className="text-muted-foreground text-sm cursor-pointer">
                      I prefer email contact only (no phone calls)
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  {/* Mini testimonial */}
                  <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      "Best moving experience in Denver!" — Sarah M.
                    </span>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full gradient-gold text-primary-foreground font-semibold py-6 text-lg shadow-gold hover:shadow-gold-lg transition-all animate-glow-pulse"
                  >
                    {isSubmitting ? "Submitting..." : "Get My Free Quote"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    No obligation • Free estimate • Same-day response • Join 10,000+ happy Denver customers
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <QuoteConfirmation
              customerName={fullName || "Friend"}
              totalQuote={submittedQuote}
              email={email}
              emailSent={emailSent}
              callScheduled={callScheduled}
              preferEmailOnly={preferEmailOnly}
            />
          )}
        </Container>
      </section>

      <Footer />
      <VoiceAgent />
      <ChatWidget />
    </div>
  );
}