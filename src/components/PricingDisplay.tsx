import { Container } from "@/components/layout";
import { HOURLY_RATES, INCLUDED_WITH_EVERY_MOVE, ELECTRONIC_PAYMENT_FEE, CREW_CONFIGURATIONS } from "@/lib/quoteCalculator";
import { CheckCircle, Users, Truck, Dumbbell, Info, Zap, Building, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Local Moving pricing tiers
const localMovingTiers = CREW_CONFIGURATIONS.map(config => ({
  ...config,
  isLabor: !config.hasTruck,
}));

export function PricingDisplay() {
  return (
    <section className="relative py-20 bg-secondary overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4">
            Simple, <span className="text-accent">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            No hidden fees, no surprises. Flat hourly rates that include everything.
          </p>
          <Badge className="bg-accent/10 text-accent border-accent/30 shadow-depth-1">
            <Zap className="w-3 h-3 mr-1" />
            Same-Day Service Available for All Services
          </Badge>
        </div>
        
        <Tabs defaultValue="local-moving" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 glass-card p-1">
            <TabsTrigger value="local-moving" className="flex items-center gap-2 data-[state=active]:shadow-depth-1">
              <Truck className="w-4 h-4" />
              Local Moving
            </TabsTrigger>
            <TabsTrigger value="heavy-items" className="flex items-center gap-2 data-[state=active]:shadow-depth-1">
              <Dumbbell className="w-4 h-4" />
              Heavy Items
            </TabsTrigger>
          </TabsList>
          
          {/* Local Moving Tab */}
          <TabsContent value="local-moving">
            {/* Service Types */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-depth-1">
                <Building className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Apartments & Condos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-depth-1">
                <Home className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Houses & Townhouses</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card shadow-depth-1">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Labor-Only Help</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {localMovingTiers.map((tier) => {
                const isPopular = 'popular' in tier && tier.popular;
                return (
                <div
                  key={tier.value}
                  className={`p-5 rounded-2xl border relative transition-all hover-lift ${
                    isPopular 
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-glow-primary' 
                      : 'bg-background border-border shadow-depth-2 hover:shadow-depth-3'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-gold text-white text-xs font-medium rounded-full whitespace-nowrap shadow-gold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-accent" />
                    {tier.hasTruck && <Truck className="w-4 h-4 text-accent" />}
                  </div>
                  
                  <div className="mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tier.hasTruck 
                        ? 'bg-accent/10 text-accent' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tier.hasTruck ? 'Full Service' : 'Labor Only'}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-base font-semibold text-primary mb-1 mt-2">
                    {tier.label}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-foreground">${tier.rate}</span>
                    <span className="text-muted-foreground text-sm">/hr</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
              )})}
            </div>
          </TabsContent>
          
          {/* Heavy Items Tab */}
          <TabsContent value="heavy-items">
            <div className="max-w-2xl mx-auto">
              <div className="p-8 rounded-2xl bg-background border border-border shadow-depth-3 text-center hover-lift">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
                  <Dumbbell className="w-8 h-8 text-accent" />
                </div>
                
                <h3 className="font-heading text-2xl font-semibold text-primary mb-2">
                  Heavy Items Moving
                </h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">${HOURLY_RATES['heavy-items']}</span>
                  <span className="text-muted-foreground">/hr</span>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Professional handling for oversized and heavy items
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-6">
                  {[
                    'Pianos (Upright & Grand)',
                    'Pool Tables',
                    'Safes (Under 200 lbs)',
                    'Safes (200+ lbs)',
                    'Appliances',
                    'Gym Equipment',
                    'Hot Tubs',
                    'Gun Safes',
                    'Commercial Equipment'
                  ].map((item) => (
                    <span key={item} className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs shadow-depth-1">
                      {item}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Final quote varies based on item complexity and access
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Electronic Payment Fee Notice */}
        <div className="flex items-center justify-center gap-2 mt-6 p-3 rounded-lg glass-card max-w-md mx-auto">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            +${ELECTRONIC_PAYMENT_FEE} processing fee for card/electronic payments
          </p>
        </div>
        
        {/* What's Included */}
        <div className="p-8 rounded-2xl bg-background border border-border shadow-depth-3 mt-12">
          <h3 className="font-heading text-xl font-semibold text-primary mb-6 text-center">
            Everything Included — No Extra Charges
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INCLUDED_WITH_EVERY_MOVE.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 hover-lift animate-glow-pulse">
              <Link to="/quote">Get Your Free Quote</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
