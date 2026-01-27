import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin,
  Shield,
  Award,
  CheckCircle,
  Zap,
  CreditCard
} from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Our Services" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const services = [
  "Apartment & Condo Moving",
  "House & Townhouse Moving",
  "Labor-Only Moving Help",
  "Same-Day Moving",
  "Piano Moving",
  "Pool Table Moving",
  "Heavy Items Moving",
];

const denverAreas = [
  "Capitol Hill", "Cherry Creek", "LoDo", "Highlands", "RiNo",
  "Wash Park", "Park Hill", "Aurora", "Lakewood", "Arvada",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-primary text-white overflow-hidden">
      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-accent/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Denver Service Area Badge */}
        <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-accent" />
            <p className="font-heading text-lg font-semibold text-white">Proudly Serving Denver Metro</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {denverAreas.map((area) => (
              <span 
                key={area}
                className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium"
              >
                {area}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
              + 20 More Cities
            </span>
          </div>
        </div>
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand Column with Trust Badges */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center shadow-gold">
                <span className="text-white font-heading font-bold text-xl">H</span>
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-white">Handledly</p>
                <p className="text-xs text-white/70 tracking-widest uppercase">Moving Services</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Denver's trusted partner for stress-free moves. Flat-rate pricing with no hidden fees.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/10" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/10" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-accent transition-colors p-2 rounded-lg hover:bg-white/10" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* License & Insurance Badges */}
            <div className="space-y-3 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-white">USDOT Licensed & $750K Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs text-white/80">BBB A+ Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-xs text-white/80">Workers' Comp Coverage</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-heading text-lg font-semibold mb-6 text-white">Quick Links</p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs font-medium text-white mb-3">We Accept</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/70">Visa, MC, Cash, Check</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="font-heading text-lg font-semibold mb-6 text-white">Our Services</p>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <Link 
                    to="/services" 
                    className="text-white/80 hover:text-accent transition-colors text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Hours */}
          <div>
            <p className="font-heading text-lg font-semibold mb-6 text-white">Contact Us</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <a href="tel:+18782187397" className="text-white hover:text-accent transition-colors text-sm font-medium block">
                    (878) 218-7397
                  </a>
                  <p className="text-xs text-white/70">Main Line</p>
                  <a href="tel:+17199203282" className="text-white/80 hover:text-accent transition-colors text-sm mt-1 block">
                    (719) 920-3282
                  </a>
                  <p className="text-xs text-white/70">Local Denver</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-0.5" />
                <a href="mailto:hello@handledly.com" className="text-white/80 hover:text-accent transition-colors text-sm">
                  hello@handledly.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-white/80 text-sm">
                  Denver Metro Area • 30+ Cities
                </span>
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-white">Business Hours</span>
              </div>
              <div className="text-sm text-white/80 space-y-1">
                <p>Mon - Fri: 7:00 AM - 8:00 PM</p>
                <p>Saturday: 7:00 AM - 6:00 PM</p>
                <p>Sunday: 8:00 AM - 5:00 PM</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-accent">Same-Day Service Available</span>
              </div>
              <p className="text-xs text-white/70 mt-2">
                Emergency & last-minute moves welcome
              </p>
            </div>
          </div>
        </div>

        {/* Quote Promise Banner */}
        <div className="mt-12 p-4 bg-accent/20 border border-accent/30 rounded-lg text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-white">
            🚚 Get Your Personal Moving Quote in <span className="text-accent">10 Minutes or Less</span> — Call Now or Fill Out Our Form
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-white/70 text-xs">
              © {currentYear} Handledly Moving Services Inc. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/70 hover:text-accent text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/70 hover:text-accent text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}