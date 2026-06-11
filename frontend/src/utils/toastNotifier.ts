/**
 * Toast Notifications Utility
 * Wrapper around react-hot-toast with consistent styling and patterns
 */

import toast from 'react-hot-toast';

export const toastNotifier = {
  /**
   * Success notification (green)
   */
  success: (message: string, duration = 3000) => {
    toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontWeight: '500',
      },
    });
  },

  /**
   * Error notification (red)
   */
  error: (message: string, duration = 4000) => {
    toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontWeight: '500',
      },
    });
  },

  /**
   * Info notification (blue)
   */
  info: (message: string, duration = 3000) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontWeight: '500',
      },
    });
  },

  /**
   * Warning notification (amber)
   */
  warning: (message: string, duration = 3500) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontWeight: '500',
      },
    });
  },

  /**
   * Loading notification (stays until dismissed)
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontWeight: '500',
      },
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Update a loading toast with success
   */
  updateSuccess: (toastId: string, message: string) => {
    toast.success(message, {
      id: toastId,
      duration: 3000,
    });
  },

  /**
   * Update a loading toast with error
   */
  updateError: (toastId: string, message: string) => {
    toast.error(message, {
      id: toastId,
      duration: 4000,
    });
  },
};
