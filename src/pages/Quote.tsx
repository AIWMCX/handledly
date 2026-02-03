import { useState } from "react";
import { Header, Footer, Container } from "@/components/layout";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { QuoteConfirmation } from "@/components/QuoteConfirmation";
import { AnnouncementBar } from "@/components/AnnouncementBar";

import { ExitIntentModal } from "@/components/ExitIntentModal";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Shield, Clock, MapPin } from "lucide-react";
import { SocialProofBanner, MobileStickyCTA, QuoteFormWizard } from "@/components/conversion";
import { QuoteFormData } from "@/types/conversion";
import { ConversionEvents } from "@/lib/analytics";
import { withRetry, classifyError, validateQuoteData } from "@/lib/apiUtils";


export default function Quote() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [callScheduled, setCallScheduled] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    customerName: string;
    firstName: string;
    totalQuote: number;
    email: string;
    preferEmailOnly: boolean;
    quoteNumber: string;
  } | null>(null);

  const handleWizardSubmit = async (data: QuoteFormData) => {
    // Pre-submission validation (client-side for UX)
    const validation = validateQuoteData({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      moveDate: data.moveDate,
      serviceType: data.serviceType,
    });

    if (!validation.valid) {
      toast.error(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    try {
      // Submit quote via secure edge function (no direct DB access)
      const response = await withRetry(
        async () => {
          const { data: result, error } = await supabase.functions.invoke('submit-quote', {
            body: {
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              serviceType: data.serviceType,
              moveFromAddress: data.moveFromAddress,
              moveToAddress: data.moveToAddress,
              moveDate: data.moveDate || null,
              bedrooms: data.bedrooms,
              hasStairs: data.hasStairs,
              floorNumber: data.floorNumber,
              notes: data.notes,
              preferEmailOnly: data.preferEmailOnly,
              crewSize: data.crewSize,
              estimatedHours: data.estimatedHours,
              // UTM tracking
              lead_source: data.lead_source || 'website',
              utm_source: data.utm_source || null,
              utm_medium: data.utm_medium || null,
              utm_campaign: data.utm_campaign || null,
              utm_content: data.utm_content || null,
              utm_term: data.utm_term || null,
            },
          });

          if (error) throw error;
          if (!result?.success) throw new Error(result?.error || 'Submission failed');
          return result;
        },
        {
          maxRetries: 3,
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} after error:`, error.message);
          },
        }
      );

      // Track conversion event
      ConversionEvents.quoteRequested(data.serviceType, response.total);

      // Send GA4 purchase event for revenue tracking
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', {
          transaction_id: response.quoteNumber,
          value: response.total,
          currency: 'USD',
          items: [{
            item_id: data.serviceType,
            item_name: data.serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            price: response.total,
            quantity: 1
          }]
        });
      }

      // Store submitted data for confirmation screen
      setSubmittedData({
        customerName: data.fullName || "Friend",
        firstName: response.firstName,
        totalQuote: response.total,
        email: data.email,
        preferEmailOnly: data.preferEmailOnly,
        quoteNumber: response.quoteNumber,
      });
      
      // Store quote data in sessionStorage for Jack voice agent context
      sessionStorage.setItem('recentQuote', JSON.stringify({
        quoteNumber: response.quoteNumber,
        firstName: response.firstName,
        lastName: response.lastName,
        serviceType: data.serviceType,
        moveDate: data.moveDate,
        bedrooms: data.bedrooms,
        estimatedTotal: response.total,
        crewSize: response.crewSize,
        moveFrom: data.moveFromAddress,
        moveTo: data.moveToAddress,
      }));
      
      setIsSubmitted(true);
      toast.success("Quote submitted! Check your email.");

      // Send email quote via edge function (uses returned verification token)
      supabase.functions.invoke('send-quote-email', {
        body: {
          leadId: response.leadId,
          verificationToken: response.verificationToken,
          firstName: response.firstName,
          lastName: response.lastName,
          customerName: data.fullName,
          email: data.email,
          phone: data.phone,
          serviceType: data.serviceType,
          crewSize: response.crewSize,
          hourlyRate: response.hourlyRate,
          estimatedHours: response.estimatedHours,
          laborCost: response.laborCost,
          specialtyFee: response.specialtyFee,
          totalQuote: response.total,
          quoteNumber: response.quoteNumber,
          moveDate: data.moveDate || undefined,
          moveFrom: data.moveFromAddress || undefined,
          moveTo: data.moveToAddress || undefined,
          notes: data.notes || undefined,
        }
      }).then(() => {
        setEmailSent(true);
        toast.success("Quote emailed to you!");
      }).catch((err) => {
        console.error("Email error:", err);
      });

      // Schedule confirmation call if not email-only
      if (!data.preferEmailOnly) {
        setCallScheduled(true);
        supabase.functions.invoke('trigger-confirmation-call', {
          body: {
            leadId: response.leadId,
            verificationToken: response.verificationToken,
            firstName: response.firstName,
            lastName: response.lastName,
            customerName: data.fullName,
            phone: data.phone,
            email: data.email,
            serviceType: data.serviceType,
            totalQuote: response.total,
            quoteNumber: response.quoteNumber,
            moveDate: data.moveDate || undefined,
            moveFrom: data.moveFromAddress || undefined,
            moveTo: data.moveToAddress || undefined,
            crewSize: response.crewSize,
            estimatedHours: response.estimatedHours,
          }
        }).catch((err) => {
          console.error("Call scheduling error:", err);
          setCallScheduled(false);
        });
      }

    } catch (error) {
      console.error('Error submitting quote:', error);
      
      // Classify the error and show user-friendly message
      const classifiedError = classifyError(error);
      toast.error(classifiedError.userMessage);
      
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free Moving Quote Denver - Instant Estimate | Handledly Moving Services"
        description="Get a free moving quote in 60 seconds. Transparent pricing, no hidden fees. Local moves, heavy items, same-day service available. Denver's top-rated movers."
        canonicalUrl="https://handledly.com/quote"
        keywords={['free moving quote', 'moving estimate Denver', 'moving cost calculator', 'instant moving quote']}
      />
      
      <AnnouncementBar />
      <Header />
      
      <section className="pt-40 pb-20 lg:pt-48 lg:pb-28 relative overflow-hidden">
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
                  Complete the quick form below and we'll send you a detailed estimate.
                </p>
                
                {/* Trust indicators row */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  
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
                  <span className="text-sm text-primary font-medium">Licensed & Insured</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">$750K Insured</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">No Hidden Fees</span>
                </div>
              </div>

              {/* Multi-Step Quote Wizard */}
              <div className="glass-card border border-border rounded-2xl p-8 shadow-depth-3">
                <QuoteFormWizard onSubmit={handleWizardSubmit} />
              </div>

              {/* Bottom trust text */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                No obligation • Free estimate • Same-day response • Denver's trusted movers
              </p>
              <p className="text-center text-xs text-muted-foreground/70 mt-2 max-w-md mx-auto">
                *Estimates are based on information provided and may vary depending on actual move requirements. Quote valid for 7 days.
              </p>
            </div>
          ) : (
            submittedData && (
              <QuoteConfirmation
                customerName={submittedData.customerName}
                firstName={submittedData.firstName}
                totalQuote={submittedData.totalQuote}
                email={submittedData.email}
                emailSent={emailSent}
                callScheduled={callScheduled}
                preferEmailOnly={submittedData.preferEmailOnly}
                quoteNumber={submittedData.quoteNumber}
              />
            )
          )}
        </Container>
      </section>

      <Footer />
      <VoiceAgent />
      <ChatWidget />
      <ExitIntentModal />
      <SocialProofBanner />
      <MobileStickyCTA />
    </div>
  );
}
