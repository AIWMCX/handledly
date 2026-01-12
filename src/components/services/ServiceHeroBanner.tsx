import { Link } from "react-router-dom";
import { ChevronRight, Star, Users, MapPin, Package } from "lucide-react";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";

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
        <div className="gradient-gold p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 mb-4">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-white/90 text-xs uppercase tracking-wider">Denver Metro Area</span>
            </div>
            
            <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-white mb-4">
              {tagline}
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-white fill-white" />
                ))}
              </div>
              <span className="text-white/90 text-sm">4.9 Rating • 500+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Right - Stats Section */}
        <div className="bg-primary p-8 lg:p-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-6">
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
              <p className="text-xs text-white/70 mt-1">Denver Cities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl lg:text-3xl font-heading font-semibold text-white">15K+</p>
              <p className="text-xs text-white/70 mt-1">Moves Completed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}