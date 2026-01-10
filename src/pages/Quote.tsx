import { useState, useMemo } from "react";
import { Header, Footer, Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceAgent } from "@/components/VoiceAgent";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  calculateQuote,
  SERVICE_TYPES,
  BEDROOM_OPTIONS,
  HOURS_OPTIONS,
  SPECIALTY_ITEMS,
  INCLUDED_WITH_EVERY_MOVE,
  type ServiceType,
  type QuoteBreakdown,
} from "@/lib/quoteCalculator";
import { 
  ArrowRight, ArrowLeft, Check, Phone, Clock, Users, 
  Home, Building2, Truck, Zap, Trash2, Weight, Gamepad2, HelpCircle,
  CheckCircle
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const serviceIcons: Record<string, React.ElementType> = {
  'apartment-condo': Building2,
  'house-townhouse': Home,
  'labor-only': Users,
  'commercial': Building2,
  'heavy-items': Weight,
  'pool-table': Gamepad2,
  'junk-removal': Trash2,
  'same-day': Zap,
};

export default function Quote() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [estimatedHours, setEstimatedHours] = useState<number>(3);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>([]);
  const [moveDate, setMoveDate] = useState<string>("");
  
  // Address inputs
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");
  
  // Contact info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Determine what fields to show based on service type
  const needsBedrooms = ['apartment-condo', 'house-townhouse', 'same-day'].includes(serviceType);
  const needsHours = serviceType === 'labor-only';
  const needsSpecialtyItems = ['heavy-items', 'pool-table'].includes(serviceType);

  // Calculate quote in real-time
  const quote: QuoteBreakdown | null = useMemo(() => {
    if (!serviceType) return null;
    return calculateQuote({
      serviceType: serviceType as ServiceType,
      bedrooms: needsBedrooms ? bedrooms : undefined,
      estimatedHours: needsHours ? estimatedHours : undefined,
      specialtyItems: selectedSpecialty.length > 0 ? selectedSpecialty : undefined,
      moveDate: moveDate ? new Date(moveDate) : undefined,
    });
  }, [serviceType, bedrooms, estimatedHours, selectedSpecialty, moveDate, needsBedrooms, needsHours]);

  const handleSpecialtyToggle = (value: string) => {
    setSelectedSpecialty(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!quote || !serviceType) return;
    
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
          bedrooms: needsBedrooms ? bedrooms : null,
          move_from_address: moveFrom,
          move_to_address: moveTo,
          move_date: moveDate || null,
          has_specialty_items: selectedSpecialty.length > 0,
          specialty_items: selectedSpecialty.length > 0 ? selectedSpecialty : null,
          estimated_quote: quote.total,
          status: 'new',
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
          bedrooms: needsBedrooms ? bedrooms : null,
          specialty_items: selectedSpecialty.length > 0 ? selectedSpecialty : null,
          specialty_fee: quote.specialtyFee,
          total_quote: quote.total,
        });

      if (quoteError) throw quoteError;

      toast.success("Quote submitted! We'll be in touch within 10 minutes.");
      setStep(4);
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error("Failed to submit quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!serviceType;
      case 2:
        return true; // Move details are optional but helpful
      case 3:
        return fullName && email && phone;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <Container>
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4">
              Get Your <span className="text-gradient-gold">Free Quote</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Flat hourly rates, no hidden fees. Get your quote in less than 10 minutes.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Same-Day Response Guaranteed</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      step >= s
                        ? "gradient-gold text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-20 sm:w-32 lg:w-40 h-1 mx-2 transition-colors ${
                        step > s ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Service Type</span>
              <span>Details</span>
              <span>Contact</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border">
                {/* Step 1: Service Type */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      What type of move do you need?
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_TYPES.map((service) => {
                        const Icon = serviceIcons[service.value] || HelpCircle;
                        return (
                          <button
                            key={service.value}
                            onClick={() => {
                              setServiceType(service.value as ServiceType);
                              setSelectedSpecialty([]);
                            }}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              serviceType === service.value
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            <Icon className={`w-6 h-6 mb-2 ${serviceType === service.value ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="font-medium text-foreground text-sm">{service.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Conditional Fields Based on Service */}
                    {needsBedrooms && serviceType && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <Label>Number of Bedrooms</Label>
                        <div className="flex flex-wrap gap-2">
                          {(BEDROOM_OPTIONS[serviceType as keyof typeof BEDROOM_OPTIONS] || []).map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setBedrooms(opt.value)}
                              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                bedrooms === opt.value
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {needsHours && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <Label>Estimated Hours Needed</Label>
                        <div className="flex flex-wrap gap-2">
                          {HOURS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setEstimatedHours(opt.value)}
                              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                estimatedHours === opt.value
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {needsSpecialtyItems && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <Label>Select Items to Move</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {SPECIALTY_ITEMS.filter(item => 
                            serviceType === 'pool-table' 
                              ? item.value.includes('pool-table')
                              : !item.value.includes('pool-table')
                          ).map((item) => (
                            <button
                              key={item.value}
                              onClick={() => handleSpecialtyToggle(item.value)}
                              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                selectedSpecialty.includes(item.value)
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              <p className="font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-primary">+${item.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Move Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Where are you moving?
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="moveFrom">Moving From (Address or Area)</Label>
                        <Input
                          id="moveFrom"
                          value={moveFrom}
                          onChange={(e) => setMoveFrom(e.target.value)}
                          placeholder="e.g., 123 Main St, Denver or Capitol Hill"
                          className="mt-2"
                        />
                      </div>
                      
                      {serviceType !== 'labor-only' && serviceType !== 'junk-removal' && (
                        <div>
                          <Label htmlFor="moveTo">Moving To (Address or Area)</Label>
                          <Input
                            id="moveTo"
                            value={moveTo}
                            onChange={(e) => setMoveTo(e.target.value)}
                            placeholder="e.g., 456 Oak Ave, Aurora or Cherry Creek"
                            className="mt-2"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="moveDate">Preferred Move Date</Label>
                        <Input
                          id="moveDate"
                          type="date"
                          value={moveDate}
                          onChange={(e) => setMoveDate(e.target.value)}
                          className="mt-2"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Same-day moves available! Call us at (303) 555-1234
                        </p>
                      </div>
                    </div>

                    {/* Optional: Add specialty items for regular moves */}
                    {!needsSpecialtyItems && serviceType !== 'junk-removal' && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <Label>Any Specialty Items? (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {SPECIALTY_ITEMS.filter(item => !item.value.includes('pool-table')).slice(0, 6).map((item) => (
                            <button
                              key={item.value}
                              onClick={() => handleSpecialtyToggle(item.value)}
                              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                selectedSpecialty.includes(item.value)
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              <p className="font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-primary">+${item.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Contact Info */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Where should we send your quote?
                    </h2>
                    <p className="text-muted-foreground">
                      We'll respond within 10 minutes during business hours.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Smith"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(303) 555-1234"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                      Quote Submitted!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      We've received your request and will contact you within 10 minutes 
                      during business hours to confirm your quote and schedule.
                    </p>
                    <Button asChild className="gradient-gold text-primary-foreground">
                      <a href="tel:+13035551234">
                        <Phone className="mr-2 w-4 h-4" />
                        Call Us Now
                      </a>
                    </Button>
                  </div>
                )}

                {/* Navigation */}
                {step < 4 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      disabled={step === 1}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    
                    {step < 3 ? (
                      <Button
                        onClick={() => setStep((s) => (s + 1) as Step)}
                        disabled={!canProceed()}
                        className="gradient-gold text-primary-foreground"
                      >
                        Continue
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!canProceed() || isSubmitting}
                        className="gradient-gold text-primary-foreground"
                      >
                        {isSubmitting ? "Submitting..." : "Get My Quote"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quote Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="p-6 rounded-2xl bg-card border border-border mb-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                    Your Estimate
                  </h3>
                  
                  {quote ? (
                    <div className="space-y-4">
                      {/* Crew & Rate */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {quote.crewSize} Movers + Truck
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${quote.hourlyRate}/hr
                          </p>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            ~{quote.estimatedHours} Hours Estimated
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Labor: ${quote.laborCost}
                          </p>
                        </div>
                      </div>

                      {/* Specialty Fee */}
                      {quote.specialtyFee > 0 && (
                        <div className="flex justify-between text-sm py-2 border-t border-border">
                          <span className="text-muted-foreground">Specialty Items</span>
                          <span className="text-foreground">+${quote.specialtyFee}</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between">
                          <span className="font-serif text-lg font-semibold text-foreground">Estimated Total</span>
                          <span className="font-serif text-2xl font-bold text-gradient-gold">${quote.total}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Final price based on actual hours. No hidden fees!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Select a service type to see your estimate.
                    </p>
                  )}
                </div>

                {/* What's Included */}
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="font-medium text-foreground mb-3">Everything Included:</h4>
                  <ul className="space-y-2">
                    {INCLUDED_WITH_EVERY_MOVE.slice(0, 5).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
      <VoiceAgent />
    </div>
  );
}
