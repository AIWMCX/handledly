import { useState } from "react";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VoiceAgent } from "@/components/VoiceAgent";
import { ChatWidget } from "@/components/ChatWidget/index";
import { StickyCTA } from "@/components/StickyCTA";
import { TrustBadges } from "@/components/TrustBadges";

import { ExitIntentModal } from "@/components/ExitIntentModal";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, MessagesSquare, Shield, CheckCircle, Zap } from "lucide-react";
import { SocialProofBanner, MobileStickyCTA } from "@/components/conversion";

const contactInfo = [
  {
    icon: Phone,
    title: "Main Line",
    primary: "(878) 218-7397",
    secondary: "Toll-free support",
    href: "tel:+18782187397",
  },
  {
    icon: Phone,
    title: "Local Denver",
    primary: "(719) 920-3282",
    secondary: "Denver Metro direct",
    href: "tel:+17199203282",
  },
  {
    icon: Mail,
    title: "Email",
    primary: "hello@handledly.com",
    secondary: "We respond within 2 hours",
    href: "mailto:hello@handledly.com",
  },
  {
    icon: MapPin,
    title: "Service Area",
    primary: "Denver Metro Area",
    secondary: "30+ Cities Covered",
  },
  {
    icon: Clock,
    title: "Hours",
    primary: "Mon-Fri: 7am - 7pm",
    secondary: "Sat: 8am - 5pm",
  },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          notes: formData.message,
          status: 'new',
        });

      if (error) throw error;

      toast.success("Message sent! We'll be in touch soon.");
      setFormData({ fullName: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO
        title="Contact Handledly - The Denver Moving Marketplace"
        description="Questions about Handledly, the Denver-area moving marketplace? Reach our platform support team for help finding, comparing, or booking a verified moving company."
        canonicalUrl="https://handledly.com/contact"
        keywords={["contact Handledly", "moving marketplace support", "Denver moving marketplace", "Handledly support"]}
      />
      
      <main id="main-content">
      {/* Hero */}
      <section className="pt-40 pb-16 lg:pt-48 lg:pb-20 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Denver Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">The Denver Moving Marketplace</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6">
              Contact <span className="text-accent">Handledly</span> Support
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6">
              Questions about using the marketplace, a booking, or listing your moving
              company? Our platform support team is here to help — reach out any way you like.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4">
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Under 10 Min Response</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustBadges />

      <Section className="pt-12">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              {/* Trust strip above form */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Licensed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">No Hidden Fees</span>
                </div>
              </div>
              
              <div className="p-6 lg:p-8 rounded-2xl glass-card shadow-depth-3 hover-lift transition-all">
                <h2 className="font-heading text-2xl font-semibold text-primary mb-2">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  We typically respond within 10 minutes during business hours
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Smith"
                      required
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your move or ask any questions..."
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-gold text-white hover:opacity-90 shadow-gold"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info & Voice Agent */}
            <div className="space-y-6">
              {/* Contact Cards - Premium glassmorphism */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="p-5 rounded-xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium text-primary hover:text-accent transition-colors">
                        {item.primary}
                      </a>
                    ) : (
                      <p className="font-medium text-primary">{item.primary}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{item.secondary}</p>
                  </div>
                ))}
              </div>

              {/* Chat Support Card */}
              <div className="p-6 rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                    <MessagesSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold text-primary mb-1">
                      Chat with Our AI Assistant
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Get instant answers, quotes, and schedule your move via text.
                    </p>
                  </div>
                </div>
                
                <ChatWidget variant="inline" />
              </div>

              {/* Voice Agent Card */}
              <div className="p-6 rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold text-primary mb-1">
                      Talk to Our AI Assistant
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Prefer voice? Get instant answers by talking to our AI.
                    </p>
                  </div>
                </div>
                
                <VoiceAgent variant="inline" />
              </div>

              {/* Quick Call CTA */}
              <div className="p-6 rounded-2xl bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-2xl" />
                </div>
                <div className="relative z-10">
                  <p className="font-heading text-lg font-semibold mb-2">
                    Prefer to Talk to a Human?
                  </p>
                  <p className="text-white/80 text-sm mb-4">
                    Our platform support team is standing by to help you use Handledly.
                  </p>
                  <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-white">
                    <a href="tel:+18782187397">
                      <Phone className="mr-2 w-5 h-5" />
                      (878) 218-7397
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      </main>
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