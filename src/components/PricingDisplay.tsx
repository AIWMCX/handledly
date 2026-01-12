import { Container } from "@/components/layout";
import { HOURLY_RATES, INCLUDED_WITH_EVERY_MOVE, ELECTRONIC_PAYMENT_FEE, CREW_CONFIGURATIONS } from "@/lib/quoteCalculator";
import { CheckCircle, Users, Truck, Dumbbell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Local Moving pricing tiers
const localMovingTiers = CREW_CONFIGURATIONS.map(config => ({
  ...config,
  isLabor: !config.hasTruck,
}));

export function PricingDisplay() {
  return (
    <section className="py-20 bg-secondary">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4">
            Simple, <span className="text-accent">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no surprises. Flat hourly rates that include everything.
          </p>
        </div>
        
        <Tabs defaultValue="local-moving" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="local-moving" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Local Moving
            </TabsTrigger>
            <TabsTrigger value="heavy-items" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Heavy Items
            </TabsTrigger>
          </TabsList>
          
          {/* Local Moving Tab */}
          <TabsContent value="local-moving">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {localMovingTiers.map((tier) => {
                const isPopular = 'popular' in tier && tier.popular;
                return (
                <div
                  key={tier.value}
                  className={`p-5 rounded-2xl border shadow-card relative ${
                    isPopular 
                      ? 'bg-primary/5 border-primary ring-2 ring-primary/20' 
                      : 'bg-background border-border'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-gold text-white text-xs font-medium rounded-full whitespace-nowrap">
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
              <div className="p-8 rounded-2xl bg-background border border-border shadow-card text-center">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
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
                
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {['Pianos', 'Safes', 'Appliances', 'Pool Tables', 'Gym Equipment', 'Hot Tubs'].map((item) => (
                    <span key={item} className="px-3 py-1 rounded-full bg-secondary border border-border">
                      {item}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Final quote varies based on item complexity and access
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Electronic Payment Fee Notice */}
        <div className="flex items-center justify-center gap-2 mt-6 p-3 rounded-lg bg-muted/50 border border-border max-w-md mx-auto">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            +${ELECTRONIC_PAYMENT_FEE} processing fee for card/electronic payments
          </p>
        </div>
        
        {/* What's Included */}
        <div className="p-8 rounded-2xl bg-background border border-border shadow-card mt-12">
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
            <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90">
              <Link to="/quote">Get Your Free Quote</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
