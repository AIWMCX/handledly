import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout";
import { ConversionEvents } from "@/lib/analytics";

interface ServiceCTAProps {
  steps: string[];
  serviceSlug?: string; // For pre-filling quote form
}

export function ServiceCTA({ steps, serviceSlug }: ServiceCTAProps) {
  const quoteUrl = serviceSlug ? `/quote?service=${serviceSlug}` : '/quote';

  const handleQuoteClick = () => {
    if (serviceSlug) {
      ConversionEvents.ctaClicked('Get Your Free Quote', `service_page_${serviceSlug}`, 'service_cta');
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Same-Day Quotes Available</span>
            </div>
            
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Ready For A <span className="text-accent">Smooth Move?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get started with your free, no-obligation quote. Here's how easy it is:
            </p>
            
            <ol className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-gold">
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
                className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90 animate-glow-pulse"
                onClick={handleQuoteClick}
              >
                <Link to={quoteUrl}>
                  Get Your Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <a href="tel:+18782187397">
                  (878) 218-7397
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-primary">
                <a href="tel:+17199203282">
                  (719) 920-3282
                </a>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 gradient-gold opacity-10 rounded-3xl blur-3xl"></div>
              <div className="relative glass-card rounded-3xl p-8 shadow-depth-3">
                {/* Trust badges header */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Denver's Top-Rated Movers</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-foreground">Free, no-obligation quotes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-foreground">Transparent flat-rate pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-accent" />
                    <span className="text-foreground">Fully licensed and $750K insured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-foreground">97% customer satisfaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-foreground">30+ Denver Metro cities served</span>
                  </div>
                </div>
                
                {/* Mini testimonial */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    "Best moving experience in Denver! Professional, on-time, and careful with everything."
                  </p>
                  <p className="text-sm font-medium text-foreground mt-2">— Sarah M., Cherry Creek</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}