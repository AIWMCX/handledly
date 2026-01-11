import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout";

interface ServiceCTAProps {
  steps: string[];
}

export function ServiceCTA({ steps }: ServiceCTAProps) {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Ready For A <span className="text-gradient-gold">Smooth Move?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get started with your free, no-obligation quote. Here's how easy it is:
            </p>
            
            <ol className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              >
                <Link to="/quote">
                  Get Your Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+13035551234">
                  Call (303) 555-1234
                </a>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 gradient-gold opacity-10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-background rounded-3xl border border-border p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground">Free, no-obligation quotes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground">Transparent flat-rate pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground">Fully licensed and insured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground">97% customer satisfaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground">500+ damage-free days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
