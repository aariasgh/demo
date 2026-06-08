import { useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';

/**
 * Custom hook for managing toast notifications with automatic cleanup
 * Prevents memory leaks from setTimeout not being cleared on unmount
 */
export const useToastCleanup = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    setToastTimeout: (callback: () => void, duration: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(callback, duration);
    },
    clearToastTimeout: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
  };
};

/**
 * Hook for showing a toast with proper cleanup
 * Usage: const showToastWithCleanup = useShowToastWithCleanup();
 *        showToastWithCleanup('Message', 'success');
 */
export const useShowToastWithCleanup = () => {
  const { closeToast, showToast } = useUIStore();
  const { setToastTimeout } = useToastCleanup();

  return (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) => {
    showToast(message, type);
    setToastTimeout(() => closeToast(), duration);
  };
};
