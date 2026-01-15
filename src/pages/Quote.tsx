import { useState } from "react";
import { Header, Footer, Container } from "@/components/layout";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget";
import { QuoteConfirmation } from "@/components/QuoteConfirmation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  calculateQuote,
  type ServiceType as CalcServiceType,
} from "@/lib/quoteCalculator";
import { CheckCircle, Shield, Clock, Star, MapPin } from "lucide-react";
import { SocialProofBanner, MobileStickyCTA, QuoteFormWizard } from "@/components/conversion";
import { QuoteFormData, ServiceType } from "@/types/conversion";
import { ConversionEvents } from "@/lib/analytics";
import { generateId, withRetry, classifyError, validateQuoteData } from "@/lib/apiUtils";

// Map QuoteFormWizard ServiceType to quoteCalculator ServiceType
const mapToCalcServiceType = (wizardType: ServiceType): CalcServiceType => {
  const mapping: Record<ServiceType, CalcServiceType> = {
    'local-moving': 'local-moving',
    'residential': 'local-moving',
    'long-distance': 'local-moving',
    'same-day': 'local-moving',
    'piano-moving': 'heavy-items',
    'pool-table': 'heavy-items',
    'safe-moving': 'heavy-items',
    'heavy-items': 'heavy-items',
    'junk-removal': 'heavy-items',
    'moving-help': 'local-moving',
  };
  return mapping[wizardType] || 'local-moving';
};

// Map crew size to crew configuration string
const mapCrewConfig = (crewSize: number): string => {
  if (crewSize <= 2) return 'moving-2-movers';
  if (crewSize === 3) return 'moving-3-movers';
  return 'moving-4-movers';
};

// Split full name into first and last name
const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Friend';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

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

// Generate quote number: HM-YYYY-XXXX (XXXX = random 4 chars for uniqueness)
const generateQuoteNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HM-${year}-${random}`;
};

  const handleWizardSubmit = async (data: QuoteFormData) => {
    // Pre-submission validation
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

    // Split name for personalized communication
    const { firstName, lastName } = splitName(data.fullName);
    
    // Map wizard data to calculator input
    const calcServiceType = mapToCalcServiceType(data.serviceType);
    const crewConfig = mapCrewConfig(data.crewSize);
    
    // Calculate quote using existing quoteCalculator
    const quote = calculateQuote({
      serviceType: calcServiceType,
      bedrooms: data.bedrooms,
      crewConfig: crewConfig,
      estimatedHours: data.estimatedHours,
    });

    // Generate IDs and verification token client-side for security
    const leadId = generateId();
    const quoteRequestId = generateId();
    const quoteNumber = generateQuoteNumber();
    const verificationToken = crypto.randomUUID();

    try {
      // Use retry logic for resilient submission
      await withRetry(
        async () => {
          // Create lead with verification token for secure edge function calls
          const { error: leadError } = await supabase
            .from('leads')
            .insert({
              id: leadId,
              full_name: data.fullName,
              email: data.email,
              phone: data.phone,
              property_type: data.serviceType,
              bedrooms: data.bedrooms,
              move_from_address: data.moveFromAddress,
              move_to_address: data.moveToAddress,
              move_date: data.moveDate || null,
              notes: data.notes || null,
              estimated_quote: quote.total,
              status: 'new',
              prefer_email_only: data.preferEmailOnly,
              has_specialty_items: data.hasStairs,
              verification_token: verificationToken,
            });

          if (leadError) throw leadError;

          // Create quote request - also NO .select() needed
          const { error: quoteError } = await supabase
            .from('quote_requests')
            .insert({
              id: quoteRequestId,
              lead_id: leadId,
              property_type: data.serviceType,
              bedrooms: data.bedrooms,
              has_stairs: data.hasStairs,
              floor_number: data.floorNumber,
              total_quote: quote.total,
              quote_number: quoteNumber,
            });

          if (quoteError) throw quoteError;
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
      ConversionEvents.quoteRequested(data.serviceType, quote.total);

      // Send GA4 purchase event for revenue tracking
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', {
          transaction_id: quoteNumber,
          value: quote.total,
          currency: 'USD',
          items: [{
            item_id: data.serviceType,
            item_name: data.serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            price: quote.total,
            quantity: 1
          }]
        });
      }

      // Store submitted data for confirmation screen
      setSubmittedData({
        customerName: data.fullName || "Friend",
        firstName: firstName,
        totalQuote: quote.total,
        email: data.email,
        preferEmailOnly: data.preferEmailOnly,
        quoteNumber: quoteNumber,
      });
      setIsSubmitted(true);
      toast.success("Quote submitted! Check your email.");

      // Send email quote with verification token for security
      supabase.functions.invoke('send-quote-email', {
        body: {
          leadId: leadId,
          verificationToken: verificationToken,
          firstName: firstName,
          lastName: lastName,
          customerName: data.fullName,
          email: data.email,
          phone: data.phone,
          serviceType: data.serviceType,
          crewSize: quote.crewSize,
          hourlyRate: quote.hourlyRate,
          estimatedHours: quote.estimatedHours,
          laborCost: quote.laborCost,
          specialtyFee: quote.specialtyFee,
          totalQuote: quote.total,
          quoteNumber: quoteNumber,
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
        // Don't fail the whole submission for email issues
      });

      // Schedule confirmation call with verification token if not email-only
      if (!data.preferEmailOnly) {
        setCallScheduled(true);
        supabase.functions.invoke('trigger-confirmation-call', {
          body: {
            leadId: leadId,
            verificationToken: verificationToken,
            firstName: firstName,
            lastName: lastName,
            customerName: data.fullName,
            phone: data.phone,
            email: data.email,
            serviceType: data.serviceType,
            totalQuote: quote.total,
            quoteNumber: quoteNumber,
            moveDate: data.moveDate || undefined,
            moveFrom: data.moveFromAddress || undefined,
            moveTo: data.moveToAddress || undefined,
            crewSize: quote.crewSize,
            estimatedHours: quote.estimatedHours,
          }
        }).catch((err) => {
          console.error("Call scheduling error:", err);
          setCallScheduled(false);
          // Don't fail the whole submission for call issues
        });
      }

    } catch (error) {
      console.error('Error submitting quote:', error);
      
      // Classify the error and show user-friendly message
      const classifiedError = classifyError(error);
      toast.error(classifiedError.userMessage);
      
      throw error; // Re-throw so the wizard knows submission failed
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
      
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
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
                  <GoogleReviewsBadge compact />
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
                  <span className="text-sm text-primary font-medium">USDOT Licensed</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">$2M+ Insured</span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm text-primary font-medium">BBB A+ Rated</span>
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
                No obligation • Free estimate • Same-day response • Join 10,000+ happy Denver customers
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
