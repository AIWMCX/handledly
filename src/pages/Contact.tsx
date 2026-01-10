import { useState } from "react";
import { Header, Footer, Container, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VoiceAgent } from "@/components/VoiceAgent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    primary: "(303) 555-1234",
    secondary: "Call for a free quote",
    href: "tel:+13035551234",
  },
  {
    icon: Mail,
    title: "Email",
    primary: "info@denverpremiummoving.com",
    secondary: "We respond within 2 hours",
    href: "mailto:info@denverpremiummoving.com",
  },
  {
    icon: MapPin,
    title: "Service Area",
    primary: "Denver Metro Area",
    secondary: "And surrounding counties",
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
      
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              Get in <span className="text-gradient-gold">Touch</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Ready to plan your move? Have questions? We're here to help. 
              Reach out through any channel—we respond fast.
            </p>
          </div>
        </Container>
      </section>

      <Section className="pt-0">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  Send Us a Message
                </h2>
                
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
                        placeholder="(303) 555-1234"
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
                    className="w-full gradient-gold text-primary-foreground hover:opacity-90"
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
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="p-5 rounded-xl bg-card border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium text-foreground hover:text-primary transition-colors">
                        {item.primary}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">{item.primary}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{item.secondary}</p>
                  </div>
                ))}
              </div>

              {/* Voice Agent Card */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                      Talk to Our AI Assistant
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get instant answers, quotes, and schedule your move by voice.
                    </p>
                  </div>
                </div>
                
                <VoiceAgent variant="inline" />
              </div>

              {/* Quick Call CTA */}
              <div className="p-6 rounded-2xl glass">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  Prefer to Talk to a Human?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Our friendly team is standing by to help with your move.
                </p>
                <Button asChild size="lg" className="w-full gradient-gold text-primary-foreground hover:opacity-90">
                  <a href="tel:+13035551234">
                    <Phone className="mr-2 w-5 h-5" />
                    Call (303) 555-1234
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
      <VoiceAgent />
    </div>
  );
}