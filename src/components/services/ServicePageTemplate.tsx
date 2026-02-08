import { Header, Footer, Container, Section } from "@/components/layout";
import { ChatWidget } from "@/components/ChatWidget/index";
import { DeferredVoiceAgent } from "@/components/DeferredVoiceAgent";
import { Testimonials } from "@/components/Testimonials";
import { TrustBadges } from "@/components/TrustBadges";
import { StickyCTA } from "@/components/StickyCTA";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { ServiceHeroBanner } from "./ServiceHeroBanner";
import { ServiceIntro } from "./ServiceIntro";
import { FeatureCards } from "./FeatureCards";
import { WhyExpertCare } from "./WhyExpertCare";
import { RelatedServices } from "./RelatedServices";
import { ServiceCTA } from "./ServiceCTA";
import { ComingSoonSignup } from "./ComingSoonSignup";
import { ServiceTestimonials } from "./ServiceTestimonials";
import { SocialProofBanner, MobileStickyCTA } from "@/components/conversion";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Sparkles } from "lucide-react";
import type { ServiceData } from "@/data/servicesData";

interface ServicePageTemplateProps {
  data: ServiceData;
}

export function ServicePageTemplate({ data }: ServicePageTemplateProps) {
  const isUnavailable = data.closed || data.comingSoon;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalUrl={`https://handledly.com/services/${data.slug}`}
        keywords={data.keywords}
      />
      
      <Header />
      
      {/* Closed Service Alert */}
      {data.closed && !data.comingSoon && (
        <Container className="pt-24 lg:pt-28">
          <Alert className="bg-muted border-muted-foreground/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Service Currently Unavailable</strong> — {data.title} is temporarily closed. Please check back later or contact us for alternative options.
            </AlertDescription>
          </Alert>
        </Container>
      )}

      {/* Coming Soon Banner */}
      {data.comingSoon && (
        <Container className="pt-24 lg:pt-28">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border border-accent/30">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-accent text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-primary">{data.title} is Launching Soon!</h3>
                  <p className="text-sm text-muted-foreground">
                    We're preparing to offer this service. Sign up to be notified when it's available.
                  </p>
                </div>
              </div>
              <div className="md:w-80">
                <ComingSoonSignup serviceName={data.title} serviceSlug={data.slug} />
              </div>
            </div>
          </div>
        </Container>
      )}
      
      <ServiceHeroBanner 
        serviceName={data.title} 
        tagline={data.tagline} 
      />
      
      <TrustBadges />
      
      <ServiceIntro
        headline={data.headline}
        highlightText={data.highlightText}
        subheading={data.subheading}
        paragraphs={data.introParagraphs}
      />
      
      <FeatureCards features={data.features} />
      
      <WhyExpertCare
        title={data.expertCareTitle}
        description={data.expertCareDescription}
        challenges={data.challenges}
      />
      
      <RelatedServices services={data.relatedServices} />
      
      {/* Show CTA only if service is available */}
      {!isUnavailable && <ServiceCTA steps={data.ctaSteps} serviceSlug={data.slug} />}
      
      {/* Show signup CTA for coming soon services */}
      {data.comingSoon && (
        <Section className="bg-secondary">
          <Container size="narrow">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-primary mb-2">
                Don't Miss the Launch
              </h2>
              <p className="text-muted-foreground">
                Be among the first to experience our {data.title} service when it goes live.
              </p>
            </div>
            <ComingSoonSignup serviceName={data.title} serviceSlug={data.slug} />
          </Container>
        </Section>
      )}
      
      {/* Service-specific testimonials if available */}
      {data.testimonials && data.testimonials.length > 0 && (
        <ServiceTestimonials 
          testimonials={data.testimonials} 
          serviceName={data.title}
        />
      )}
      
      {/* General testimonials */}
      <Testimonials />
      
      <Footer />
      <StickyCTA />
      <ChatWidget />
      <DeferredVoiceAgent />
      <ExitIntentModal />
      <SocialProofBanner />
      <MobileStickyCTA />
    </div>
  );
}