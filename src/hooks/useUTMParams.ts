import { useEffect, useMemo } from 'react';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  lead_source: string;
}

const UTM_STORAGE_KEY = 'handledly_utm_params';

/**
 * Extracts UTM parameters from URL and persists them to sessionStorage
 * for cross-page tracking during the user's session.
 */
export function useUTMParams(): UTMParams {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if any UTM params exist in URL
    const hasUtmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
      .some(param => urlParams.has(param));

    if (hasUtmParams) {
      // Extract and store UTM params
      const utmData: Partial<UTMParams> = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        lead_source: determineLeadSource(urlParams),
      };

      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      } catch (e) {
        console.warn('Failed to store UTM params:', e);
      }
    }
  }, []);

  // Retrieve stored UTM params
  const utmParams = useMemo((): UTMParams => {
    const defaultParams: UTMParams = {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      lead_source: 'website',
    };

    if (typeof window === 'undefined') return defaultParams;

    try {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        return { ...defaultParams, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to retrieve UTM params:', e);
    }

    // Check referrer for lead source if no UTM params
    return {
      ...defaultParams,
      lead_source: determineLeadSourceFromReferrer(),
    };
  }, []);

  return utmParams;
}

/**
 * Determines the lead source based on UTM params
 */
function determineLeadSource(urlParams: URLSearchParams): string {
  const source = urlParams.get('utm_source')?.toLowerCase();
  const medium = urlParams.get('utm_medium')?.toLowerCase();

  if (source === 'google' && medium === 'cpc') return 'google_ads';
  if (source === 'facebook' || source === 'instagram') return 'meta_ads';
  if (source === 'yelp') return 'yelp';
  if (source === 'gmb' || source === 'google_business') return 'google_business';
  if (medium === 'email') return 'email';
  if (medium === 'referral') return 'referral';
  if (medium === 'social') return 'social';
  if (source) return source;

  return 'paid_traffic';
}

/**
 * Determines lead source from document referrer when no UTM params
 */
function determineLeadSourceFromReferrer(): string {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';

  const referrer = document.referrer.toLowerCase();

  if (referrer.includes('google.com')) return 'google_organic';
  if (referrer.includes('bing.com')) return 'bing_organic';
  if (referrer.includes('facebook.com')) return 'facebook_organic';
  if (referrer.includes('instagram.com')) return 'instagram_organic';
  if (referrer.includes('yelp.com')) return 'yelp_organic';
  if (referrer.includes('nextdoor.com')) return 'nextdoor';

  return 'referral';
}

/**
 * Get UTM params without using a hook (for non-React contexts)
 */
export function getStoredUTMParams(): UTMParams {
  const defaultParams: UTMParams = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    lead_source: 'website',
  };

  if (typeof window === 'undefined') return defaultParams;

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return { ...defaultParams, ...JSON.parse(stored) };
    }
  } catch (e) {
    // Fallback
  }

  return defaultParams;
}
