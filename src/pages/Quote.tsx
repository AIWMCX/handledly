import { useState, useMemo } from "react";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { VoiceAgent } from "@/components/VoiceAgent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  calculateQuote,
  DENVER_ZONES,
  PROPERTY_TYPES,
  SPECIALTY_ITEMS,
  type QuoteInput,
  type QuoteBreakdown,
} from "@/lib/quoteCalculator";
import { ArrowRight, ArrowLeft, Check, Phone, DollarSign, Clock, Users } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function Quote() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [propertyType, setPropertyType] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [hasStairs, setHasStairs] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [originZone, setOriginZone] = useState<string>("");
  const [destinationZone, setDestinationZone] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>([]);
  const [packingServices, setPackingServices] = useState(false);
  const [moveDate, setMoveDate] = useState<string>("");
  
  // Contact info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Calculate quote in real-time
  const quoteInput: QuoteInput = useMemo(() => ({
    propertyType: propertyType as QuoteInput['propertyType'],
    bedrooms,
    floorNumber,
    hasStairs,
    hasElevator,
    originZone,
    destinationZone,
    specialtyItems: selectedSpecialty,
    packingServices,
    moveDate: moveDate ? new Date(moveDate) : undefined,
  }), [propertyType, bedrooms, floorNumber, hasStairs, hasElevator, originZone, destinationZone, selectedSpecialty, packingServices, moveDate]);

  const quote: QuoteBreakdown | null = useMemo(() => {
    if (!propertyType || !originZone || !destinationZone) return null;
    return calculateQuote(quoteInput);
  }, [quoteInput, propertyType, originZone, destinationZone]);

  const handleSpecialtyToggle = (value: string) => {
    setSelectedSpecialty(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!quote) return;
    
    setIsSubmitting(true);
    try {
      // Create lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: fullName,
          email,
          phone,
          property_type: propertyType,
          bedrooms,
          move_from_address: originZone,
          move_to_address: destinationZone,
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
          property_type: propertyType,
          bedrooms,
          floor_number: floorNumber,
          has_stairs: hasStairs,
          distance_zone: `${originZone} → ${destinationZone}`,
          specialty_items: selectedSpecialty.length > 0 ? selectedSpecialty : null,
          base_price: quote.basePrice,
          distance_fee: quote.distanceFee,
          stairs_fee: quote.stairsFee,
          specialty_fee: quote.specialtyFee,
          total_quote: quote.total,
        });

      if (quoteError) throw quoteError;

      toast.success("Quote submitted! We'll be in touch shortly.");
      setStep(5);
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
        return !!propertyType;
      case 2:
        return !!originZone && !!destinationZone;
      case 3:
        return true; // Specialty items are optional
      case 4:
        return fullName && email && phone;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <Container>
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4">
              Get Your <span className="text-gradient-gold">Free Quote</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Answer a few questions and get an instant estimate for your move.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
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
                  {s < 4 && (
                    <div
                      className={`w-16 sm:w-24 lg:w-32 h-1 mx-2 transition-colors ${
                        step > s ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Property</span>
              <span>Location</span>
              <span>Details</span>
              <span>Contact</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border">
                {/* Step 1: Property Type */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      What type of property are you moving from?
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setPropertyType(type.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            propertyType === type.value
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {propertyType && propertyType !== 'studio' && propertyType !== 'storage' && (
                      <div className="space-y-4 pt-4">
                        <Label>Number of Bedrooms: {bedrooms}</Label>
                        <Slider
                          value={[bedrooms]}
                          onValueChange={([value]) => setBedrooms(value)}
                          min={1}
                          max={7}
                          step={1}
                          className="py-4"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <Label>Floor Number: {floorNumber}</Label>
                      <Slider
                        value={[floorNumber]}
                        onValueChange={([value]) => setFloorNumber(value)}
                        min={1}
                        max={20}
                        step={1}
                        className="py-4"
                      />
                      
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="stairs"
                            checked={hasStairs}
                            onCheckedChange={(checked) => setHasStairs(!!checked)}
                          />
                          <Label htmlFor="stairs" className="cursor-pointer">Has stairs (no elevator)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="elevator"
                            checked={hasElevator}
                            onCheckedChange={(checked) => setHasElevator(!!checked)}
                          />
                          <Label htmlFor="elevator" className="cursor-pointer">Has elevator</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Where are you moving from and to?
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Moving From</Label>
                        <Select value={originZone} onValueChange={setOriginZone}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {DENVER_ZONES.map((zone) => (
                              <SelectItem key={zone.value} value={zone.value}>
                                {zone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Moving To</Label>
                        <Select value={destinationZone} onValueChange={setDestinationZone}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {DENVER_ZONES.map((zone) => (
                              <SelectItem key={zone.value} value={zone.value}>
                                {zone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Preferred Move Date (Optional)</Label>
                        <Input
                          type="date"
                          value={moveDate}
                          onChange={(e) => setMoveDate(e.target.value)}
                          className="mt-2"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Specialty Items */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Any specialty items to move?
                    </h2>
                    <p className="text-muted-foreground">Select all that apply. These require special handling.</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIALTY_ITEMS.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => handleSpecialtyToggle(item.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedSpecialty.includes(item.value)
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-primary">+${item.price}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Checkbox
                        id="packing"
                        checked={packingServices}
                        onCheckedChange={(checked) => setPackingServices(!!checked)}
                      />
                      <Label htmlFor="packing" className="cursor-pointer">
                        Add professional packing services (+35% of base)
                      </Label>
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Info */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Where should we send your quote?
                    </h2>
                    
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

                {/* Step 5: Confirmation */}
                {step === 5 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                      Quote Submitted!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      We've received your request and will contact you within 2 hours 
                      during business hours to confirm your quote.
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
                {step < 5 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      disabled={step === 1}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    
                    {step < 4 ? (
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

            {/* Quote Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Your Estimate
                </h3>
                
                {quote ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base price</span>
                      <span className="text-foreground">${quote.basePrice}</span>
                    </div>
                    {quote.bedroomFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bedroom fee</span>
                        <span className="text-foreground">+${quote.bedroomFee}</span>
                      </div>
                    )}
                    {quote.distanceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Distance fee</span>
                        <span className="text-foreground">+${quote.distanceFee}</span>
                      </div>
                    )}
                    {quote.stairsFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stairs/floor fee</span>
                        <span className="text-foreground">+${quote.stairsFee}</span>
                      </div>
                    )}
                    {quote.specialtyFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Specialty items</span>
                        <span className="text-foreground">+${quote.specialtyFee}</span>
                      </div>
                    )}
                    {quote.packingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Packing services</span>
                        <span className="text-foreground">+${quote.packingFee}</span>
                      </div>
                    )}
                    {quote.seasonalAdjustment !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Seasonal adjustment</span>
                        <span className="text-foreground">
                          {quote.seasonalAdjustment > 0 ? '+' : ''}${quote.seasonalAdjustment}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Estimate</span>
                        <span className="font-serif text-2xl font-bold text-primary">${quote.total}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Est. {quote.estimatedHours} hours</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{quote.crewSize} crew members</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Complete the form to see your estimate
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    This is an estimate. Final pricing may vary based on actual inventory and conditions.
                  </p>
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