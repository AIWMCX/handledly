import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

// JSON-LD structured data for the Handledly marketplace platform.
// Handledly is the marketplace/organization schema — it does not perform moves itself,
// so it must not use a MovingCompany type or claim to offer moving services directly.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://handledly.com/#organization",
  "name": "Handledly",
  "description": "Handledly is a marketplace that connects customers with independent, licensed moving companies in the Denver metro area. Compare quotes, message movers, and book directly through the platform.",
  "url": "https://handledly.com",
  "logo": "https://handledly.com/logo.png",
  "image": "https://handledly.com/og-image.png",
  "email": "hello@handledly.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Denver",
    "addressRegion": "CO",
    "addressCountry": "US"
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
  ]
  // Note: Social media profiles will be added once created
  // "sameAs": ["https://www.facebook.com/...", "https://www.instagram.com/..."]
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
      <meta property="og:image:alt" content="Handledly — the moving marketplace" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Handledly" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content="Handledly — the moving marketplace" />
      
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