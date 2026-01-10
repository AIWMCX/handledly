import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/quote", label: "Get Quote" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">D</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-serif text-lg font-semibold text-foreground">Denver Premium</p>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Moving Co.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+13035551234"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              (303) 555-1234
            </a>
            <Button asChild className="hidden sm:flex gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
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
          <div className="lg:hidden py-4 border-t border-border">
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
              <a
                href="tel:+13035551234"
                className="flex items-center gap-2 text-base font-medium text-primary py-2"
              >
                <Phone className="w-5 h-5" />
                (303) 555-1234
              </a>
              <Button asChild className="gradient-gold text-primary-foreground w-full mt-2">
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