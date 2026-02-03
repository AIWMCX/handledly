import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollProgress } from "@/components/conversion/ScrollProgress";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/quote", label: "Get Quote" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Add scroll listener for glass effect with passive listener
  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        rafId = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-[42px] left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "glass-nav border-b border-border/50 shadow-depth-2" 
          : "bg-background/80 backdrop-blur-sm border-b border-border"
      )}
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center shadow-gold group-hover:shadow-glow-gold transition-shadow">
              <span className="text-white font-heading font-bold text-xl">H</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-lg font-semibold text-primary">Handledly</p>
              <p className="text-xs text-accent font-medium tracking-wide">America's First AI-Powered Moving SaaS</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                  "after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-accent after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left",
                  location.pathname === link.href && "after:scale-x-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <a
                href="tel:+18782187397"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                (878) 218-7397
              </a>
              <span className="text-muted-foreground/50">|</span>
              <a
                href="tel:+17199203282"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                (719) 920-3282
              </a>
            </div>
            <Button asChild className="hidden sm:flex gradient-gold text-white hover:opacity-90 shadow-gold hover:shadow-glow-gold transition-shadow">
              <Link to="/quote">Get Free Quote</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border glass-nav">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-base font-medium py-2 transition-colors",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="space-y-2 py-2">
                <a
                  href="tel:+18782187397"
                  className="flex items-center gap-2 text-base font-medium text-primary"
                >
                  <Phone className="w-5 h-5" />
                  (878) 218-7397
                  <span className="text-xs text-muted-foreground">Main</span>
                </a>
                <a
                  href="tel:+17199203282"
                  className="flex items-center gap-2 text-base font-medium text-primary"
                >
                  <Phone className="w-5 h-5" />
                  (719) 920-3282
                  <span className="text-xs text-muted-foreground">Denver</span>
                </a>
              </div>
              <Button asChild className="gradient-gold text-white w-full mt-2 shadow-gold">
                <Link to="/quote" onClick={() => setIsMenuOpen(false)}>
                  Get Free Quote
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
