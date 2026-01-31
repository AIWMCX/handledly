import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Shield, TrendingDown, Info } from 'lucide-react';
import { ServiceType, QuotePreview, QuoteBreakdown } from '@/types/conversion';
import { ConversionEvents } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { calculateQuote, isIronLawService } from '@/lib/quoteCalculator';

interface InstantQuotePreviewProps {
  serviceType: ServiceType;
  bedrooms?: number;
  hasStairs?: boolean;
  crewSize?: number;
  estimatedHours?: number;
  distance?: number;
  showBreakdown?: boolean;
  className?: string;
}

// Bedroom to hours mapping (fallback if estimatedHours not provided)
const BEDROOM_HOURS: Record<number, number> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 8,
};

export function InstantQuotePreview({
  serviceType,
  bedrooms = 2,
  hasStairs = false,
  crewSize = 2,
  estimatedHours,
  distance,
  showBreakdown = true,
  className,
}: InstantQuotePreviewProps) {
  const quote = useMemo((): QuotePreview => {
    const hours = estimatedHours || BEDROOM_HOURS[bedrooms] || 3;
    
    // Map service type to calculator format
    const mapToCalcServiceType = (type: ServiceType): 'local-moving' | 'heavy-items' => {
      if (['piano-moving', 'pool-table', 'safe-moving', 'heavy-items'].includes(type)) {
        return 'heavy-items';
      }
      return 'local-moving';
    };
    
    // Get crew config based on crew size
    const getCrewConfig = (size: number, type: ServiceType): string | undefined => {
      if (isIronLawService(type)) return undefined;
      if (size <= 2) return 'moving-2-movers';
      if (size === 3) return 'moving-3-movers';
      return 'moving-4-movers';
    };

    // Use centralized calculator - matches email/database exactly
    const calcResult = calculateQuote({
      serviceType: mapToCalcServiceType(serviceType),
      subType: serviceType,
      bedrooms,
      crewConfig: getCrewConfig(crewSize, serviceType),
      estimatedHours: hours,
    });
    
    // Range is ±10%
    const low = Math.round(calcResult.total * 0.9);
    const high = Math.round(calcResult.total * 1.1);

    const breakdown: QuoteBreakdown = {
      baseRate: calcResult.hourlyRate,
      estimatedHours: calcResult.estimatedHours,
      crewCost: calcResult.laborCost,
      travelFee: 0, // No hidden fees in our pricing model
      specialtyFees: calcResult.specialtyFee,
      total: calcResult.total,
    };

    // Track quote preview
    ConversionEvents.quotePreviewed(serviceType, calcResult.total);

    return {
      estimatedLow: low,
      estimatedHigh: high,
      confidence: 94.6,
      breakdown,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }, [serviceType, bedrooms, crewSize, estimatedHours]);

  return (
    <motion.div
      className={cn(
        'p-6 rounded-2xl',
        'bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5',
        'border border-accent/20',
        'shadow-lg shadow-accent/5',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold">Instant Estimate</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>{quote.confidence}% accurate</span>
        </div>
      </div>

      {/* Main Quote */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-lg text-muted-foreground">$</span>
          <motion.span
            className="text-4xl font-bold text-foreground"
            key={quote.estimatedLow}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {quote.estimatedLow}
          </motion.span>
          <span className="text-lg text-muted-foreground mx-1">-</span>
          <span className="text-lg text-muted-foreground">$</span>
          <motion.span
            className="text-4xl font-bold text-foreground"
            key={quote.estimatedHigh}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {quote.estimatedHigh}
          </motion.span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Estimated total for your move
        </p>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="space-y-2 py-4 border-t border-accent/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base rate</span>
            <span className="font-medium">${quote.breakdown.baseRate}/hr</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Est. duration</span>
            <span className="font-medium">{quote.breakdown.estimatedHours} hours</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Crew ({crewSize} movers)</span>
            <span className="font-medium">${quote.breakdown.crewCost}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Travel fee</span>
            <span className="font-medium">${quote.breakdown.travelFee}</span>
          </div>
          {quote.breakdown.specialtyFees > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Additional fees</span>
              <span className="font-medium">${quote.breakdown.specialtyFees}</span>
            </div>
          )}
        </div>
      )}

      {/* Value indicators */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-accent/20">
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="w-3 h-3" />
          <span>No hidden fees</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Final quote in 10 min</span>
        </div>
      </div>

      {/* CTA */}
      <motion.button
        className={cn(
          'w-full mt-4 py-3 rounded-xl font-semibold',
          'bg-accent text-accent-foreground',
          'hover:bg-accent/90 transition-colors',
          'shadow-lg shadow-accent/20'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Lock In This Rate
      </motion.button>
    </motion.div>
  );
}

export default InstantQuotePreview;
