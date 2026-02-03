import { useState, useEffect } from "react";
import { Shield, CheckCircle, Star, Phone, MapPin } from "lucide-react";
const messages = [{
  icon: Shield,
  text: "NO HIDDEN FEES — FLAT HOURLY RATE",
  highlight: true
}, {
  icon: Star,
  text: "500+ 5-STAR GOOGLE REVIEWS",
  highlight: false
}, {
  icon: CheckCircle,
  text: "SAME-DAY SERVICE AVAILABLE",
  highlight: false
}, {
  icon: MapPin,
  text: "SERVING 30+ DENVER METRO CITIES",
  highlight: false
}];
export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const currentMessage = messages[currentIndex];
  return <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-white py-2.5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          {/* Main rotating message */}
          <div className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <currentMessage.icon className="w-4 h-4 text-accent" />
            <span>{currentMessage.text}</span>
          </div>

          {/* Separator and phones - desktop only */}
          <div className="hidden lg:flex items-center gap-4">
            <span className="text-white/40">|</span>
            <a href="tel:+18782187397" className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
              <Phone className="w-3.5 h-3.5" />
              (878) 218-7397
            </a>
            <span className="text-white/40">|</span>
            <a href="tel:+17199203282" className="text-sm font-medium hover:text-accent transition-colors">
              (719) 920-3282
            </a>
          </div>

          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            {messages.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-accent" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>;
}