import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header, Footer, Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Home, Phone, FileText, Search, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Page Not Found | Handledly"
        description="Sorry, the page you're looking for doesn't exist. Get back to comparing verified Denver movers on Handledly."
      />
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Visual */}
            <div className="relative mb-8">
              <div className="text-[10rem] md:text-[14rem] font-heading font-bold text-primary/5 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full gradient-gold flex items-center justify-center shadow-gold">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
            
            {/* Message */}
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-primary mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              The page you're looking for might have been moved or doesn't exist. 
              Let's get you back on track!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="gradient-gold text-white hover:opacity-90 shadow-gold w-full sm:w-auto">
                <Link to="/">
                  <Home className="mr-2 w-5 h-5" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/quote">
                  <FileText className="mr-2 w-5 h-5" />
                  Get a Quote
                </Link>
              </Button>
            </div>
            
            {/* Quick Links */}
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
              <p className="text-sm font-medium text-primary mb-4">Quick Links</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-background hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Our Services
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link 
                  to="/about" 
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-background hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-background hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            
            {/* Phone CTA */}
            <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-accent" />
              <span className="text-sm">Need help? Call us at</span>
              <a href="tel:+18782187397" className="text-accent font-medium hover:underline">
                (878) 218-7397
              </a>
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
