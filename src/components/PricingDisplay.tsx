import { Container } from "@/components/layout";
import { HOURLY_RATES, INCLUDED_WITH_EVERY_MOVE, ELECTRONIC_PAYMENT_FEE, CREW_CONFIGURATIONS } from "@/lib/quoteCalculator";
import { CheckCircle, Users, Truck, Dumbbell, Info, Zap, Building, Home, AlertTriangle, Music, Lock, Flame, Refrigerator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Local Moving pricing tiers
const localMovingTiers = CREW_CONFIGURATIONS.map(config => ({
  ...config,
  isLabor: !config.hasTruck,
}));

// Specialty items with Iron Law designation and flat fees
const SPECIALTY_ITEMS = [
  {
    name: 'Piano Moving',
    icon: Music,
    flatFee: '$150 - $350',
    hourlyRate: '$189/hr',
    crew: '3 movers',
    isIronLaw: true,
  },
  {
    name: 'Safe Moving',
    icon: Lock,
    flatFee: '$100 - $250',
    hourlyRate: '$189/hr',
    crew: '3 movers',
    isIronLaw: true,
  },
  {
    name: 'Pool Table',
    icon: Dumbbell,
    flatFee: '$350 - $550',
    hourlyRate: '$169/hr',
    crew: '2-3 movers',
    isIronLaw: false,
  },
  {
    name: 'Gun Safe',
    icon: Lock,
    flatFee: '$175 - $350',
    hourlyRate: '$189/hr',
    crew: '3 movers',
    isIronLaw: true,
  },
  {
    name: 'Heavy Appliances',
    icon: Refrigerator,
    flatFee: '$75 - $150',
    hourlyRate: '$169/hr',
    crew: '2-3 movers',
    isIronLaw: false,
  },
];

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
                <Link
                  key={tier.value}
                  to="/quote"
                  className={`p-5 rounded-2xl border relative transition-all hover-lift group cursor-pointer ${
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
                        ? 'bg-accent/10 text-accent-text' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tier.hasTruck ? 'Full Service' : 'Labor Only'}
                    </span>
                  </div>
                  
                  <h3 className="font-heading text-base font-semibold text-primary mb-1 mt-2 group-hover:text-accent transition-colors">
                    {tier.label}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-foreground">${tier.rate}</span>
                    <span className="text-muted-foreground text-sm">/hr</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {tier.description}
                  </p>
                </Link>
              )})}
            </div>
          </TabsContent>
          
          {/* Heavy Items Tab */}
          <TabsContent value="heavy-items">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Iron Law Warning Badge */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="font-heading text-lg font-semibold text-amber-500">200LB IRON LAW</span>
                </div>
                <p className="text-sm text-foreground mb-3">
                  Items 200+ lbs require <strong>3 movers minimum</strong> for safety
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                    <Truck className="w-3 h-3 mr-1" />
                    WITH TRUCK: $189/hr
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground border-border">
                    LABOR ONLY: $179/hr
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Applies to: Pianos • Gun Safes • Heavy Appliances (200+ lbs)
                </p>
              </div>
              
              {/* Pool Table Exception */}
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Pool Tables NOT Iron Law → <strong>$169/hr</strong> (2-3 movers)
                  </span>
                </div>
              </div>

              {/* Specialty Item Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SPECIALTY_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    to="/quote"
                    className={`p-5 rounded-xl border transition-all hover-lift group cursor-pointer ${
                      item.isIronLaw 
                        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' 
                        : 'bg-background border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.isIronLaw ? 'bg-amber-500/10' : 'bg-accent/10'
                      }`}>
                        <item.icon className={`w-5 h-5 ${item.isIronLaw ? 'text-amber-500' : 'text-accent'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                          {item.name}
                        </h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.isIronLaw 
                            ? 'bg-amber-500/20 text-amber-600' 
                            : 'bg-green-500/20 text-green-600'
                        }`}>
                          {item.isIronLaw ? '⚠️ IRON LAW' : '✓ Standard'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Flat Fee:</span>
                        <span className="font-semibold text-foreground">{item.flatFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hourly Rate:</span>
                        <span className="font-medium text-accent">{item.hourlyRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Crew:</span>
                        <span className="text-foreground">{item.crew}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="text-center pt-4">
                <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90 hover-lift">
                  <Link to="/quote">Get Heavy Item Quote</Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Final quote varies based on item complexity, stairs, and access
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
