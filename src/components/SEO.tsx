import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

// JSON-LD structured data for LocalBusiness (Handledly Moving Services)
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  "@id": "https://handledly.com/#organization",
  "name": "Handledly Moving Services",
  "alternateName": "Handledly",
  "description": "Denver's #1 rated professional moving company. Flat hourly rates, no hidden fees. Local moves, heavy items, pianos, safes, same-day service.",
  "url": "https://handledly.com",
  "logo": "https://handledly.com/logo.png",
  "image": "https://handledly.com/og-image.png",
  "telephone": ["+1-878-218-7397", "+1-719-920-3282"],
  "email": "hello@handledly.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Denver",
    "addressRegion": "CO",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.7392,
    "longitude": -104.9903
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Denver",
      "containedInPlace": {
        "@type": "State",
        "name": "Colorado"
      }
    },
    {
      "@type": "City",
      "name": "Aurora"
    },
    {
      "@type": "City",
      "name": "Lakewood"
    },
    {
      "@type": "City",
      "name": "Arvada"
    },
    {
      "@type": "City",
      "name": "Westminster"
    },
    {
      "@type": "City",
      "name": "Thornton"
    },
    {
      "@type": "City",
      "name": "Centennial"
    },
    {
      "@type": "City",
      "name": "Boulder"
    }
  ],
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Cash, Credit Card, Debit Card",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "07:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "08:00",
      "closes": "17:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "500",
    "bestRating": "5",
    "worstRating": "1"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Moving Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Local Moving",
          "description": "Professional local moving services in Denver metro area"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Residential Moving",
          "description": "Full-service residential moving for apartments, condos, and houses"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Piano Moving",
          "description": "Specialized piano moving with experienced professionals"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Pool Table Moving",
          "description": "Expert pool table disassembly, moving, and reassembly"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Safe Moving",
          "description": "Heavy safe moving with proper equipment and techniques"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Same-Day Moving",
          "description": "Last-minute and same-day moving services available"
        }
      }
    ]
  },
  "sameAs": [
    "https://www.facebook.com/handledlymoving",
    "https://www.instagram.com/handledlymoving",
    "https://www.yelp.com/biz/handledly-moving-services-denver"
  ]
};

export function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage, 
  keywords, 
  type = 'website' 
}: SEOProps) {
  const siteUrl = 'https://handledly.com';
  const defaultOgImage = `${siteUrl}/og-image.png`;
  const fullOgImage = ogImage?.startsWith('http') ? ogImage : `${siteUrl}${ogImage || '/og-image.png'}`;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Handledly Moving Services - Denver's #1 Rated Movers" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Handledly Moving Services" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content="Handledly Moving Services - Denver's #1 Rated Movers" />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="geo.region" content="US-CO" />
      <meta name="geo.placename" content="Denver" />
      <meta name="geo.position" content="39.7392;-104.9903" />
      <meta name="ICBM" content="39.7392, -104.9903" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
}