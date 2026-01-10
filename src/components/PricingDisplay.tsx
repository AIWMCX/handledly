import { Container } from "@/components/layout";
import { HOURLY_RATES, INCLUDED_WITH_EVERY_MOVE } from "@/lib/quoteCalculator";
import { CheckCircle, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pricingTiers = [
  {
    crew: '2 Movers + Truck',
    rate: HOURLY_RATES['2-movers'],
    recommended: 'Studios & 1-2 BR apartments',
  },
  {
    crew: '3 Movers + Truck',
    rate: HOURLY_RATES['3-movers'],
    recommended: '2-3 BR apartments & small homes',
    popular: true,
  },
  {
    crew: '4 Movers + Truck',
    rate: HOURLY_RATES['4-movers'],
    recommended: '3-4 BR homes',
  },
  {
    crew: '5 Movers + Truck',
    rate: HOURLY_RATES['5-movers'],
    recommended: '5+ BR homes & large moves',
  },
];

export function PricingDisplay() {
  return (
    <section className="py-20 bg-card">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">
            Simple, <span className="text-gradient-gold">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no surprises. Just one flat hourly rate that includes everything.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingTiers.map((tier) => (
            <div
              key={tier.crew}
              className={`p-6 rounded-2xl border ${
                tier.popular 
                  ? 'bg-primary/5 border-primary' 
                  : 'bg-background border-border'
              } relative`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-gold text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <Truck className="w-5 h-5 text-primary" />
              </div>
              
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                {tier.crew}
              </h3>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">${tier.rate}</span>
                <span className="text-muted-foreground">/hr</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {tier.recommended}
              </p>
            </div>
          ))}
        </div>
        
        {/* What's Included */}
        <div className="p-8 rounded-2xl bg-background border border-border">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
            Everything Included — No Extra Charges
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INCLUDED_WITH_EVERY_MOVE.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
              <Link to="/quote">Get Your Free Quote</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
