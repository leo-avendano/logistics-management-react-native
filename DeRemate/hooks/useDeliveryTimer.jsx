import { useState, useEffect, useCallback } from 'react';
import { DELIVERY_CONFIG } from '../constants/deliveryConfig';

export const useDeliveryTimer = (onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(DELIVERY_CONFIG.TIMER_DURATION);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, DELIVERY_CONFIG.TIMER_INTERVAL);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const isTimeRunningOut = timeLeft <= DELIVERY_CONFIG.WARNING_THRESHOLD;

  return { timeLeft, formatTime, isTimeRunningOut };
};