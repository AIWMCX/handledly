import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Header, Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeshGradientHero } from "@/components/ui/BackgroundEffects";
import { SEO } from "@/components/SEO";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  BadgeCheck,
  Clock,
  DollarSign,
  Search,
  ListChecks,
  CheckCircle2,
  Truck,
  Users,
  Sparkles,
  Building2,
} from "lucide-react";

const Footer = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));

const howItWorks = [
  {
    icon: Search,
    title: "Tell us about your move",
    description: "Enter your origin, destination, date, and home size. Takes 60 seconds.",
  },
  {
    icon: ListChecks,
    title: "Compare verified movers",
    description: "Get quotes from licensed, insured companies — side by side.",
  },
  {
    icon: CheckCircle2,
    title: "Book the one you love",
    description: "Pick by price, reviews, or availability. Confirmed in minutes.",
  },
];

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Verified & Insured",
    description: "Every company is DOT-licensed with verified insurance on file.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Binding quotes, no hidden fees, no surprise charges on move day.",
  },
  {
    icon: Star,
    title: "Real Customer Reviews",
    description: "Only customers who actually booked through Handledly can review.",
  },
  {
    icon: Clock,
    title: "Fast & Easy",
    description: "Compare 3+ quotes in minutes instead of calling 5 companies.",
  },
];

// Demo featured-mover cards for visual scaffold (replace with live data when seeded)
const featuredMovers = [
  {
    name: "Mile High Movers",
    city: "Denver, CO",
    rating: 4.9,
    reviews: 312,
    fromPrice: 159,
    badges: ["Top Rated", "Same-Day"],
  },
  {
    name: "Aurora Pro Moving",
    city: "Aurora, CO",
    rating: 4.8,
    reviews: 187,
    fromPrice: 149,
    badges: ["Verified"],
  },
  {
    name: "Front Range Movers",
    city: "Boulder, CO",
    rating: 4.9,
    reviews: 241,
    fromPrice: 169,
    badges: ["Long Distance"],
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Compare Top Movers Near You | Handledly Marketplace"
        description="Get free quotes from verified, licensed moving companies in 60 seconds. Compare side-by-side, read real reviews, and book the right mover with confidence."
        canonicalUrl="https://handledly.com/"
        keywords={[
          "moving marketplace",
          "compare movers",
          "movers near me",
          "licensed moving companies",
          "moving quotes",
          "verified movers",
        ]}
      />

      <Header />

      <main id="main-content">
        {/* Hero with search */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
          <MeshGradientHero />

          <Container className="relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 shadow-depth-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  The marketplace for licensed moving companies
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-5">
                Compare top movers.<br />
                <span className="text-accent">Book with confidence.</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get free quotes from verified, insured moving companies in your area —
                side by side, in under a minute.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <MarketplaceSearch />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-accent" />
                <span>Verified DOT licensed companies</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Insurance verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>Real verified reviews</span>
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <Section className="bg-secondary">
          <Container>
            <SectionHeader
              title="How Handledly Works"
              subtitle="One form. Multiple quotes. Total transparency."
            />
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {howItWorks.map((step, i) => (
                <div
                  key={step.title}
                  className="relative p-8 rounded-3xl bg-card border border-border shadow-depth-2 hover:shadow-depth-3 transition-shadow"
                >
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-accent text-accent-foreground font-heading font-bold flex items-center justify-center shadow-depth-2">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Featured movers */}
        <Section>
          <Container>
            <SectionHeader
              title="Featured Moving Companies"
              subtitle="Top-rated, verified movers ready to quote your next move."
            />
            <div className="grid md:grid-cols-3 gap-6">
              {featuredMovers.map((mover) => (
                <div
                  key={mover.name}
                  className="p-6 rounded-2xl bg-card border border-border shadow-depth-2 hover:shadow-depth-3 hover:border-accent/40 transition-all hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-semibold text-foreground">{mover.rating}</span>
                      <span className="text-muted-foreground">({mover.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-primary mb-1">
                    {mover.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{mover.city}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {mover.badges.map((b) => (
                      <Badge
                        key={b}
                        variant="secondary"
                        className="bg-accent/10 text-accent-text border-accent/20"
                      >
                        {b}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-heading text-xl font-semibold text-primary">
                        ${mover.fromPrice}
                        <span className="text-sm font-normal text-muted-foreground">/hr</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                      View profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-sm text-muted-foreground mb-4">
                Sample profiles shown. Live mover network launching soon.
              </p>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link to="/auth?mode=signup&role=mover">
                  Are you a moving company? Join free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Container>
        </Section>

        {/* Why Handledly */}
        <Section className="bg-secondary">
          <Container>
            <SectionHeader
              title="Why Handledly"
              subtitle="Trust, transparency, and choice — built for both customers and movers."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustPillars.map((p) => (
                <div
                  key={p.title}
                  className="p-6 rounded-2xl bg-card border border-border shadow-depth-1 hover:shadow-depth-2 transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <p.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-primary mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* For movers CTA */}
        <Section>
          <Container>
            <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 lg:p-16 shadow-depth-3">
              <div className="absolute inset-0 bg-mesh-section opacity-20 pointer-events-none" />
              <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <Badge className="mb-4 bg-accent text-accent-foreground border-0">
                    For Moving Companies
                  </Badge>
                  <h2 className="font-heading text-3xl lg:text-4xl font-semibold mb-4 text-primary-foreground">
                    Pre-qualified leads. Free CRM. <span className="text-accent">1.5% commission.</span>
                  </h2>
                  <p className="text-lg text-primary-foreground/80 mb-6 leading-relaxed">
                    Join the marketplace built for movers. Get high-intent customers,
                    manage your pipeline with our free CRM, and keep more of every job.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="gradient-gold text-white shadow-gold hover:opacity-90">
                      <Link to="/auth?mode=signup&role=mover">
                        List your company free
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    >
                      <Link to="/about">Learn more</Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
                    <Truck className="w-6 h-6 text-accent mb-3" />
                    <p className="font-heading text-2xl font-bold text-primary-foreground">1.5%</p>
                    <p className="text-sm text-primary-foreground/70">Commission per booking</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
                    <Users className="w-6 h-6 text-accent mb-3" />
                    <p className="font-heading text-2xl font-bold text-primary-foreground">$0</p>
                    <p className="text-sm text-primary-foreground/70">CRM cost — forever free</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
                    <Clock className="w-6 h-6 text-accent mb-3" />
                    <p className="font-heading text-2xl font-bold text-primary-foreground">24-48h</p>
                    <p className="text-sm text-primary-foreground/70">Payout window (coming soon)</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
                    <BadgeCheck className="w-6 h-6 text-accent mb-3" />
                    <p className="font-heading text-2xl font-bold text-primary-foreground">Verified</p>
                    <p className="text-sm text-primary-foreground/70">Customer-ready leads</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Final CTA */}
        <Section className="bg-secondary">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-primary mb-4">
                Ready to find your mover?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Compare verified moving companies in your area — free, in under a minute.
              </p>
              <div className="max-w-3xl mx-auto">
                <MarketplaceSearch variant="compact" />
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Suspense fallback={<div className="py-12" />}>
        <Footer />
      </Suspense>
    </div>
  );
}