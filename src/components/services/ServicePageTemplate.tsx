import { Header, Footer, Container } from "@/components/layout";
import { ChatWidget } from "@/components/ChatWidget";
import { VoiceAgent } from "@/components/VoiceAgent";
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
import { SocialProofBanner, MobileStickyCTA } from "@/components/conversion";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ServiceData } from "@/data/servicesData";

interface ServicePageTemplateProps {
  data: ServiceData;
}

export function ServicePageTemplate({ data }: ServicePageTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalUrl={`https://handledmoving.com/services/${data.slug}`}
        keywords={data.keywords}
      />
      
      <Header />
      
      {data.closed && (
        <Container className="pt-24 lg:pt-28">
          <Alert className="bg-muted border-muted-foreground/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Service Currently Unavailable</strong> — {data.title} is temporarily closed. Please check back later or contact us for alternative options.
            </AlertDescription>
          </Alert>
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
      
      <ServiceCTA steps={data.ctaSteps} />
      
      <Testimonials />
      
      <Footer />
      <StickyCTA />
      <ChatWidget />
      <VoiceAgent />
      <ExitIntentModal />
      <SocialProofBanner />
      <MobileStickyCTA />
    </div>
  );
}