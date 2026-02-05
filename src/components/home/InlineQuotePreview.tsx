import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Container, Section, SectionHeader } from "@/components/layout";
import { HOURLY_RATES, BEDROOM_OPTIONS, calculateQuote } from "@/lib/quoteCalculator";
import { ArrowRight, Calculator, Clock, Users, Truck, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversionEvents } from "@/lib/analytics";

const crewOptions = [
  { value: 'moving-2-movers', label: '2 Movers + Truck', rate: HOURLY_RATES['moving-2-movers'] },
  { value: 'moving-3-movers', label: '3 Movers + Truck', rate: HOURLY_RATES['moving-3-movers'] },
  { value: 'labor-2-movers', label: '2 Movers (Labor Only)', rate: HOURLY_RATES['labor-2-movers'] },
  { value: 'labor-3-movers', label: '3 Movers (Labor Only)', rate: HOURLY_RATES['labor-3-movers'] },
];

export default function InlineQuotePreview() {
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [crewConfig, setCrewConfig] = useState<string>('moving-2-movers');
  const [hasInteracted, setHasInteracted] = useState(false);

  const quote = useMemo(() => {
    return calculateQuote({
      serviceType: 'local-moving',
      subType: 'apartment-condo',
      bedrooms,
      crewConfig,
    });
  }, [bedrooms, crewConfig]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      ConversionEvents.formStarted('inline_quote_preview');
    }
  };

  const handleGetQuote = () => {
    ConversionEvents.quotePreviewed('local-moving', quote.total);
  };

  // Calculate price range (±10%)
  const lowEstimate = Math.round(quote.total * 0.9);
  const highEstimate = Math.round(quote.total * 1.1);

  const selectedCrew = crewOptions.find(c => c.value === crewConfig);

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute inset-0 bg-mesh-section pointer-events-none opacity-50" />
      <Container className="relative z-10">
        <SectionHeader 
          title="Get Your Quote in 60 Seconds" 
          subtitle="See your estimated cost instantly — no email required."
        />

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Quote Calculator */}
            <div className="p-6 rounded-2xl bg-background border border-border shadow-depth-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-primary">Quick Estimate</h3>
                  <p className="text-sm text-muted-foreground">Adjust to see your price</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Bedrooms */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Home Size
                  </label>
                  <Select 
                    value={bedrooms.toString()} 
                    onValueChange={(v) => { setBedrooms(parseInt(v)); handleInteraction(); }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BEDROOM_OPTIONS['local-moving'].map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Crew Size */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Crew & Truck
                  </label>
                  <Select 
                    value={crewConfig} 
                    onValueChange={(v) => { setCrewConfig(v); handleInteraction(); }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crewOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} — ${opt.rate}/hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* What's Included */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Included Free</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['Moving truck', 'Packing materials', 'Furniture assembly', 'No stair fees'].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-white shadow-depth-3 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-white/80">Your Estimated Total</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl lg:text-5xl font-heading font-bold">${lowEstimate}</span>
                    <span className="text-2xl text-white/70">—</span>
                    <span className="text-4xl lg:text-5xl font-heading font-bold">${highEstimate}</span>
                  </div>
                  <p className="text-sm text-white/70">Final price depends on actual time</p>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4" />
                      {selectedCrew?.label}
                    </span>
                    <span className="font-medium">${quote.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="flex items-center gap-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      Estimated hours
                    </span>
                    <span className="font-medium">{quote.estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2 text-white/80">
                      <Truck className="w-4 h-4" />
                      Truck & materials
                    </span>
                    <span className="font-medium text-accent">Included</span>
                  </div>
                </div>

                <Button 
                  asChild 
                  size="lg" 
                  className="w-full gradient-gold text-white shadow-gold hover:opacity-90 h-14 text-lg"
                  onClick={handleGetQuote}
                >
                  <Link to={`/quote?bedrooms=${bedrooms}&crew=${crewConfig}`}>
                    Get Exact Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-white/60 mt-3">
                  Free quote • No commitment • 60 seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
