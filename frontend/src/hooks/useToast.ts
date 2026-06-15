import { useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '../store/uiStore';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing toast notifications with automatic cleanup
 * Prevents memory leaks from setTimeout not being cleared on unmount
 */
export const useToastCleanup = () => {
  const timeoutRef = useRef<number | undefined>(undefined);

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

/**
 * Hook for react-hot-toast integration (E6-S2)
 * Provides simplified API for showing toasts in forms and async operations
 * Usage: const { showSuccess, showError, showLoading } = useToast();
 */
export interface UseToastReturn {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showLoading: (message: string) => string;
  dismissToast: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const showSuccess = useCallback(
    (message: string, duration: number = 3000) => {
      toast.success(message, {
        duration,
        position: 'bottom-right',
      });
    },
    []
  );

  const showError = useCallback(
    (message: string, duration: number = 5000) => {
      toast.error(message, {
        duration,
        position: 'bottom-right',
      });
    },
    []
  );

  const showLoading = useCallback((message: string) => {
    return toast.loading(message, {
      position: 'bottom-right',
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  return {
    showSuccess,
    showError,
    showLoading,
    dismissToast,
  };
};

export default useToast;
