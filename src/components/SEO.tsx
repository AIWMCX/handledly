import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

export function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage, 
  keywords, 
  type = 'website' 
}: SEOProps) {
  const siteUrl = 'https://handledly.com';
  const defaultOgImage = '/og-image.png';
  const fullOgImage = ogImage || defaultOgImage;
  
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
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Handledly Moving Services" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="geo.region" content="US-CO" />
      <meta name="geo.placename" content="Denver" />
    </Helmet>
  );
}
