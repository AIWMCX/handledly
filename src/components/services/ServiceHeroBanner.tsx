import { Link } from "react-router-dom";
import { ChevronRight, Star, Users, MapPin, Package } from "lucide-react";

interface ServiceHeroBannerProps {
  serviceName: string;
  tagline: string;
}

export function ServiceHeroBanner({ serviceName, tagline }: ServiceHeroBannerProps) {
  return (
    <section className="pt-28 lg:pt-32">
      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-accent font-medium">{serviceName}</span>
          </nav>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid md:grid-cols-2">
        {/* Left - Gold Section */}
        <div className="gradient-gold p-8 lg:p-12 flex flex-col justify-center">
          <p className="text-white/80 text-sm uppercase tracking-wider mb-2">
            Denver Premium Moving
          </p>
          <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-white mb-4">
            {tagline}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-white fill-white" />
              ))}
            </div>
            <span className="text-white/90 text-sm">5+ Years of Excellence</span>
          </div>
        </div>

        {/* Right - Stats Section */}
        <div className="bg-primary p-8 lg:p-12">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-semibold text-white">97%</p>
              <p className="text-xs text-white/70 mt-1">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-semibold text-white">30+</p>
              <p className="text-xs text-white/70 mt-1">Cities Served</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-semibold text-white">15K+</p>
              <p className="text-xs text-white/70 mt-1">Boxes Moved</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}