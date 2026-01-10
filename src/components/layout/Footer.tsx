import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Our Services" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const services = [
  "Residential Moving",
  "Commercial Moving",
  "Specialty Items",
  "Packing Services",
  "Storage Solutions",
];

const serviceAreas = [
  "Downtown Denver",
  "Cherry Creek",
  "Highlands/LoHi",
  "Aurora",
  "Lakewood",
  "Westminster",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl">D</span>
              </div>
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">Denver Premium</p>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Moving Co.</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Denver's most trusted premium moving service. We handle your belongings with the care and 
              professionalism they deserve.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-muted-foreground text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-foreground">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <a href="tel:+13035551234" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
                    (303) 555-1234
                  </a>
                  <p className="text-xs text-muted-foreground">Call for free quote</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <a href="mailto:info@denverpremiummoving.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  info@denverpremiummoving.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Serving Denver Metro Area
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-muted-foreground text-sm">
                  <p>Mon-Fri: 7am - 7pm</p>
                  <p>Sat: 8am - 5pm</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Service Areas */}
        <div className="mt-12 pt-8 border-t border-border">
          <h4 className="font-serif text-sm font-semibold mb-4 text-foreground">Service Areas</h4>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © {currentYear} Denver Premium Moving. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}