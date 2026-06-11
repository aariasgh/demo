/**
 * Phase 5: Polish & Edge Cases Configuration
 * Centralized settings for retry logic, timeouts, refresh intervals
 */

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 500,
  MAX_DELAY_MS: 5000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// Request Timeouts
export const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const API_RESPONSE_TIMEOUT_MS = 5000; // 5 seconds for response body

// Auto-Refresh Intervals
export const REFRESH_INTERVALS = {
  AT_RISK_LEADS: 5 * 60 * 1000, // 5 minutes for at-risk widget
  KANBAN_DATA: 10 * 60 * 1000, // 10 minutes for full kanban data
  SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes for search results
} as const;

// Toast Notification Durations
export const TOAST_DURATION_MS = {
  SUCCESS: 3000,
  ERROR: 4000,
  WARNING: 3500,
  INFO: 3000,
  LOADING: 0, // Stays until dismissed
} as const;

// Error Messages - Localized
export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Por favor verifica tu internet.',
  TIMEOUT: 'Tiempo de espera agotado. Por favor intenta de nuevo.',
  SERVER: 'El servidor está experimentando problemas. Por favor intenta más tarde.',
  CLIENT: 'Error del cliente. Por favor verifica tu solicitud.',
  UNKNOWN: 'Error desconocido. Por favor intenta de nuevo.',
} as const;

// Success Messages - Localized
export const SUCCESS_MESSAGES = {
  LEADS_UPDATED: 'Leads actualizados correctamente',
  LEADS_LOADED: 'Leads cargados correctamente',
  OPERATION_COMPLETED: 'Operación completada exitosamente',
} as const;

// Feature Flags for Phase 5
export const PHASE5_FEATURES = {
  ENABLE_TOAST_NOTIFICATIONS: true,
  ENABLE_RETRY_LOGIC: true,
  ENABLE_SKELETON_LOADERS: true,
  ENABLE_AUTO_REFRESH: true,
  ENABLE_ERROR_RECOVERY: true,
  ENABLE_TIMEZONE_HANDLING: true,
  DEBUG_LOGGING: import.meta.env.DEV,
} as const;
