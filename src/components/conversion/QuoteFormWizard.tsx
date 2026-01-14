import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Check, ArrowRight, ArrowLeft, Truck, MapPin, User, Sparkles, Clock, Shield, CalendarIcon, Home, BedDouble, Phone, Mail, Navigation, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { ConversionEvents, PageTiming } from '@/lib/analytics';
import { QuoteFormData, ServiceType, PropertyType } from '@/types/conversion';
import { cn } from '@/lib/utils';

// Parse date string as local date to avoid timezone offset issues
const parseLocalDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

interface QuoteFormWizardProps {
  onSubmit: (data: QuoteFormData) => Promise<void>;
  initialServiceType?: ServiceType;
  className?: string;
}

const STEPS = [
  { id: 1, title: 'Service', icon: Truck, description: 'Choose your move type' },
  { id: 2, title: 'Details', icon: MapPin, description: 'Move information' },
  { id: 3, title: 'Contact', icon: User, description: 'Your information' },
];

const SERVICE_OPTIONS: { value: ServiceType; label: string; popular?: boolean }[] = [
  { value: 'local-moving', label: 'Local Moving', popular: true },
  { value: 'residential', label: 'Residential Moving', popular: true },
  { value: 'long-distance', label: 'Long Distance Moving' },
  { value: 'same-day', label: 'Same-Day Moving' },
  { value: 'piano-moving', label: 'Piano Moving' },
  { value: 'pool-table', label: 'Pool Table Moving' },
  { value: 'safe-moving', label: 'Safe Moving' },
  { value: 'heavy-items', label: 'Heavy Item Moving' },
  { value: 'junk-removal', label: 'Junk Removal' },
  { value: 'moving-help', label: 'Moving Help / Labor' },
];

const PROPERTY_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'house', label: 'House' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'office', label: 'Office' },
  { value: 'storage', label: 'Storage Unit' },
];

const initialFormData: QuoteFormData = {
  serviceType: 'local-moving',
  moveFromAddress: '',
  moveToAddress: '',
  moveDate: '',
  propertyType: 'apartment',
  bedrooms: 1,
  hasStairs: false,
  floorNumber: 1,
  fullName: '',
  phone: '',
  email: '',
  notes: '',
  preferEmailOnly: false,
  crewSize: 2,
  estimatedHours: 3,
};

export function QuoteFormWizard({ onSubmit, initialServiceType, className }: QuoteFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<QuoteFormData>({
    ...initialFormData,
    serviceType: initialServiceType || 'local-moving',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Form persistence
  const { savedData, saveData, clearData, hasRestoredData, markRestored } = useFormPersistence<QuoteFormData>({
    formId: 'quote_wizard',
  });

  // Restore saved data on mount
  useEffect(() => {
    if (savedData && !hasRestoredData) {
      setFormData(savedData.data);
      setCurrentStep(savedData.step);
      setCompletedSteps(savedData.completedSteps);
      setShowWelcomeBack(true);
      markRestored();

      // Hide welcome back message after 5 seconds
      setTimeout(() => setShowWelcomeBack(false), 5000);
    }
  }, [savedData, hasRestoredData, markRestored]);

  // Track form start
  useEffect(() => {
    ConversionEvents.formStarted('quote_wizard');
    PageTiming.reset();
  }, []);

  // Auto-save on data change
  useEffect(() => {
    saveData(formData, currentStep, completedSteps);
  }, [formData, currentStep, completedSteps, saveData]);

  // Update form data
  const updateFormData = (updates: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.serviceType;
      case 2:
        return !!(formData.moveFromAddress && formData.moveDate);
      case 3:
        return !!(formData.fullName && formData.phone && formData.email);
      default:
        return false;
    }
  };

  // Go to next step
  const nextStep = () => {
    if (!validateStep(currentStep)) return;

    // Track step completion
    const timeSpent = Math.round((Date.now() - stepStartTime) / 1000);
    ConversionEvents.formStepCompleted(currentStep, timeSpent, 'quote_wizard');

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
    setStepStartTime(Date.now());
  };

  // Go to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setStepStartTime(Date.now());
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Track final step
      const timeSpent = Math.round((Date.now() - stepStartTime) / 1000);
      ConversionEvents.formStepCompleted(3, timeSpent, 'quote_wizard');

      await onSubmit(formData);
      
      // Clear saved data on success
      clearData();
      
      ConversionEvents.formSubmitted('quote_wizard');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estimate preview
  const estimatedQuote = useMemo(() => {
    const baseRates: Record<ServiceType, number> = {
      'local-moving': 149,
      'residential': 149,
      'long-distance': 199,
      'same-day': 179,
      'piano-moving': 249,
      'pool-table': 299,
      'safe-moving': 199,
      'heavy-items': 179,
      'junk-removal': 99,
      'moving-help': 129,
    };

    const baseRate = baseRates[formData.serviceType] || 149;
    const hours = formData.estimatedHours;
    const crewMultiplier = formData.crewSize / 2;
    const stairsFee = formData.hasStairs ? 50 : 0;

    const low = Math.round(baseRate * hours * crewMultiplier * 0.9 + stairsFee);
    const high = Math.round(baseRate * hours * crewMultiplier * 1.1 + stairsFee);

    return { low, high };
  }, [formData]);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Welcome Back Banner */}
      <AnimatePresence>
        {showWelcomeBack && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium">
              Welcome back! We saved your progress. Pick up where you left off.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => {
                  if (completedSteps.includes(step.id) || step.id <= currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-2 transition-all duration-300',
                  step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    completedSteps.includes(step.id)
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-accent text-accent-foreground ring-4 ring-accent/30'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-sm font-semibold',
                    step.id === currentStep ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </button>
              
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: '0%' }}
                    animate={{
                      width: completedSteps.includes(step.id) ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">What type of move do you need?</h3>
                <p className="text-muted-foreground">Select the service that best fits your needs</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SERVICE_OPTIONS.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => updateFormData({ serviceType: service.value })}
                    className={cn(
                      'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                      formData.serviceType === service.value
                        ? 'border-accent bg-accent/10 shadow-lg'
                        : 'border-border hover:border-accent/50 hover:bg-muted/50'
                    )}
                  >
                    {service.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                        Popular
                      </span>
                    )}
                    <span className="font-medium">{service.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Move Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">Tell us about your move</h3>
                <p className="text-muted-foreground">This helps us provide an accurate estimate</p>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-2.5">
                  <Label htmlFor="moveFromAddress" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                    <MapPin className="w-4 h-4 text-accent" />
                    Moving From <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="moveFromAddress"
                    placeholder="Enter your current address"
                    value={formData.moveFromAddress}
                    onChange={(e) => updateFormData({ moveFromAddress: e.target.value })}
                  />
                </div>

                <div className="grid gap-2.5">
                  <Label htmlFor="moveToAddress" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                    <Navigation className="w-4 h-4 text-accent" />
                    Moving To
                  </Label>
                  <Input
                    id="moveToAddress"
                    placeholder="Enter your destination address"
                    value={formData.moveToAddress}
                    onChange={(e) => updateFormData({ moveToAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                      <CalendarIcon className="w-4 h-4 text-accent" />
                      Move Date <span className="text-accent">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11 border-2 border-input/80 bg-white/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200",
                            !formData.moveDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formData.moveDate 
                            ? format(parseLocalDate(formData.moveDate)!, "MMMM d, yyyy")
                            : "Select your move date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parseLocalDate(formData.moveDate)}
                          onSelect={(date) => updateFormData({ 
                            moveDate: date ? format(date, 'yyyy-MM-dd') : '' 
                          })}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2.5">
                    <Label htmlFor="propertyType" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                      <Home className="w-4 h-4 text-accent" />
                      Property Type
                    </Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value: PropertyType) => updateFormData({ propertyType: value })}
                    >
                      <SelectTrigger id="propertyType" className="h-11 border-2 border-input/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label htmlFor="bedrooms" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                      <BedDouble className="w-4 h-4 text-accent" />
                      Bedrooms
                    </Label>
                    <Select
                      value={formData.bedrooms.toString()}
                      onValueChange={(value) => updateFormData({ bedrooms: parseInt(value) })}
                    >
                      <SelectTrigger id="bedrooms" className="h-11 border-2 border-input/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Bedroom{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 mt-8">
                    <Checkbox
                      id="hasStairs"
                      checked={formData.hasStairs}
                      onCheckedChange={(checked) => updateFormData({ hasStairs: !!checked })}
                      className="h-5 w-5"
                    />
                    <Label htmlFor="hasStairs" className="cursor-pointer font-medium">
                      Has stairs
                    </Label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">Almost there! Your contact info</h3>
                <p className="text-muted-foreground">We'll send your detailed quote within 10 minutes</p>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-2.5">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                    <User className="w-4 h-4 text-accent" />
                    Full Name <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData({ fullName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                      <Phone className="w-4 h-4 text-accent" />
                      Phone Number <span className="text-accent">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(303) 555-0123"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2.5">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                      <Mail className="w-4 h-4 text-accent" />
                      Email <span className="text-accent">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90">
                    <FileText className="w-4 h-4 text-accent" />
                    Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or items to mention?"
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    rows={3}
                    className="border-2 border-input/80"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="preferEmailOnly"
                    checked={formData.preferEmailOnly}
                    onCheckedChange={(checked) => updateFormData({ preferEmailOnly: !!checked })}
                  />
                  <Label htmlFor="preferEmailOnly" className="cursor-pointer text-sm">
                    I prefer email communication only (no phone calls)
                  </Label>
                </div>
              </div>

              {/* Quote Preview */}
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Estimated Quote</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    94.6% accuracy
                  </span>
                </div>
                <p className="text-2xl font-bold text-accent">
                  ${estimatedQuote.low} - ${estimatedQuote.high}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Final quote confirmed within 10 minutes
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!validateStep(3) || isSubmitting}
            className="gap-2 bg-accent hover:bg-accent/90 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Get My Quote
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          SSL Secured
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Response in 10 min
        </span>
        <span>No spam, ever</span>
      </div>
    </div>
  );
}

export default QuoteFormWizard;
