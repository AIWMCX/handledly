import { useState, useEffect, useCallback, useRef } from 'react';
import { SocialProofNotification, DENVER_NEIGHBORHOODS, COMMON_NAMES } from '@/types/conversion';
import { SocialProofStorage } from '@/lib/storage';
import { ConversionEvents } from '@/lib/analytics';

interface UseSocialProofOptions {
  enabled?: boolean;
  intervalMin?: number; // minimum seconds between notifications
  intervalMax?: number; // maximum seconds between notifications
  autoHideDuration?: number; // seconds to show each notification
  maxNotifications?: number; // max to show per session
}

interface UseSocialProofReturn {
  currentNotification: SocialProofNotification | null;
  liveViewers: number;
  dismissNotification: () => void;
  pauseNotifications: () => void;
  resumeNotifications: () => void;
  isPaused: boolean;
}

// Service types for realistic notifications
const SERVICES = [
  'local move',
  'piano moving',
  'same-day moving',
  'junk removal',
  'furniture moving',
  'office relocation',
  'apartment move',
];

// Generate realistic booking notification
const generateBookingNotification = (): SocialProofNotification => {
  const name = COMMON_NAMES[Math.floor(Math.random() * COMMON_NAMES.length)];
  const neighborhood = DENVER_NEIGHBORHOODS[Math.floor(Math.random() * DENVER_NEIGHBORHOODS.length)];
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  
  return {
    id: `booking_${Date.now()}`,
    type: 'booking',
    message: `${name} from ${neighborhood} just booked a ${service}`,
    name,
    neighborhood,
    service,
    timestamp: new Date(),
  };
};

// Generate "recent activity" notification
const generateRecentNotification = (): SocialProofNotification => {
  const minutes = Math.floor(Math.random() * 10) + 1;
  
  return {
    id: `recent_${Date.now()}`,
    type: 'recent',
    message: `Last booking: ${minutes} minute${minutes > 1 ? 's' : ''} ago`,
    timestamp: new Date(),
  };
};

// Generate "viewers" notification
const generateViewerNotification = (viewers: number): SocialProofNotification => {
  return {
    id: `viewing_${Date.now()}`,
    type: 'viewing',
    message: `${viewers} people are viewing this page right now`,
    timestamp: new Date(),
  };
};

// Generate random notification
const generateNotification = (viewers: number): SocialProofNotification => {
  const types = ['booking', 'booking', 'booking', 'recent', 'viewing']; // Weighted towards bookings
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch (type) {
    case 'viewing':
      return generateViewerNotification(viewers);
    case 'recent':
      return generateRecentNotification();
    default:
      return generateBookingNotification();
  }
};

export function useSocialProof(options: UseSocialProofOptions = {}): UseSocialProofReturn {
  const {
    enabled = true,
    intervalMin = 30,
    intervalMax = 60,
    autoHideDuration = 5,
    maxNotifications = 10,
  } = options;

  const [currentNotification, setCurrentNotification] = useState<SocialProofNotification | null>(null);
  const [liveViewers, setLiveViewers] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize live viewers with realistic number
  useEffect(() => {
    // Base viewers between 8-15, with some randomness
    const baseViewers = Math.floor(Math.random() * 8) + 8;
    setLiveViewers(baseViewers);

    // Periodically fluctuate viewer count
    const viewerInterval = setInterval(() => {
      setLiveViewers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newCount = Math.max(5, Math.min(25, prev + change)); // Keep between 5-25
        return newCount;
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(viewerInterval);
  }, []);

  // Show notification function
  const showNotification = useCallback(() => {
    if (!enabled || isPaused || notificationCount >= maxNotifications) return;

    const notification = generateNotification(liveViewers);
    setCurrentNotification(notification);
    setNotificationCount((prev) => prev + 1);

    // Track view
    SocialProofStorage.trackViewed(notification.id);
    ConversionEvents.socialProofViewed(notification.type, window.location.pathname);

    // Auto-hide after duration
    hideTimeoutRef.current = setTimeout(() => {
      setCurrentNotification(null);
    }, autoHideDuration * 1000);
  }, [enabled, isPaused, notificationCount, maxNotifications, liveViewers, autoHideDuration]);

  // Schedule next notification
  const scheduleNextNotification = useCallback(() => {
    if (!enabled || isPaused) return;

    const delay = (Math.random() * (intervalMax - intervalMin) + intervalMin) * 1000;
    
    timeoutRef.current = setTimeout(() => {
      showNotification();
      scheduleNextNotification();
    }, delay);
  }, [enabled, isPaused, intervalMin, intervalMax, showNotification]);

  // Start notification cycle
  useEffect(() => {
    if (!enabled) return;

    // Initial delay before first notification
    const initialDelay = 10000; // 10 seconds
    
    timeoutRef.current = setTimeout(() => {
      showNotification();
      scheduleNextNotification();
    }, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [enabled, scheduleNextNotification, showNotification]);

  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  const pauseNotifications = useCallback(() => {
    setIsPaused(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setCurrentNotification(null);
  }, []);

  const resumeNotifications = useCallback(() => {
    setIsPaused(false);
    scheduleNextNotification();
  }, [scheduleNextNotification]);

  return {
    currentNotification,
    liveViewers,
    dismissNotification,
    pauseNotifications,
    resumeNotifications,
    isPaused,
  };
}

export default useSocialProof;
